import type { Server, Socket } from "socket.io";
import { randomBytes } from "crypto";
import { prisma } from "@placepro/database";
import {
  COLLAB_COLORS,
  type CollabChatMessage,
  type CollabCursor,
  type CollabParticipant,
  type CollabRoomState,
} from "@placepro/shared";
import {
  ensureLiveRoom,
  getLiveRoom,
  listCursors,
  listParticipants,
  removeLiveRoom,
  type LiveCollabRoom,
} from "./collabRooms.js";

const ROOM_PREFIX = "collab:";

function roomChannel(roomCode: string) {
  return `${ROOM_PREFIX}${roomCode.toUpperCase()}`;
}

function pickColor(index: number) {
  return COLLAB_COLORS[index % COLLAB_COLORS.length]!;
}

function chatId() {
  return randomBytes(8).toString("hex");
}

function buildState(room: LiveCollabRoom): CollabRoomState {
  return {
    roomId: room.roomId,
    roomCode: room.roomCode,
    title: room.title,
    language: room.language,
    code: room.code,
    participants: listParticipants(room),
    cursors: listCursors(room),
    chat: room.chat.slice(-100),
  };
}

async function persistCode(roomCode: string, code: string) {
  try {
    await prisma.collaborativeCodingRoom.update({
      where: { roomCode: roomCode.toUpperCase() },
      data: { code },
    });
  } catch {
    /* room may be demo-only in memory */
  }
}

interface JoinPayload {
  roomCode: string;
  userId: string;
  name: string;
  bootstrap?: {
    roomId: string;
    title: string;
    language: string;
    code: string;
  };
}

interface CodePayload {
  roomCode: string;
  code: string;
}

interface CursorPayload {
  roomCode: string;
  lineNumber: number;
  column: number;
}

interface ChatPayload {
  roomCode: string;
  message: string;
}

interface LanguagePayload {
  roomCode: string;
  language: string;
}

export function registerCollabHandlers(io: Server, socket: Socket) {
  const meta = socket.data as {
    collabRoom?: string;
    userId?: string;
    name?: string;
    color?: string;
  };

  socket.on("collab:join", async (payload: JoinPayload, ack?: (res: unknown) => void) => {
    const roomCode = payload?.roomCode?.toUpperCase();
    if (!roomCode || !payload.userId || !payload.name) {
      ack?.({ ok: false, error: "Invalid join payload" });
      return;
    }

    let room = getLiveRoom(roomCode);
    if (!room) {
      const dbRoom = await prisma.collaborativeCodingRoom.findUnique({
        where: { roomCode },
      });
      if (dbRoom) {
        room = ensureLiveRoom({
          roomId: dbRoom.id,
          roomCode: dbRoom.roomCode,
          title: dbRoom.title,
          language: dbRoom.language,
          code: dbRoom.code,
        });
      } else if (payload.bootstrap) {
        room = ensureLiveRoom({
          roomId: payload.bootstrap.roomId,
          roomCode,
          title: payload.bootstrap.title,
          language: payload.bootstrap.language,
          code: payload.bootstrap.code,
        });
      } else {
        ack?.({ ok: false, error: "Room not found" });
        return;
      }
    }

    const participantIndex = room.participants.size;
    const color = pickColor(participantIndex);
    const participant: CollabParticipant = {
      socketId: socket.id,
      userId: payload.userId,
      name: payload.name.slice(0, 40),
      color,
      isHost: room.hostSocketId === null,
    };

    if (participant.isHost) {
      room.hostSocketId = socket.id;
    }

    room.participants.set(socket.id, participant);
    meta.collabRoom = roomCode;
    meta.userId = payload.userId;
    meta.name = participant.name;
    meta.color = color;

    await socket.join(roomChannel(roomCode));

    const systemMsg: CollabChatMessage = {
      id: chatId(),
      userId: "system",
      name: "System",
      color: "#64748b",
      message: `${participant.name} joined the session`,
      createdAt: new Date().toISOString(),
    };
    room.chat.push(systemMsg);

    io.to(roomChannel(roomCode)).emit("collab:participants", listParticipants(room));
    io.to(roomChannel(roomCode)).emit("collab:chat", systemMsg);

    ack?.({ ok: true, state: buildState(room) });
    socket.to(roomChannel(roomCode)).emit("collab:participants", listParticipants(room));
  });

  socket.on("collab:code", (payload: CodePayload) => {
    const roomCode = payload?.roomCode?.toUpperCase();
    if (!roomCode || typeof payload.code !== "string") return;
    const room = getLiveRoom(roomCode);
    if (!room) return;
    room.code = payload.code;
    socket.to(roomChannel(roomCode)).emit("collab:code", {
      code: payload.code,
      fromSocketId: socket.id,
    });
    void persistCode(roomCode, payload.code);
  });

  socket.on("collab:cursor", (payload: CursorPayload) => {
    const roomCode = payload?.roomCode?.toUpperCase();
    if (!roomCode) return;
    const room = getLiveRoom(roomCode);
    if (!room) return;
    const participant = room.participants.get(socket.id);
    if (!participant) return;

    const cursor: CollabCursor = {
      socketId: socket.id,
      userId: participant.userId,
      name: participant.name,
      color: participant.color,
      lineNumber: payload.lineNumber,
      column: payload.column,
    };
    room.cursors.set(socket.id, cursor);
    socket.to(roomChannel(roomCode)).emit("collab:cursor", cursor);
  });

  socket.on("collab:chat", (payload: ChatPayload) => {
    const roomCode = payload?.roomCode?.toUpperCase();
    const text = payload?.message?.trim();
    if (!roomCode || !text) return;
    const room = getLiveRoom(roomCode);
    if (!room) return;
    const participant = room.participants.get(socket.id);
    if (!participant) return;

    const msg: CollabChatMessage = {
      id: chatId(),
      userId: participant.userId,
      name: participant.name,
      color: participant.color,
      message: text.slice(0, 2000),
      createdAt: new Date().toISOString(),
    };
    room.chat.push(msg);
    io.to(roomChannel(roomCode)).emit("collab:chat", msg);
  });

  socket.on("collab:language", (payload: LanguagePayload) => {
    const roomCode = payload?.roomCode?.toUpperCase();
    if (!roomCode || !payload.language) return;
    const room = getLiveRoom(roomCode);
    if (!room) return;
    if (room.hostSocketId !== socket.id) return;
    room.language = payload.language;
    io.to(roomChannel(roomCode)).emit("collab:language", { language: payload.language });
    void prisma.collaborativeCodingRoom
      .update({
        where: { roomCode },
        data: { language: payload.language },
      })
      .catch(() => {});
  });

  socket.on("disconnect", () => {
    const roomCode = meta.collabRoom;
    if (!roomCode) return;
    const room = getLiveRoom(roomCode);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    room.participants.delete(socket.id);
    room.cursors.delete(socket.id);

    if (room.hostSocketId === socket.id) {
      const next = room.participants.values().next().value as CollabParticipant | undefined;
      room.hostSocketId = next?.socketId ?? null;
      if (next) {
        next.isHost = true;
        room.participants.set(next.socketId, next);
      }
    }

    if (participant) {
      const systemMsg: CollabChatMessage = {
        id: chatId(),
        userId: "system",
        name: "System",
        color: "#64748b",
        message: `${participant.name} left the session`,
        createdAt: new Date().toISOString(),
      };
      room.chat.push(systemMsg);
      io.to(roomChannel(roomCode)).emit("collab:chat", systemMsg);
    }

    io.to(roomChannel(roomCode)).emit("collab:participants", listParticipants(room));
    io.to(roomChannel(roomCode)).emit("collab:cursors", listCursors(room));

    if (room.participants.size === 0) {
      removeLiveRoom(roomCode);
    }
  });
}

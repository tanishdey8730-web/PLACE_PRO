import type {
  CollabChatMessage,
  CollabCursor,
  CollabParticipant,
} from "@placepro/shared";

export interface LiveCollabRoom {
  roomId: string;
  roomCode: string;
  title: string;
  language: string;
  code: string;
  hostSocketId: string | null;
  participants: Map<string, CollabParticipant>;
  cursors: Map<string, CollabCursor>;
  chat: CollabChatMessage[];
}

const rooms = new Map<string, LiveCollabRoom>();

export function getLiveRoom(roomCode: string): LiveCollabRoom | undefined {
  return rooms.get(roomCode.toUpperCase());
}

export function setLiveRoom(roomCode: string, room: LiveCollabRoom) {
  rooms.set(roomCode.toUpperCase(), room);
}

export function removeLiveRoom(roomCode: string) {
  rooms.delete(roomCode.toUpperCase());
}

export function ensureLiveRoom(meta: {
  roomId: string;
  roomCode: string;
  title: string;
  language: string;
  code: string;
}): LiveCollabRoom {
  const code = meta.roomCode.toUpperCase();
  const existing = getLiveRoom(code);
  if (existing) return existing;
  const room: LiveCollabRoom = {
    roomId: meta.roomId,
    roomCode: code,
    title: meta.title,
    language: meta.language,
    code: meta.code,
    hostSocketId: null,
    participants: new Map(),
    cursors: new Map(),
    chat: [],
  };
  setLiveRoom(code, room);
  return room;
}

export function listParticipants(room: LiveCollabRoom): CollabParticipant[] {
  return Array.from(room.participants.values());
}

export function listCursors(room: LiveCollabRoom): CollabCursor[] {
  return Array.from(room.cursors.values());
}

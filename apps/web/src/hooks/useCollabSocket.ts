"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CollabChatMessage,
  CollabCursor,
  CollabParticipant,
  CollabRoomState,
} from "@placepro/shared";
import { disconnectCollabSocket, getCollabSocket } from "@/lib/socket";

export interface RoomBootstrap {
  roomId: string;
  roomCode: string;
  title: string;
  language: string;
  code: string;
}

interface UseCollabOptions {
  roomCode: string;
  userId: string;
  displayName: string;
  bootstrap?: RoomBootstrap;
  enabled?: boolean;
}

export function useCollabSocket({
  roomCode,
  userId,
  displayName,
  bootstrap,
  enabled = true,
}: UseCollabOptions) {
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<CollabRoomState | null>(null);
  const [participants, setParticipants] = useState<CollabParticipant[]>([]);
  const [cursors, setCursors] = useState<CollabCursor[]>([]);
  const [chat, setChat] = useState<CollabChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketIdRef = useRef<string | null>(null);
  const bootstrapRef = useRef(bootstrap);
  bootstrapRef.current = bootstrap;

  useEffect(() => {
    if (!enabled || !roomCode) return;

    const socket = getCollabSocket();
    socket.auth = { token: localStorage.getItem("placepro_token") };
    socket.connect();

    const onConnect = () => {
      setConnected(true);
      socketIdRef.current = socket.id ?? null;
      const b = bootstrapRef.current;
      socket.emit(
        "collab:join",
        {
          roomCode,
          userId,
          name: displayName,
          bootstrap: b
            ? {
                roomId: b.roomId,
                title: b.title,
                language: b.language,
                code: b.code,
              }
            : undefined,
        },
        (res: { ok: boolean; error?: string; state?: CollabRoomState }) => {
          if (!res?.ok) {
            setError(res?.error || "Failed to join room");
            return;
          }
          if (res.state) {
            setState(res.state);
            setParticipants(res.state.participants);
            setCursors(res.state.cursors);
            setChat(res.state.chat);
          }
        }
      );
    };

    const onDisconnect = () => setConnected(false);

    const onParticipants = (list: CollabParticipant[]) => setParticipants(list);
    const onCursors = (list: CollabCursor[]) => setCursors(list);
    const onCursor = (cursor: CollabCursor) => {
      setCursors((prev) => {
        const next = prev.filter((c) => c.socketId !== cursor.socketId);
        return [...next, cursor];
      });
    };
    const onChat = (msg: CollabChatMessage) => setChat((prev) => [...prev, msg].slice(-100));
    const onCode = (payload: { code: string; fromSocketId: string }) => {
      if (payload.fromSocketId === socket.id) return;
      setState((prev) => (prev ? { ...prev, code: payload.code } : prev));
    };
    const onLanguage = (payload: { language: string }) => {
      setState((prev) => (prev ? { ...prev, language: payload.language } : prev));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("collab:participants", onParticipants);
    socket.on("collab:cursors", onCursors);
    socket.on("collab:cursor", onCursor);
    socket.on("collab:chat", onChat);
    socket.on("collab:code", onCode);
    socket.on("collab:language", onLanguage);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("collab:participants", onParticipants);
      socket.off("collab:cursors", onCursors);
      socket.off("collab:cursor", onCursor);
      socket.off("collab:chat", onChat);
      socket.off("collab:code", onCode);
      socket.off("collab:language", onLanguage);
      disconnectCollabSocket();
    };
  }, [roomCode, userId, displayName, enabled]);

  const emitCode = useCallback(
    (code: string) => {
      getCollabSocket().emit("collab:code", { roomCode, code });
      setState((prev) => (prev ? { ...prev, code } : prev));
    },
    [roomCode]
  );

  const emitCursor = useCallback(
    (lineNumber: number, column: number) => {
      getCollabSocket().emit("collab:cursor", { roomCode, lineNumber, column });
    },
    [roomCode]
  );

  const sendChat = useCallback(
    (message: string) => {
      getCollabSocket().emit("collab:chat", { roomCode, message });
    },
    [roomCode]
  );

  const setLanguage = useCallback(
    (language: string) => {
      getCollabSocket().emit("collab:language", { roomCode, language });
      setState((prev) => (prev ? { ...prev, language } : prev));
    },
    [roomCode]
  );

  const isHost = participants.find((p) => p.socketId === socketIdRef.current)?.isHost ?? false;

  return {
    connected,
    state,
    participants,
    cursors,
    chat,
    error,
    isHost,
    emitCode,
    emitCursor,
    sendChat,
    setLanguage,
    socketId: socketIdRef.current,
  };
}

import { io, type Socket } from "socket.io-client";
import { getToken } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let socket: Socket | null = null;

export function getCollabSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: { token: typeof window !== "undefined" ? getToken() : undefined },
    });
  }
  return socket;
}

export function disconnectCollabSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

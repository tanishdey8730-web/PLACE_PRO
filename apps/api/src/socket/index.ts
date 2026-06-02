import type { Server } from "socket.io";
import { registerCollabHandlers } from "./collab.js";

export function setupSocket(io: Server) {
  io.on("connection", (socket) => {
    registerCollabHandlers(io, socket);

    socket.on("join:contest", (contestId: string) => {
      socket.join(`contest:${contestId}`);
    });

    socket.on("join:interview", (interviewId: string) => {
      socket.join(`interview:${interviewId}`);
    });

    socket.on("contest:score", ({ contestId, userId, score }) => {
      io.to(`contest:${contestId}`).emit("leaderboard:update", { userId, score });
    });
  });
}

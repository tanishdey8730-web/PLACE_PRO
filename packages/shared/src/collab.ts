export interface CollabParticipant {
  socketId: string;
  userId: string;
  name: string;
  color: string;
  isHost?: boolean;
}

export interface CollabCursor {
  socketId: string;
  userId: string;
  name: string;
  color: string;
  lineNumber: number;
  column: number;
}

export interface CollabChatMessage {
  id: string;
  userId: string;
  name: string;
  color: string;
  message: string;
  createdAt: string;
}

export interface CollabRoomState {
  roomId: string;
  roomCode: string;
  title: string;
  language: string;
  code: string;
  participants: CollabParticipant[];
  cursors: CollabCursor[];
  chat: CollabChatMessage[];
}

export const COLLAB_LANGUAGES = [
  { id: "python", label: "Python", monaco: "python" },
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "c", label: "C", monaco: "c" },
] as const;

export const COLLAB_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

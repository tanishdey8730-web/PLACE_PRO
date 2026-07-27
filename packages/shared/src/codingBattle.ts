export type CodingBattleMode = "ONE_VS_ONE" | "MULTIPLAYER";
export type CodingBattleStatus = "WAITING" | "MATCHMAKING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface CodingBattleParticipant {
  id: string;
  userId: string;
  name: string;
  avatar?: string | null;
  score: number;
  rank?: number | null;
}

export interface CodingBattleRoom {
  id: string;
  roomCode: string;
  mode: CodingBattleMode;
  status: CodingBattleStatus;
  durationSeconds: number;
  maxPlayers: number;
  problem?: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
  } | null;
  participants: CodingBattleParticipant[];
  startedAt?: string | null;
  endsAt?: string | null;
  winnerId?: string | null;
}

"use client";

import type { CollabCursor, CollabParticipant } from "@placepro/shared";

interface ParticipantListProps {
  participants: CollabParticipant[];
  cursors: CollabCursor[];
  selfSocketId: string | null;
}

export function ParticipantList({ participants, cursors, selfSocketId }: ParticipantListProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-sm font-medium mb-2">
        Participants ({participants.length})
      </p>
      <ul className="space-y-2 text-sm">
        {participants.map((p) => {
          const cursor = cursors.find((c) => c.socketId === p.socketId);
          const isYou = p.socketId === selfSocketId;
          return (
            <li key={p.socketId} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <span className="truncate">
                {p.name}
                {isYou && " (you)"}
                {p.isHost && " · host"}
              </span>
              {cursor && !isYou && (
                <span className="text-xs text-muted-foreground ml-auto">
                  L{cursor.lineNumber}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

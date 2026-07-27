"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Swords, Users, Trophy, Zap, Timer } from "lucide-react";
import { api } from "@/lib/api";
import type { CodingBattleRoom } from "@placepro/shared";

export default function CodingBattlesPage() {
  const [battle, setBattle] = useState<CodingBattleRoom | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    { userId: string; name: string; score: number; rank: number }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const loadLeaderboard = useCallback(() => {
    api<typeof leaderboard>("/api/coding-battles/leaderboard").then((res) => {
      if (res.success && res.data) setLeaderboard(res.data);
    });
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  async function matchmake(mode: "ONE_VS_ONE" | "MULTIPLAYER") {
    setLoading(true);
    const res = await api<CodingBattleRoom>("/api/coding-battles/matchmake", {
      method: "POST",
      body: JSON.stringify({ mode }),
    });
    setLoading(false);
    if (res.success && res.data) setBattle(res.data);
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Swords className="h-7 w-7 text-primary" />
          Peer Coding Battles
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          1v1 and multiplayer battles with live ranking, timer, and Judge0 execution
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Find a match</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="gradient"
                className="w-full"
                disabled={loading}
                onClick={() => matchmake("ONE_VS_ONE")}
              >
                <Swords className="h-4 w-4 mr-2" />
                {loading ? "Matchmaking…" : "1v1 Battle"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => matchmake("MULTIPLAYER")}
              >
                <Users className="h-4 w-4 mr-2" />
                Multiplayer (up to 4)
              </Button>
              {battle && (
                <div className="rounded-lg border border-border/50 p-4 space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-primary">{battle.roomCode}</span>
                    <Badge>{battle.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5" />
                    {Math.round(battle.durationSeconds / 60)} min
                  </p>
                  {battle.problem && (
                    <p className="text-sm">
                      Problem:{" "}
                      <Link
                        href={`/dashboard/coding/${battle.problem.slug}`}
                        className="text-primary hover:underline"
                      >
                        {battle.problem.title}
                      </Link>
                    </p>
                  )}
                  <ul className="text-sm space-y-1">
                    {battle.participants.map((p) => (
                      <li key={p.id} className="flex justify-between">
                        <span>{p.name}</span>
                        <span className="text-muted-foreground">{p.score} pts</span>
                      </li>
                    ))}
                  </ul>
                  {battle.problem && (
                    <Link href={`/dashboard/coding/${battle.problem.slug}`}>
                      <Button className="w-full mt-2">Enter battle room</Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {leaderboard.map((row) => (
                    <li
                      key={row.userId}
                      className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground w-6">#{row.rank}</span>
                        {row.name}
                        {row.rank <= 3 && <Zap className="h-3.5 w-3.5 text-amber-500" />}
                      </span>
                      <span className="font-medium">{row.score} XP</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal } from "lucide-react";
import { api } from "@/lib/api";

interface Contest {
  id: string;
  title: string;
  type: string;
  _count?: { entries: number };
}

interface LeaderboardEntry {
  user: { name: string };
  score: number;
}

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardId, setLeaderboardId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api<Contest[]>("/api/contests").then((res) => {
      setLoading(false);
      if (res.success && res.data) setContests(res.data as Contest[]);
    });
  }, []);

  async function join(id: string) {
    await api(`/api/contests/${id}/join`, { method: "POST" });
    const res = await api<Contest[]>("/api/contests");
    if (res.success && res.data) setContests(res.data as Contest[]);
  }

  async function showLeaderboard(id: string) {
    setLeaderboardId(id);
    const res = await api<LeaderboardEntry[]>(`/api/contests/${id}/leaderboard`);
    if (res.success && res.data) setLeaderboard(res.data);
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-7 w-7 text-amber-500" />
          Contests
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">Weekly coding, aptitude & company challenges</p>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {contests.map((c) => (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{c.title}</CardTitle>
                    <Badge>{c.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {c._count?.entries ?? 0} participants
                  </p>
                  <div className="flex gap-2">
                    <Button variant="gradient" onClick={() => join(c.id)}>
                      Join Contest
                    </Button>
                    <Button variant="outline" onClick={() => showLeaderboard(c.id)}>
                      <Medal className="h-4 w-4 mr-1" />
                      Leaderboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {leaderboardId && (
          <Card className="mt-8 max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {leaderboard.map((e, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      #{i + 1} {e.user.name}
                    </span>
                    <span>{e.score}</span>
                  </li>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-muted-foreground">No entries yet</p>
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

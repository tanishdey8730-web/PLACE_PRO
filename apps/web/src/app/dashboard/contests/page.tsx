"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { api } from "@/lib/api";

export default function ContestsPage() {
  const [contests, setContests] = useState<{ id: string; title: string; type: string; _count?: { entries: number } }[]>([]);

  useEffect(() => {
    api<typeof contests>("/api/contests").then((res) => {
      if (res.success && res.data) setContests(res.data as typeof contests);
      else setContests([{ id: "1", title: "Weekly Coding Challenge #1", type: "CODING", _count: { entries: 234 } }]);
    });
  }, []);

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="h-7 w-7 text-amber-500" /> Contests</h1>
        <p className="text-muted-foreground mt-1 mb-8">Weekly coding, aptitude & company challenges</p>
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
                <p className="text-sm text-muted-foreground mb-4">{c._count?.entries ?? 0} participants</p>
                <div className="flex gap-2">
                  <Button variant="gradient">Join Contest</Button>
                  <Button variant="outline"><Medal className="h-4 w-4 mr-1" /> Leaderboard</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { COLLAB_LANGUAGES } from "@placepro/shared";
import { Users, Plus, LogIn, Copy, Radio } from "lucide-react";

interface RoomSummary {
  id: string;
  roomCode: string;
  title: string;
  language: string;
  updatedAt?: string;
}

export default function CollabLobbyPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Placement practice room");
  const [language, setLanguage] = useState("python");
  const [joinCode, setJoinCode] = useState("");
  const [recent, setRecent] = useState<RoomSummary[]>([]);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api<RoomSummary[]>("/api/collab/rooms").then((res) => {
      if (res.success && res.data) setRecent(res.data);
    });
  }, []);

  const createRoom = async () => {
    setCreating(true);
    const res = await api<RoomSummary & { code: string }>("/api/collab/rooms", {
      method: "POST",
      body: JSON.stringify({ title, language }),
    });
    setCreating(false);
    if (res.success && res.data) {
      sessionStorage.setItem(
        `collab-bootstrap-${res.data.roomCode}`,
        JSON.stringify(res.data)
      );
      router.push(`/dashboard/collab/${res.data.roomCode}`);
    }
  };

  const joinRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) return;
    router.push(`/dashboard/collab/${code}`);
  };

  const copyCode = (code: string) => {
    void navigator.clipboard.writeText(
      `${window.location.origin}/dashboard/collab/${code}`
    );
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="h-7 w-7 text-primary" />
            Live pair programming
          </h1>
          <p className="text-muted-foreground mt-1">
            Shared Monaco editor, live cursors, and session chat for real-time collaborative coding.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-5 w-5" />
                Create session
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Start a room and share the code with teammates.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Room title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="DSA revision with Alex"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {COLLAB_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={createRoom} disabled={creating} className="w-full">
                {creating ? "Creating…" : "Create & enter room"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LogIn className="h-5 w-5" />
                Join session
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the room code from your partner.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Room code
                </label>
                <Input
                  id="code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="A1B2C3"
                  maxLength={8}
                />
              </div>
              <Button onClick={joinRoom} variant="secondary" className="w-full">
                Join room
              </Button>
            </CardContent>
          </Card>
        </div>

        {recent.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Your recent rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border text-sm">
                {recent.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3 gap-2">
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {r.roomCode} · {r.language}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(r.roomCode)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copied === r.roomCode ? "Copied" : "Link"}
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/collab/${r.roomCode}`}>Open</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

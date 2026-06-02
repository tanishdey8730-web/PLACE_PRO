"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { CollaborativeEditor } from "@/components/collab/CollaborativeEditor";
import { CollabChat } from "@/components/collab/CollabChat";
import { ParticipantList } from "@/components/collab/ParticipantList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useCollabSocket, type RoomBootstrap } from "@/hooks/useCollabSocket";
import { COLLAB_LANGUAGES } from "@placepro/shared";
import { ArrowLeft, Copy, Wifi, WifiOff, Radio } from "lucide-react";

interface RoomMeta {
  id: string;
  roomCode: string;
  title: string;
  language: string;
  code: string;
}

function displayName() {
  if (typeof window === "undefined") return "Guest";
  return localStorage.getItem("placepro_display_name") || "Coder";
}

function userId() {
  if (typeof window === "undefined") return "guest";
  return localStorage.getItem("placepro_user_id") || "guest";
}

export default function CollabRoomPage() {
  const params = useParams();
  const roomCode = String(params.roomCode || "").toUpperCase();
  const [meta, setMeta] = useState<RoomMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setName(displayName());
    const stored = sessionStorage.getItem(`collab-bootstrap-${roomCode}`);
    if (stored) {
      try {
        setMeta(JSON.parse(stored) as RoomMeta);
        sessionStorage.removeItem(`collab-bootstrap-${roomCode}`);
        setLoading(false);
        return;
      } catch {
        /* fall through */
      }
    }
    api<RoomMeta>(`/api/collab/rooms/${roomCode}`).then((res) => {
      if (res.success && res.data) setMeta(res.data);
      setLoading(false);
    });
  }, [roomCode]);

  const bootstrap: RoomBootstrap | undefined = useMemo(
    () =>
      meta
        ? {
            roomId: meta.id,
            roomCode: meta.roomCode,
            title: meta.title,
            language: meta.language,
            code: meta.code,
          }
        : undefined,
    [meta]
  );

  const collab = useCollabSocket({
    roomCode,
    userId: userId(),
    displayName: name || "Coder",
    bootstrap,
    enabled: !!meta && !!name,
  });

  const code = collab.state?.code ?? meta?.code ?? "";
  const language = collab.state?.language ?? meta?.language ?? "python";
  const title = collab.state?.title ?? meta?.title ?? "Collaborative session";

  const copyLink = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onCodeChange = useCallback(
    (v: string) => {
      collab.emitCode(v);
    },
    [collab]
  );

  if (loading) {
    return (
      <>
        <DashboardHeader />
        <p className="p-8 text-muted-foreground text-sm">Loading room…</p>
      </>
    );
  }

  if (!meta) {
    return (
      <>
        <DashboardHeader />
        <div className="space-y-4 p-6">
          <p className="text-destructive">{collab.error || "Room not found"}</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/collab">Back to lobby</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main className="flex flex-col p-4 lg:p-6 gap-4 h-[calc(100vh-4rem)]">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/collab">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Lobby
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold flex items-center gap-2 truncate">
              <Radio className="h-5 w-5 text-primary shrink-0" />
              {title}
            </h1>
            <p className="text-muted-foreground text-sm">Room {roomCode}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={collab.connected ? "default" : "secondary"} className="gap-1">
              {collab.connected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {collab.connected ? "Live" : "Offline"}
            </Badge>
            <Badge variant="secondary">{collab.participants.length} online</Badge>
            <Button size="sm" variant="outline" onClick={copyLink}>
              <Copy className="h-3.5 w-3.5 mr-1" />
              {copied ? "Copied" : "Share link"}
            </Button>
            {collab.isHost && (
              <select
                value={language}
                onChange={(e) => collab.setLanguage(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
              >
                {COLLAB_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_280px] min-h-0">
          <div className="min-h-0 flex flex-col">
            <CollaborativeEditor
              language={language}
              value={code}
              cursors={collab.cursors}
              selfSocketId={collab.socketId}
              onChange={onCodeChange}
              onCursorMove={collab.emitCursor}
            />
          </div>
          <div className="flex flex-col gap-4 min-h-0">
            <ParticipantList
              participants={collab.participants}
              cursors={collab.cursors}
              selfSocketId={collab.socketId}
            />
            <div className="flex-1 min-h-[200px]">
              <CollabChat
                messages={collab.chat}
                onSend={collab.sendChat}
                connected={collab.connected}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

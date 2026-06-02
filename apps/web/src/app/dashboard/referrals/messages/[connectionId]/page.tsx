"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import type {
  ReferralConnectionItem,
  ReferralConnectionStatus,
  ReferralMessageItem,
} from "@placepro/shared";

const STATUSES: ReferralConnectionStatus[] = [
  "PENDING",
  "ACTIVE",
  "REFERRED",
  "COMPLETED",
  "DECLINED",
  "CANCELLED",
];

export default function ReferralMessagesPage() {
  const params = useParams();
  const connectionId = String(params.connectionId);
  const [connection, setConnection] = useState<ReferralConnectionItem | null>(null);
  const [messages, setMessages] = useState<ReferralMessageItem[]>([]);
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [connRes, msgRes] = await Promise.all([
      api<ReferralConnectionItem>(`/api/referrals/connections/${connectionId}`),
      api<ReferralMessageItem[]>(`/api/referrals/connections/${connectionId}/messages`),
    ]);
    if (connRes.success && connRes.data) {
      setConnection(connRes.data);
      setNotes(connRes.data.trackingNotes ?? "");
    }
    if (msgRes.success && msgRes.data) setMessages(msgRes.data);
  }, [connectionId]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 8000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!text.trim()) return;
    const res = await api<ReferralMessageItem>(
      `/api/referrals/connections/${connectionId}/messages`,
      { method: "POST", body: JSON.stringify({ body: text.trim() }) }
    );
    if (res.success && res.data) {
      setMessages((prev) => [...prev, res.data!]);
      setText("");
      void load();
    }
  }

  async function updateStatus(status: ReferralConnectionStatus) {
    const res = await api<ReferralConnectionItem>(
      `/api/referrals/connections/${connectionId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, trackingNotes: notes }),
      }
    );
    if (res.success && res.data) setConnection(res.data);
  }

  if (!connection) {
    return (
      <>
        <DashboardHeader />
        <p className="p-8 text-muted-foreground text-sm">Loading conversation…</p>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-3xl mx-auto pb-24 space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/referrals">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Marketplace
          </Link>
        </Button>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between gap-2">
              <span>
                {connection.companyName} — {connection.targetRole}
              </span>
              <Badge variant="secondary">{connection.status}</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Chat with {connection.otherUser.name}
              {connection.otherUser.college ? ` (${connection.otherUser.college})` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-xs font-medium">Referral tracking notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[60px] rounded-lg border border-border bg-background p-2 text-sm"
              placeholder="Internal notes: resume sent, recruiter screen date…"
            />
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={connection.status === s ? "default" : "outline"}
                  onClick={() => updateStatus(s)}
                >
                  {s === "COMPLETED" && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                  {s}
                </Button>
              ))}
            </div>
            {connection.referredAt && (
              <p className="text-xs text-muted-foreground">
                Referred: {new Date(connection.referredAt).toLocaleString()}
              </p>
            )}
            {connection.completedAt && (
              <p className="text-xs text-emerald-600">
                Completed: {new Date(connection.completedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-[360px]">
          <CardContent className="flex-1 flex flex-col pt-4">
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {!m.isMine && (
                      <p className="text-xs font-medium opacity-80 mb-1">{m.senderName}</p>
                    )}
                    <p>{m.body}</p>
                    <p className="text-[10px] opacity-70 mt-1">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form
              className="flex gap-2 mt-4 pt-4 border-t border-border"
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
            >
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

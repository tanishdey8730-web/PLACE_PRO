"use client";

import { useEffect, useRef, useState } from "react";
import type { CollabChatMessage } from "@placepro/shared";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CollabChatProps {
  messages: CollabChatMessage[];
  onSend: (message: string) => void;
  connected: boolean;
}

export function CollabChat({ messages, onSend, connected }: CollabChatProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg || !connected) return;
    onSend(msg);
    setText("");
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2 text-sm font-medium">Session chat</div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm max-h-[320px]">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-xs">Say hello to your pair partner.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.userId === "system" ? "text-muted-foreground text-xs italic" : ""}
          >
            {m.userId !== "system" && (
              <span className="font-medium" style={{ color: m.color }}>
                {m.name}:{" "}
              </span>
            )}
            <span>{m.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-border p-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={connected ? "Type a message…" : "Connecting…"}
          disabled={!connected}
          className="text-sm"
        />
        <Button type="submit" size="icon" disabled={!connected || !text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

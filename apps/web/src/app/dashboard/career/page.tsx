"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Send,
  Sparkles,
  Target,
  Code2,
  Cpu,
  Map,
  Briefcase,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CareerCoachInsights, CareerCoachMessage } from "@placepro/shared";

const ROLES = [
  "Software Engineer",
  "Data Scientist",
  "Cloud Engineer",
  "AI Engineer",
  "Cybersecurity Analyst",
  "Product Manager",
];

const QUICK_PROMPTS = [
  "What skills should I focus on first?",
  "Recommend a 3-month learning path",
  "How do I balance product vs service company prep?",
  "What technologies should I learn for backend roles?",
];

export default function CareerCoachPage() {
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CareerCoachMessage[]>([]);
  const [insights, setInsights] = useState<CareerCoachInsights | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const startSession = useCallback(async () => {
    setInitializing(true);
    const res = await api<{
      sessionId: string;
      insights: CareerCoachInsights;
      messages: CareerCoachMessage[];
    }>("/api/career-coach", {
      method: "POST",
      body: JSON.stringify({ action: "new_session", targetRole }),
    });
    setInitializing(false);
    if (res.success && res.data) {
      setSessionId(res.data.sessionId);
      setInsights(res.data.insights);
      setMessages(res.data.messages ?? []);
    } else {
      setMessages([
        {
          id: "fallback",
          role: "assistant",
          content:
            "Hi! I'm your AI Career Coach. Select a target role and ask me about skills, technologies, learning paths, or placement strategy.",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [targetRole]);

  useEffect(() => {
    startSession();
  }, []);

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: CareerCoachMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const res = await api<{ sessionId: string; reply: string; message: CareerCoachMessage }>(
      "/api/career-coach",
      {
        method: "POST",
        body: JSON.stringify({
          action: "chat",
          sessionId,
          message: msg,
          targetRole,
        }),
      }
    );

    setLoading(false);
    if (res.success && res.data) {
      if (!sessionId) setSessionId(res.data.sessionId);
      setMessages((m) => [...m, res.data!.message]);
    } else {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "I'm here to help with career guidance, skills, tech recommendations, learning paths, and placement strategy. Could you rephrase your question?",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-7 w-7 text-primary" />
              AI Career Coach
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time career planning, skills, tech stack & placement strategy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={startSession} disabled={initializing}>
              <Sparkles className="h-4 w-4 mr-1" />
              Refresh insights
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 flex flex-col min-h-[520px]">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="border-b border-border/50 py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Live coaching chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px]">
                  {initializing ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Preparing your coaching session...
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "flex",
                          m.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            m.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-3 flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.15s]" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.3s]" />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="p-3 border-t border-border/50 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => sendMessage(p)}
                        className="text-xs rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about skills, learning path, placement strategy..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                      disabled={loading || initializing}
                    />
                    <Button type="submit" variant="gradient" disabled={loading || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {insights ? (
              <>
                <InsightCard
                  icon={Target}
                  title="Career Guidance"
                  content={insights.careerGuidance}
                />
                <InsightCard
                  icon={Code2}
                  title="Skill Recommendations"
                  items={insights.skillRecommendations}
                />
                <InsightCard
                  icon={Cpu}
                  title="Technology Recommendations"
                  items={insights.technologyRecommendations}
                />
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Map className="h-4 w-4 text-primary" />
                      Learning Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {insights.learningPath.map((p) => (
                      <div key={p.phase} className="rounded-lg border border-border/50 px-3 py-2 text-xs">
                        <p className="font-medium text-primary">{p.phase}</p>
                        <p className="text-muted-foreground mt-0.5">{p.focus}</p>
                        <p className="text-muted-foreground mt-1">{p.hoursPerWeek}h / week</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <InsightCard
                  icon={Briefcase}
                  title="Placement Strategy"
                  items={insights.placementStrategy}
                />
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  Insights load when your session starts.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function InsightCard({
  icon: Icon,
  title,
  content,
  items,
}: {
  icon: React.ElementType;
  title: string;
  content?: string;
  items?: string[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content && <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>}
        {items && (
          <ul className="text-xs text-muted-foreground space-y-1.5">
            {items.map((item) => (
              <li key={item} className="flex gap-1.5">
                <span className="text-primary shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

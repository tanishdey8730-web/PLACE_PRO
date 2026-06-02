"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  ChevronRight,
  Loader2,
  Sparkles,
  Database,
  Shield,
  Layers,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  SystemDesignDimension,
  SystemDesignReport,
  SystemDesignTopic,
  SystemDesignTopicId,
} from "@placepro/shared";

type Phase = "select" | "design" | "report";

const SCORE_DIMS: { key: SystemDesignDimension; label: string; icon: typeof Network }[] = [
  { key: "scalability", label: "Scalability", icon: Zap },
  { key: "architecture", label: "Architecture", icon: Layers },
  { key: "databaseDesign", label: "Database Design", icon: Database },
  { key: "caching", label: "Caching", icon: Sparkles },
  { key: "security", label: "Security", icon: Shield },
];

const DESIGN_TEMPLATE = `## Requirements
- Functional:
- Non-functional:

## High-level architecture
- Clients:
- API / Gateway:
- Core services:

## Data model & storage
- Entities:
- Sharding / replication:

## Scalability
- Traffic estimates:
- Bottlenecks & scaling strategy:

## Caching
- What to cache:
- Invalidation:

## Security
- Auth:
- Data protection:
`;

export default function SystemDesignPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [topics, setTopics] = useState<SystemDesignTopic[]>([]);
  const [selectedId, setSelectedId] = useState<SystemDesignTopicId | null>(null);
  const [topic, setTopic] = useState<SystemDesignTopic | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [design, setDesign] = useState(DESIGN_TEMPLATE);
  const [report, setReport] = useState<SystemDesignReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    api<SystemDesignTopic[]>("/api/system-design/topics").then((res) => {
      if (res.success && res.data?.length) setTopics(res.data);
      else {
        setTopics([
          {
            id: "instagram",
            title: "Design Instagram",
            tagline: "Photo/video sharing",
            scaleHint: "~2B MAU",
            functionalRequirements: ["Feeds", "Uploads", "Stories"],
            nonFunctionalRequirements: ["Low latency feed", "CDN"],
            discussionPoints: ["Fan-out", "Media pipeline"],
          },
          {
            id: "whatsapp",
            title: "Design WhatsApp",
            tagline: "Messaging at scale",
            scaleHint: "~2B users",
            functionalRequirements: ["1:1 chat", "Groups", "Receipts"],
            nonFunctionalRequirements: ["Sub-second delivery"],
            discussionPoints: ["WebSockets", "E2E encryption"],
          },
          {
            id: "uber",
            title: "Design Uber",
            tagline: "Ride marketplace",
            scaleHint: "Geo-distributed",
            functionalRequirements: ["Match driver", "Tracking", "Payments"],
            nonFunctionalRequirements: ["Fast matching"],
            discussionPoints: ["Geohash", "Trip state"],
          },
          {
            id: "youtube",
            title: "Design YouTube",
            tagline: "Video platform",
            scaleHint: "500+ hrs uploaded/min",
            functionalRequirements: ["Upload", "Transcode", "Stream"],
            nonFunctionalRequirements: ["Adaptive bitrate"],
            discussionPoints: ["CDN", "Recommendations"],
          },
        ]);
      }
    });
  }, []);

  const startSession = useCallback(async (topicId: SystemDesignTopicId) => {
    const t = topics.find((x) => x.id === topicId);
    if (!t) return;
    setSelectedId(topicId);
    setTopic(t);
    setDesign(DESIGN_TEMPLATE);
    setLoading(true);

    const res = await api<{ sessionId: string; topic: SystemDesignTopic }>(
      "/api/system-design",
      {
        method: "POST",
        body: JSON.stringify({ action: "start", topicId }),
      }
    );
    setLoading(false);

    if (res.success && res.data) {
      setSessionId(res.data.sessionId);
      setTopic(res.data.topic);
    } else {
      setSessionId("local");
    }
    setStartedAt(Date.now());
    setPhase("design");
  }, [topics]);

  async function submitDesign() {
    if (!selectedId || design.trim().length < 80) {
      alert("Please write a detailed design (at least 80 characters).");
      return;
    }

    setLoading(true);
    const duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : undefined;

    const res = await api<SystemDesignReport>("/api/system-design", {
      method: "POST",
      body: JSON.stringify({
        action: "evaluate",
        topicId: selectedId,
        design,
        sessionId: sessionId ?? undefined,
        duration,
      }),
    });
    setLoading(false);

    if (res.success && res.data) {
      setReport(res.data);
      setPhase("report");
    }
  }

  if (phase === "report" && report) {
    return (
      <>
        <DashboardHeader />
        <main className="p-4 lg:p-8 max-w-4xl mx-auto pb-24 space-y-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Network className="h-7 w-7 text-primary" />
              System Design Feedback
            </h1>
            <p className="text-muted-foreground mt-1">{report.topicTitle}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Overall score</span>
                <span className="text-3xl font-bold text-primary">{report.scores.overall}</span>
              </div>
              <Progress value={report.scores.overall} className="h-2" />
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {SCORE_DIMS.map(({ key, label, icon: Icon }) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {label}
                    </span>
                    <Badge variant="secondary">{report.scores[key]}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {report.dimensionFeedback.find((d) => d.dimension === key)?.feedback}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detailed dimension feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.dimensionFeedback.map((d) => (
                <div key={d.dimension} className="border-b border-border/50 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium capitalize">
                      {d.dimension.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <Badge>{d.score}/100</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{d.feedback}</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {d.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>{report.summary}</p>
              <div>
                <p className="font-medium mb-1">Strengths</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {report.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Improvements</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {report.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              {report.architectureHighlights && report.architectureHighlights.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Architecture highlights</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {report.architectureHighlights.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="font-medium mb-1">Recommendations</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {report.recommendations.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => {
              setPhase("select");
              setReport(null);
              setSelectedId(null);
            }}
          >
            Practice another topic
          </Button>
        </main>
      </>
    );
  }

  if (phase === "design" && topic) {
    return (
      <>
        <DashboardHeader />
        <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">{topic.title}</h1>
              <p className="text-sm text-muted-foreground">{topic.tagline} · {topic.scaleHint}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPhase("select")}>
              Change topic
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3 text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">Functional</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {topic.functionalRequirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Non-functional</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {topic.nonFunctionalRequirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Discuss</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {topic.discussionPoints.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Your design (45–60 min simulation)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={design}
                  onChange={(e) => setDesign(e.target.value)}
                  className="w-full min-h-[420px] rounded-lg border border-border bg-background p-3 text-sm font-mono leading-relaxed"
                  placeholder="Describe APIs, services, data stores, scaling, caching, and security..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {design.trim().split(/\s+/).filter(Boolean).length} words · AI evaluates
                  scalability, architecture, database, caching, and security
                </p>
                <Button
                  className="w-full mt-4"
                  onClick={submitDesign}
                  disabled={loading || design.trim().length < 80}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Evaluating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Submit for AI evaluation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-7 w-7 text-primary" />
            System Design Interview Simulator
          </h1>
          <p className="text-muted-foreground mt-1">
            Pick a classic FAANG-style prompt. Submit your design for AI scoring and detailed
            feedback on scalability, architecture, databases, caching, and security.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {topics.map((t) => (
            <Card
              key={t.id}
              className={cn(
                "cursor-pointer transition-colors hover:border-primary/50",
                selectedId === t.id && "border-primary"
              )}
              onClick={() => !loading && startSession(t.id)}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  {t.title}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>{t.tagline}</p>
                <Badge variant="secondary" className="text-xs">
                  {t.scaleHint}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting session…
          </p>
        )}
      </main>
    </>
  );
}

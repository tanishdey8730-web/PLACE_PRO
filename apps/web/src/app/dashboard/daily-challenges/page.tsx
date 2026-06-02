"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CalendarCheck,
  Code2,
  Brain,
  Mic,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  RefreshCw,
  Target,
  Flame,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  CompleteDailyChallengeResult,
  DailyChallengeItem,
  DailyChallengeSet,
  DailyChallengeHistoryItem,
  PlacementGoal,
} from "@placepro/shared";
import { PLACEMENT_GOALS } from "@placepro/shared";

const TYPE_META = {
  dsa: { label: "DSA", icon: Code2, color: "text-blue-400" },
  aptitude: { label: "Aptitude", icon: Brain, color: "text-purple-400" },
  interview: { label: "Interview", icon: Mic, color: "text-amber-400" },
};

export default function DailyChallengesPage() {
  const [set, setSet] = useState<DailyChallengeSet | null>(null);
  const [history, setHistory] = useState<DailyChallengeHistoryItem[]>([]);
  const [placementGoal, setPlacementGoal] = useState<PlacementGoal>("product_company");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadToday = useCallback(async () => {
    setLoading(true);
    const res = await api<DailyChallengeSet>("/api/daily-challenges");
    setLoading(false);
    if (res.success && res.data) {
      setSet(res.data);
      setPlacementGoal(res.data.placementGoal);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    const res = await api<DailyChallengeHistoryItem[]>("/api/daily-challenges/history");
    if (res.success && res.data) setHistory(res.data);
  }, []);

  useEffect(() => {
    void loadToday();
    void loadHistory();
  }, [loadToday, loadHistory]);

  async function regenerate() {
    setGenerating(true);
    const res = await api<DailyChallengeSet>("/api/daily-challenges", {
      method: "POST",
      body: JSON.stringify({ placementGoal, force: true }),
    });
    setGenerating(false);
    if (res.success && res.data) {
      setSet(res.data);
      void loadHistory();
    }
  }

  async function completeChallenge(challenge: DailyChallengeItem) {
    if (!set || challenge.completed) return;

    if (challenge.type === "aptitude" && !answer.trim()) {
      alert("Select or enter your answer.");
      return;
    }
    if (challenge.type === "interview" && answer.trim().length < 20) {
      alert("Write at least a few sentences for your interview answer.");
      return;
    }

    setSubmitting(true);
    const res = await api<CompleteDailyChallengeResult>("/api/daily-challenges/complete", {
      method: "POST",
      body: JSON.stringify({
        setId: set.id,
        challengeId: challenge.id,
        answer: answer.trim() || undefined,
      }),
    });
    setSubmitting(false);

    if (res.success && res.data) {
      const result = res.data;
      setSet((prev) => {
        if (!prev) return prev;
        const challenges = prev.challenges.map((c) =>
          c.id === challenge.id ? result.challenge : c
        );
        return {
          ...prev,
          challenges,
          completedCount: result.completedCount,
          completionPercent: result.completionPercent,
          isDayComplete: result.isDayComplete,
          xpEarnedToday: prev.xpEarnedToday + result.xpAwarded,
        };
      });
      setAnswer("");
      setActiveId(null);
      void loadHistory();
    }
  }

  const active = set?.challenges.find((c) => c.id === activeId);

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarCheck className="h-7 w-7 text-primary" />
              Daily Challenges
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-generated DSA, aptitude, and interview practice based on your weak topics and
              placement goal.
            </p>
          </div>
          {set && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Today&apos;s progress</p>
              <p className="text-2xl font-bold text-primary">{set.completionPercent}%</p>
              <p className="text-xs text-muted-foreground">
                {set.completedCount}/{set.totalCount} done
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading today&apos;s challenges…
          </p>
        ) : set ? (
          <>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Progress value={set.completionPercent} className="h-2" />
                <p className="text-sm">{set.summary}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary" className="gap-1">
                    <Target className="h-3 w-3" />
                    {set.placementGoalLabel}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Flame className="h-3 w-3" />
                    Streak context: {set.progress.dailyStreak} days
                  </Badge>
                  {set.weakTopics.slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Placement goal</label>
                    <select
                      value={placementGoal}
                      onChange={(e) => setPlacementGoal(e.target.value as PlacementGoal)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm block"
                    >
                      {PLACEMENT_GOALS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerate}
                    disabled={generating}
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Regenerate today
                  </Button>
                </div>
                {set.isDayComplete && (
                  <p className="text-sm text-emerald-500 font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    All challenges complete! +{set.xpEarnedToday} XP today
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                {set.challenges.map((ch) => {
                  const meta = TYPE_META[ch.type];
                  const Icon = meta.icon;
                  return (
                    <Card
                      key={ch.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        activeId === ch.id && "border-primary",
                        ch.completed && "opacity-80"
                      )}
                      onClick={() => {
                        setActiveId(ch.id);
                        setAnswer(ch.userAnswer ?? "");
                      }}
                    >
                      <CardContent className="py-4 flex items-start gap-3">
                        {ch.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Icon className={cn("h-4 w-4", meta.color)} />
                            <span className="text-xs text-muted-foreground">{meta.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              {ch.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ~{ch.estimatedMinutes}m
                            </span>
                          </div>
                          <p className="font-medium text-sm mt-1">{ch.title}</p>
                          <p className="text-xs text-muted-foreground">{ch.topic}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="min-h-[320px]">
                {active ? (
                  <>
                    <CardHeader>
                      <CardTitle className="text-base">{active.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <p className="whitespace-pre-wrap">{active.prompt}</p>
                      {active.hints && active.hints.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium text-foreground mb-1">Hints</p>
                          <ul className="list-disc pl-4">
                            {active.hints.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {active.type === "dsa" && active.codingSlug && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/coding/${active.codingSlug}`}>
                            Open in coding lab
                          </Link>
                        </Button>
                      )}
                      {!active.completed && active.type === "aptitude" && active.options && (
                        <div className="space-y-2">
                          {active.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAnswer(opt)}
                              className={cn(
                                "w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors",
                                answer === opt
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:bg-muted/50"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                      {!active.completed &&
                        (active.type === "interview" ||
                          (active.type === "aptitude" && !active.options)) && (
                          <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={
                              active.type === "interview"
                                ? "Write your answer (STAR format)…"
                                : "Your answer…"
                            }
                            className="w-full min-h-[100px] rounded-lg border border-border bg-background p-3 text-sm"
                          />
                        )}
                      {active.completed && active.feedback && (
                        <p
                          className={cn(
                            "text-sm p-3 rounded-lg",
                            active.isCorrect
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          )}
                        >
                          {active.feedback}
                        </p>
                      )}
                      {!active.completed && (
                        <Button
                          onClick={() => completeChallenge(active)}
                          disabled={submitting}
                          className="w-full"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Mark complete
                            </>
                          )}
                        </Button>
                      )}
                      {active.type === "dsa" && !active.completed && (
                        <Button
                          variant="secondary"
                          onClick={() => completeChallenge(active)}
                          disabled={submitting}
                          className="w-full"
                        >
                          I solved this offline
                        </Button>
                      )}
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="py-12 text-center text-muted-foreground text-sm">
                    Select a challenge to begin
                  </CardContent>
                )}
              </Card>
            </div>

            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Completion history</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border text-sm">
                    {history.map((h) => (
                      <li key={h.id} className="flex items-center justify-between py-2">
                        <span>{h.challengeDate}</span>
                        <span className="text-muted-foreground">
                          {h.completedCount}/{h.totalCount} · {h.completionPercent}%
                          {h.isDayComplete && " ✓"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-muted-foreground">No challenges yet for today.</p>
              <Button onClick={regenerate} disabled={generating}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate today&apos;s pack
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

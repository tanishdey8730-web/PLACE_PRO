"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Circle,
  Code2,
  Brain,
  MessageSquare,
  Layers,
  Users,
  BookOpen,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CompanyPrepContent } from "@placepro/shared";

type Tab = "profile" | "rounds" | "dsa" | "aptitude" | "hr" | "design" | "experiences" | "checklist";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: Building2 },
  { id: "rounds", label: "Rounds", icon: Users },
  { id: "dsa", label: "DSA", icon: Code2 },
  { id: "aptitude", label: "Aptitude", icon: Brain },
  { id: "hr", label: "HR", icon: MessageSquare },
  { id: "design", label: "System Design", icon: Layers },
  { id: "experiences", label: "Experiences", icon: BookOpen },
  { id: "checklist", label: "Tracker", icon: CheckCircle2 },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-green-500",
  Medium: "text-amber-500",
  Hard: "text-red-400",
  "Very High": "text-red-400",
  High: "text-amber-500",
  Moderate: "text-green-500",
};

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = String(params.slug);
  const [data, setData] = useState<CompanyPrepContent | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api<CompanyPrepContent>(`/api/company-prep/${slug}`);
    setLoading(false);
    if (res.success && res.data) setData(res.data);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleSection(sectionId: string) {
    if (!data) return;
    const res = await api<CompanyPrepContent>(
      `/api/company-prep/${slug}/sections/${sectionId}/complete`,
      { method: "POST" }
    );
    if (res.success && res.data) setData(res.data);
    else {
      const completed = new Set(data.progress.completedSections);
      if (completed.has(sectionId)) completed.delete(sectionId);
      else completed.add(sectionId);
      const list = [...completed];
      const total = data.prepChecklist.length;
      const progressPercent = total ? Math.round((list.length / total) * 1000) / 10 : 0;
      setData({
        ...data,
        progress: {
          completedSections: list,
          progressPercent,
          readinessScore: Math.min(progressPercent + 10, 100),
        },
      });
    }
  }

  const completed = new Set(data?.progress.completedSections ?? []);

  if (loading) {
    return (
      <>
        <DashboardHeader />
        <main className="p-8 text-center text-muted-foreground">Loading {slug} preparation...</main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <DashboardHeader />
        <main className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Company not found.</p>
          <Link href="/dashboard/company-prep">
            <Button variant="outline">Back to companies</Button>
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
        <Link
          href="/dashboard/company-prep"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> All companies
        </Link>

        <div className="flex flex-wrap items-start gap-4 mb-6">
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: data.logoColor }}
          >
            {data.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <p className="text-sm text-muted-foreground">
              {data.tier} · {data.profile.difficulty} · {data.profile.avgPackageLpa}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Readiness Score</p>
              <p className="text-3xl font-bold gradient-text">{data.progress.readinessScore}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Preparation Progress</p>
              <p className="text-3xl font-bold">{data.progress.progressPercent}%</p>
              <Progress value={data.progress.progressPercent} className="mt-3" />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border pb-2 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors",
                tab === t.id
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <Card>
            <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>{data.profile.description}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Info label="Industry" value={data.profile.industry} />
                <Info label="Headquarters" value={data.profile.headquarters} />
                <Info label="Avg. Package" value={data.profile.avgPackageLpa} />
                <Info label="Hiring Timeline" value={data.profile.hiringTimeline} />
                {data.profile.employeeCount && (
                  <Info label="Employees" value={data.profile.employeeCount} />
                )}
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {data.profile.focusAreas.map((f) => (
                    <span key={f} className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "rounds" && (
          <div className="space-y-4">
            {data.interviewRounds.map((r) => (
              <Card key={r.order}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="font-mono text-primary text-sm">Round {r.order}</span>
                    {r.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {r.duration} · {r.focus}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {r.tips.map((tip) => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "dsa" && (
          <Card>
            <CardHeader><CardTitle>Frequently Asked DSA Questions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data.dsaQuestions.map((q) => (
                <div
                  key={q.title}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-sm">{q.title}</p>
                    <p className="text-xs text-muted-foreground">{q.topics.join(" · ")}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn("font-medium", DIFFICULTY_COLOR[q.difficulty])}>
                      {q.difficulty}
                    </span>
                    <span className="text-muted-foreground">{q.frequency}</span>
                  </div>
                </div>
              ))}
              {data.dsaQuestions.length === 0 && (
                <p className="text-sm text-muted-foreground">Focus on aptitude for this company.</p>
              )}
            </CardContent>
          </Card>
        )}

        {tab === "aptitude" && (
          <div className="space-y-4">
            {data.aptitudePatterns.map((a) => (
              <Card key={a.type}>
                <CardHeader>
                  <CardTitle className="text-base">{a.type}</CardTitle>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>
                    <span className="text-muted-foreground">Topics: </span>
                    {a.topics.join(", ")}
                  </p>
                  <ul className="text-muted-foreground">
                    {a.tips.map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "hr" && (
          <Card>
            <CardHeader><CardTitle>HR Questions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.hrQuestions.map((q, i) => (
                <p key={q} className="text-sm py-2 border-b border-border/30 last:border-0">
                  {i + 1}. {q}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        {tab === "design" && (
          <Card>
            <CardHeader><CardTitle>System Design Questions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {data.systemDesignQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  System design is less common for this company&apos;s campus hiring track.
                </p>
              ) : (
                data.systemDesignQuestions.map((q) => (
                  <div key={q.title} className="rounded-lg border border-border/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{q.title}</p>
                      <span className={cn("text-xs font-medium", DIFFICULTY_COLOR[q.difficulty])}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{q.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {q.keyConcepts.map((c) => (
                        <span key={c} className="text-xs rounded-full bg-secondary px-2 py-0.5">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {tab === "experiences" && (
          <div className="space-y-4">
            {data.experiences.map((e, i) => (
              <Card key={`${e.role}-${e.year}-${i}`}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{e.role}</CardTitle>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        e.outcome === "Selected"
                          ? "bg-green-500/15 text-green-500"
                          : e.outcome === "Rejected"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {e.outcome}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {e.year} · {e.rounds}
                  </p>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>{e.summary}</p>
                  {e.tips && <p className="text-primary text-xs">Tip: {e.tips}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "checklist" && (
          <Card>
            <CardHeader>
              <CardTitle>Preparation Checklist</CardTitle>
              <p className="text-sm text-muted-foreground">
                Mark items complete to update your readiness score
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.prepChecklist.map((item) => {
                const done = completed.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSection(item.id)}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                      done ? "border-primary/30 bg-primary/5" : "border-border/50 hover:bg-muted/50"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={cn("text-sm font-medium", done && "line-through text-muted-foreground")}>
                        {item.label}
                      </p>
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

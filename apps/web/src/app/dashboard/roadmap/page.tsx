"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Map,
  CheckCircle2,
  Circle,
  Calendar,
  Target,
  Sparkles,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  PlacementRoadmapPlan,
  PlacementRoadmapRecord,
  RoadmapCategory,
} from "@placepro/shared";

const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Other",
];

const SKILL_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

const CATEGORY_LABELS: Record<RoadmapCategory, string> = {
  DSA: "DSA",
  APTITUDE: "Aptitude",
  SYSTEM_DESIGN: "System Design",
  CORE_SUBJECTS: "Core Subjects",
  PROJECTS: "Projects",
  RESUME_BUILDING: "Resume Building",
};

const CATEGORY_COLORS: Record<RoadmapCategory, string> = {
  DSA: "bg-blue-500/15 text-blue-400",
  APTITUDE: "bg-purple-500/15 text-purple-400",
  SYSTEM_DESIGN: "bg-amber-500/15 text-amber-400",
  CORE_SUBJECTS: "bg-green-500/15 text-green-400",
  PROJECTS: "bg-pink-500/15 text-pink-400",
  RESUME_BUILDING: "bg-cyan-500/15 text-cyan-400",
};

const GUEST_USER_ID = "demo-guest";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<PlacementRoadmapRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [branch, setBranch] = useState("Computer Science");
  const [graduationYear, setGraduationYear] = useState(2026);
  const [skillLevel, setSkillLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("INTERMEDIATE");
  const [targetCompanies, setTargetCompanies] = useState("Google, Microsoft, Amazon");
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(3);
  const [activeTab, setActiveTab] = useState<"overview" | "daily" | "weekly" | "monthly">("overview");

  const loadRoadmap = useCallback(async () => {
    setFetching(true);
    const res = await api<PlacementRoadmapRecord | null>(`/api/roadmap/${GUEST_USER_ID}`);
    setFetching(false);
    if (res.success && res.data) setRoadmap(res.data);
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const completedKeys = useMemo(
    () => new Set(roadmap?.completedTasks.map((t) => t.taskKey) ?? []),
    [roadmap?.completedTasks]
  );

  const plan = roadmap?.plan as PlacementRoadmapPlan | undefined;

  const upcomingTasks = useMemo(() => {
    if (!plan?.daily_tasks) return [];
    return plan.daily_tasks.filter((t) => !completedKeys.has(t.id)).slice(0, 5);
  }, [plan, completedKeys]);

  async function generateRoadmap() {
    setLoading(true);
    const companies = targetCompanies
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const res = await api<PlacementRoadmapRecord>("/api/roadmap/generate", {
      method: "POST",
      body: JSON.stringify({
        branch,
        graduationYear,
        skillLevel,
        targetCompanies: companies,
        studyHoursPerDay,
      }),
    });
    setLoading(false);
    if (res.success && res.data) setRoadmap(res.data);
  }

  async function toggleTask(taskKey: string, category?: RoadmapCategory) {
    if (!roadmap) return;
    const res = await api<PlacementRoadmapRecord>(
      `/api/roadmap/${roadmap.id}/tasks/${taskKey}/complete`,
      { method: "POST", body: JSON.stringify({ category }) }
    );
    if (res.success && res.data) setRoadmap(res.data);
    else if (roadmap) {
      const keys = new Set(roadmap.completedTasks.map((t) => t.taskKey));
      if (!keys.has(taskKey)) keys.add(taskKey);
      const total = plan?.daily_tasks.length ?? 1;
      const done = plan?.daily_tasks.filter((t) => keys.has(t.id)).length ?? 0;
      setRoadmap({
        ...roadmap,
        progressPercent: Math.round((done / total) * 1000) / 10,
        completedTasks: [
          ...roadmap.completedTasks,
          { taskKey, category: category ?? null, completedAt: new Date().toISOString() },
        ],
      });
    }
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="h-7 w-7 text-primary" />
          AI Placement Roadmap
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Personalized daily tasks, weekly milestones, and monthly goals for your placement journey
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Graduation Year</label>
              <input
                type="number"
                min={2020}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Current Skill Level</label>
              <select
                value={skillLevel}
                onChange={(e) =>
                  setSkillLevel(e.target.value as typeof skillLevel)
                }
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {SKILL_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Study Hours Per Day</label>
              <input
                type="number"
                min={1}
                max={16}
                value={studyHoursPerDay}
                onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-muted-foreground">Target Companies (comma-separated)</label>
              <input
                type="text"
                value={targetCompanies}
                onChange={(e) => setTargetCompanies(e.target.value)}
                placeholder="Google, Microsoft, Amazon"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Button variant="gradient" onClick={generateRoadmap} disabled={loading}>
                {loading ? "Generating roadmap..." : roadmap ? "Regenerate Roadmap" : "Generate Roadmap"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {fetching && !roadmap && (
          <p className="text-center text-muted-foreground py-12">Loading your roadmap...</p>
        )}

        {roadmap && plan && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">Completion</p>
                  <p className="text-3xl font-bold gradient-text">{roadmap.progressPercent}%</p>
                  <Progress value={roadmap.progressPercent} className="mt-3" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">Timeline</p>
                  <p className="text-3xl font-bold">{plan.timeline_months} months</p>
                  <p className="text-xs text-muted-foreground mt-1">{roadmap.branch} · Class of {roadmap.graduationYear}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">Daily commitment</p>
                  <p className="text-3xl font-bold flex items-center gap-1">
                    <Clock className="h-6 w-6 text-primary" />
                    {roadmap.studyHoursPerDay}h
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">{plan.summary}</p>
                {plan.adaptive_tips?.length > 0 && (
                  <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-medium text-primary mb-2">Adaptive planning tips</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {plan.adaptive_tips.map((tip) => (
                        <li key={tip}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2 border-b border-border pb-2">
              {(["overview", "daily", "weekly", "monthly"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg capitalize transition-colors",
                    activeTab === tab
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Upcoming Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {upcomingTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">All daily tasks completed!</p>
                    ) : (
                      upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 rounded-lg border border-border/50 px-4 py-3"
                        >
                          <button
                            type="button"
                            onClick={() => toggleTask(task.id, task.category)}
                            className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary"
                          >
                            <Circle className="h-5 w-5" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-sm">{task.title}</span>
                              <span className={cn("text-xs px-2 py-0.5 rounded-full", CATEGORY_COLORS[task.category])}>
                                {CATEGORY_LABELS[task.category]}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{task.duration_minutes}m</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">Learning Categories</CardTitle></CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    {(Object.keys(CATEGORY_LABELS) as RoadmapCategory[]).map((cat) => {
                      const info = plan.categories?.[cat];
                      if (!info) return null;
                      return (
                        <div key={cat} className="rounded-lg border border-border/50 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", CATEGORY_COLORS[cat])}>
                              {CATEGORY_LABELS[cat]}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">{info.priority} priority</span>
                          </div>
                          <p className="text-sm font-medium">{info.weekly_hours}h / week</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {info.focus_topics?.join(" · ")}
                          </p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {plan.skill_gaps?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Skill Gaps to Address</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {plan.skill_gaps.map((gap) => (
                        <span key={gap} className="rounded-full border border-border px-3 py-1 text-sm">
                          {gap}
                        </span>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader><CardTitle className="text-lg">Target Companies</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {(plan.target_companies ?? roadmap.targetCompanies).map((c) => (
                      <span key={c} className="rounded-full bg-primary/10 px-3 py-1 text-sm">{c}</span>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "daily" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Daily Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[480px] overflow-y-auto">
                  {plan.daily_tasks.map((task) => {
                    const done = completedKeys.has(task.id);
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border px-4 py-3 transition-opacity",
                          done ? "border-primary/30 bg-primary/5 opacity-80" : "border-border/50"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => !done && toggleTask(task.id, task.category)}
                          className="mt-0.5 shrink-0"
                          disabled={done}
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">Day {task.day}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", CATEGORY_COLORS[task.category])}>
                              {CATEGORY_LABELS[task.category]}
                            </span>
                          </div>
                          <p className={cn("text-sm font-medium mt-1", done && "line-through text-muted-foreground")}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{task.duration_minutes}m</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {activeTab === "weekly" && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Weekly Milestones</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {plan.weekly_milestones.map((m) => (
                    <div key={m.week} className="relative pl-6 border-l-2 border-primary/30 py-1">
                      <span className="absolute -left-[9px] top-3 h-4 w-4 rounded-full bg-primary" />
                      <p className="font-mono text-xs text-primary">Week {m.week}</p>
                      <p className="font-medium text-sm mt-1">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.deliverable}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.categories.map((c) => (
                          <span key={c} className={cn("text-xs px-2 py-0.5 rounded-full", CATEGORY_COLORS[c])}>
                            {CATEGORY_LABELS[c]}
                          </span>
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{m.hours}h total</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === "monthly" && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Monthly Goals</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {plan.monthly_goals.map((g) => (
                    <div key={g.month} className="rounded-lg border border-border/50 p-4">
                      <p className="font-mono text-xs text-primary">Month {g.month}</p>
                      <p className="font-medium mt-1">{g.title}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {g.categories.map((c) => (
                          <span key={c} className={cn("text-xs px-2 py-0.5 rounded-full", CATEGORY_COLORS[c])}>
                            {CATEGORY_LABELS[c]}
                          </span>
                        ))}
                      </div>
                      <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                        {g.targets.map((t) => (
                          <li key={t}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!fetching && !roadmap && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Map className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>Fill in your profile and generate your AI placement roadmap.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

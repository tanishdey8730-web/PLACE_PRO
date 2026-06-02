"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Lightbulb, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PlacementProbabilityResult } from "@placepro/shared";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const READINESS_COLOR: Record<string, string> = {
  Low: "text-red-400",
  Moderate: "text-amber-500",
  Good: "text-blue-400",
  Strong: "text-green-500",
};

function probColor(p: number) {
  if (p >= 75) return "bg-green-500";
  if (p >= 50) return "bg-blue-500";
  if (p >= 35) return "bg-amber-500";
  return "bg-red-400";
}

export default function PlacementProbabilityPage() {
  const [cgpa, setCgpa] = useState(8.2);
  const [dsaScore, setDsaScore] = useState(72);
  const [aptitudeScore, setAptitudeScore] = useState(78);
  const [resumeScore, setResumeScore] = useState(76);
  const [projects, setProjects] = useState(2);
  const [certifications, setCertifications] = useState(1);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [result, setResult] = useState<PlacementProbabilityResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function predict() {
    setLoading(true);
    const res = await api<PlacementProbabilityResult>("/api/placement-probability", {
      method: "POST",
      body: JSON.stringify({
        cgpa,
        dsaScore,
        aptitudeScore,
        resumeScore,
        projects,
        certifications,
        targetRole,
      }),
    });
    setLoading(false);
    if (res.success && res.data) setResult(res.data);
  }

  const chartData =
    result?.companyProbabilities.map((c) => ({
      name: c.company,
      probability: c.probability,
      tier: c.tier,
    })) ?? [];

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-7 w-7 text-primary" />
          Placement Probability Predictor
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Estimate your placement odds overall and company-by-company
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">CGPA (0–10)</label>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={10}
                    value={cgpa}
                    onChange={(e) => setCgpa(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Target Role</label>
                  <input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {[
                { label: "DSA Score", value: dsaScore, set: setDsaScore },
                { label: "Aptitude Score", value: aptitudeScore, set: setAptitudeScore },
                { label: "Resume Score", value: resumeScore, set: setResumeScore },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium">{s.value}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.value}
                    onChange={(e) => s.set(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              ))}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Projects</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={projects}
                    onChange={(e) => setProjects(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Certifications</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={certifications}
                    onChange={(e) => setCertifications(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <Button variant="gradient" className="w-full" onClick={predict} disabled={loading}>
                {loading ? "Predicting..." : "Predict Placement Probability"}
              </Button>
            </CardContent>
          </Card>

          {result ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Overall Placement Probability</p>
                  <p className="text-4xl font-bold gradient-text mt-1">{result.overallProbability}%</p>
                  <p className={cn("text-sm font-medium mt-2", READINESS_COLOR[result.readinessLevel])}>
                    Readiness: {result.readinessLevel}
                  </p>
                  <Progress value={result.overallProbability} className="mt-4" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 text-center text-xs">
                  {Object.entries(result.scoreBreakdown).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-muted/50 py-2">
                      <p className="text-muted-foreground uppercase">{k}</p>
                      <p className="font-bold text-sm mt-0.5">{v}%</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-dashed flex items-center justify-center min-h-[280px]">
              <CardContent className="text-center text-muted-foreground py-12">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>Enter your scores and run prediction.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {result && (
          <>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company-wise Probability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [`${v}%`, "Probability"]}
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.tier === "Service" ? "#8b5cf6" : "#3b82f6"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {result.companyProbabilities.map((c) => (
                    <div
                      key={c.slug}
                      className="flex items-center gap-3 rounded-lg border border-border/50 px-4 py-2.5"
                    >
                      <span className="w-24 text-sm font-medium shrink-0">{c.company}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", probColor(c.probability))}
                          style={{ width: `${c.probability}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-12 text-right">{c.probability}%</span>
                      <span className="text-xs text-muted-foreground w-14 hidden sm:block">{c.tier}</span>
                      <Link
                        href={`/dashboard/company-prep/${c.slug}`}
                        className="text-xs text-primary hover:underline shrink-0"
                      >
                        Prep
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.improvementSuggestions.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="text-primary">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </>
  );
}

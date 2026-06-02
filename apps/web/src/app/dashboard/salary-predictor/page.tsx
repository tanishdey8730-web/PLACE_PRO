"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  MapPin,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { api } from "@/lib/api";
import type {
  MarketInsight,
  SalaryPredictorHistoryItem,
  SalaryPredictorResult,
} from "@placepro/shared";
import { SALARY_COMPANY_TYPES } from "@placepro/shared";

const LOCATIONS = [
  "Bangalore",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Chennai",
  "Delhi NCR",
  "Remote (India)",
  "Remote (US)",
];

function trendIcon(trend: MarketInsight["trend"]) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export default function SalaryPredictorPage() {
  const [skillsInput, setSkillsInput] = useState("Python, React, AWS, DSA");
  const [experienceYears, setExperienceYears] = useState("1");
  const [location, setLocation] = useState("Bangalore");
  const [companyType, setCompanyType] = useState(SALARY_COMPANY_TYPES[0]!.id);
  const [role, setRole] = useState("Software Engineer");
  const [result, setResult] = useState<SalaryPredictorResult | null>(null);
  const [history, setHistory] = useState<SalaryPredictorHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(() => {
    api<SalaryPredictorHistoryItem[]>("/api/salary-predictor/history").then((res) => {
      if (res.success && res.data) setHistory(res.data);
    });
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function predict() {
    setLoading(true);
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await api<SalaryPredictorResult>("/api/salary-predictor", {
      method: "POST",
      body: JSON.stringify({
        skills,
        experienceYears: Number(experienceYears) || 0,
        location,
        companyType,
        role: role || undefined,
      }),
    });
    setLoading(false);
    if (res.success && res.data) {
      setResult(res.data);
      loadHistory();
    }
  }

  const range = result?.salaryRange;
  const growth = result?.growthPotential;

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <IndianRupee className="h-7 w-7 text-primary" />
          AI Salary Predictor
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Estimate your salary range, market insights, and growth potential from skills and context
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Your profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Role (optional)</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Skills (comma-separated)</label>
                <Input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Python, AWS, System Design"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Experience (years)</label>
                <Input
                  type="number"
                  min={0}
                  max={40}
                  step={0.5}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Company type
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value as typeof companyType)}
                >
                  {SALARY_COMPANY_TYPES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button className="w-full" variant="gradient" onClick={predict} disabled={loading}>
                {loading ? "Predicting…" : "Predict salary"}
              </Button>
              {history.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Recent predictions</p>
                  <ul className="space-y-1 text-sm max-h-28 overflow-y-auto">
                    {history.map((h) => (
                      <li key={h.id} className="text-muted-foreground">
                        {h.medianLpa} LPA · {h.location} ·{" "}
                        {SALARY_COMPANY_TYPES.find((c) => c.id === h.companyType)?.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {result && range ? (
              <>
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Salary range (annual)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-primary">
                        ₹{range.minLpa}–{range.maxLpa}
                      </span>
                      <span className="text-lg text-muted-foreground mb-1">LPA</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Median estimate: <strong className="text-foreground">{range.medianLpa} LPA</strong>{" "}
                      ({range.currency})
                    </p>
                    <div className="mt-4 relative h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-[10%] right-[10%] bg-gradient-to-r from-blue-600/60 to-purple-600/80 rounded-full"
                        style={{
                          left: `${Math.max(5, (range.minLpa / range.maxLpa) * 30)}%`,
                          right: `${Math.max(5, 100 - (range.maxLpa / (range.maxLpa * 1.2)) * 85)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Min {range.minLpa}</span>
                      <span>Median {range.medianLpa}</span>
                      <span>Max {range.maxLpa}</span>
                    </div>
                  </CardContent>
                </Card>

                {growth && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Growth potential
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Score</span>
                        <span className="text-2xl font-semibold">{growth.score}/100</span>
                      </div>
                      <Progress value={growth.score} className="h-2" />
                      <p className="text-sm">{growth.outlook}</p>
                      {growth.fiveYearProjection && (
                        <p className="text-sm text-primary">
                          5-year projection: ₹{growth.fiveYearProjection.minLpa}–
                          {growth.fiveYearProjection.maxLpa} LPA
                        </p>
                      )}
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {growth.factors.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Market insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.marketInsights.map((insight, i) => (
                      <div
                        key={i}
                        className="flex gap-3 rounded-lg border border-border/50 p-3"
                      >
                        <div className="mt-0.5">{trendIcon(insight.trend)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{insight.title}</p>
                            <Badge
                              variant={
                                insight.trend === "up"
                                  ? "success"
                                  : insight.trend === "down"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-xs font-normal capitalize"
                            >
                              {insight.trend}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <IndianRupee className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Enter your skills, experience, location, and company type to see a prediction.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-8">
          Estimates are AI-assisted benchmarks for the Indian market and vary by offer, equity, and
          negotiation.
        </p>
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "@/lib/api";
import type { CareerCoachDashboard } from "@placepro/shared";

export function CareerCoachDashboardPanel({ targetRole }: { targetRole: string }) {
  const [data, setData] = useState<CareerCoachDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<CareerCoachDashboard>(
      `/api/career-coach/dashboard?targetRole=${encodeURIComponent(targetRole)}`
    ).then((res) => {
      setLoading(false);
      if (res.success && res.data) setData(res.data);
    });
  }, [targetRole]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Career Score", value: data.careerScore },
          { label: "Placement Probability", value: data.placementProbability },
          { label: "Industry Readiness", value: data.industryReadinessScore },
          {
            label: "Salary (median)",
            value: `₹${data.salaryRange.medianLpa} LPA`,
            isText: true,
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">
                {s.isText ? s.value : `${s.value}%`}
              </p>
              {!s.isText && <Progress value={s.value as number} className="mt-2 h-1.5" />}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Skill radar</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.skillRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar dataKey="score" stroke="#3b82f6" fill="#8b5cf6" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Growth graph</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.growthGraph}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Strengths</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {data.strengths.map((s) => (
              <p key={s}>✓ {s}</p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Weaknesses & gaps</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {data.weaknesses.map((s) => (
              <p key={s} className="text-muted-foreground">• {s}</p>
            ))}
            <div className="flex flex-wrap gap-1 mt-2">
              {data.missingSkills.map((s) => (
                <Badge key={s} variant="warning" className="font-normal">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recommended roles</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.recommendedRoles.map((r) => (
            <Badge key={r} variant="secondary" className="font-normal">{r}</Badge>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="30">
        <TabsList>
          <TabsTrigger value="30">30-day</TabsTrigger>
          <TabsTrigger value="60">60-day</TabsTrigger>
          <TabsTrigger value="90">90-day</TabsTrigger>
        </TabsList>
        {(["30", "60", "90"] as const).map((key) => {
          const phases =
            key === "30"
              ? data.roadmaps.days30
              : key === "60"
                ? data.roadmaps.days60
                : data.roadmaps.days90;
          return (
            <TabsContent key={key} value={key} className="space-y-3">
              {phases.map((phase) => (
                <Card key={phase.week}>
                  <CardContent className="pt-4">
                    <p className="font-medium text-primary">{phase.week}</p>
                    <p className="text-sm text-muted-foreground">{phase.focus}</p>
                    <ul className="text-sm mt-2 space-y-1">
                      {phase.tasks.map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Milestones: {phase.milestones.join(", ")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          );
        })}
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-base">Improvement suggestions</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          {data.improvementSuggestions.map((s) => (
            <p key={s}>→ {s}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

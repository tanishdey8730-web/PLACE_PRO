"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "@/lib/api";
import type { AnalyticsDashboard } from "@placepro/shared";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AnalyticsDashboard>("/api/analytics").then((res) => {
      setLoading(false);
      if (res.success && res.data) setData(res.data);
    });
  }, []);

  if (loading) {
    return (
      <>
        <DashboardHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </main>
      </>
    );
  }

  if (!data) return null;

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 space-y-8 pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold">Progress Analytics</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Placement readiness", value: data.placementReadiness },
            { label: "Coding", value: data.codingScore },
            { label: "Aptitude", value: data.aptitudeScore },
            { label: "Interviews", value: data.interviewScore },
            { label: "Resume", value: data.resumeScore },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}%</p>
                <Progress value={s.value} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Skill Radar</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.skillRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Problem Status</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.problemStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.problemStatus.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Readiness Trend</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.readinessTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Activity Heatmap</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 max-w-md">
                {data.activityHeatmap.map((d) => (
                  <div
                    key={d.day}
                    className="aspect-square rounded-sm"
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${0.15 + d.count * 0.2})`,
                    }}
                    title={`${d.day}: ${d.count} activities`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Interview Success Rate</CardTitle></CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{data.interviewSuccessRate}%</p>
              <p className="text-sm text-muted-foreground mt-2">Mocks scored 70+</p>
              <ul className="mt-4 space-y-2 text-sm">
                {data.skillGrowth.map((g) => (
                  <li key={g.skill} className="flex justify-between">
                    <span>{g.skill}</span>
                    <span className="text-emerald-500">+{g.delta}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

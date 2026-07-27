"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Code2,
  Brain,
  Mic,
  FileText,
  TrendingUp,
  Calendar,
  Lightbulb,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureHub } from "@/components/dashboard/feature-hub";

interface DashboardData {
  placementReadiness: number;
  codingScore: number;
  aptitudeScore: number;
  interviewScore: number;
  resumeAtsScore: number;
  dailyStreak: number;
  totalXp: number;
  level: number;
  recentActivity: { problem: { title: string; slug: string }; status: string }[];
  upcomingTests: { title: string; startTime: string }[];
  practiceRecommendations: { title: string; slug: string; difficulty: string }[];
  aiInsights: string[];
  skillGaps: string[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api<DashboardData>("/api/dashboard/stats").then((res) => {
      if (res.success && res.data) setData(res.data);
      else {
        setData({
          placementReadiness: 72,
          codingScore: 68,
          aptitudeScore: 75,
          interviewScore: 60,
          resumeAtsScore: 78,
          dailyStreak: 7,
          totalXp: 1250,
          level: 5,
          recentActivity: [],
          upcomingTests: [{ title: "Weekly Coding Challenge", startTime: new Date().toISOString() }],
          practiceRecommendations: [{ title: "Two Sum", slug: "two-sum", difficulty: "EASY" }],
          aiInsights: ["Focus on Dynamic Programming", "Complete 2 mock interviews this week"],
          skillGaps: ["Graphs", "Dynamic Programming"],
        });
      }
    });
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const scores = [
    { label: "Placement Ready", value: data.placementReadiness, icon: Target, color: "from-blue-500 to-cyan-500", href: "/dashboard/analytics" },
    { label: "Coding", value: data.codingScore, icon: Code2, color: "from-purple-500 to-pink-500", href: "/dashboard/coding" },
    { label: "Aptitude", value: data.aptitudeScore, icon: Brain, color: "from-violet-500 to-purple-500", href: "/dashboard/aptitude" },
    { label: "Interview", value: data.interviewScore, icon: Mic, color: "from-amber-500 to-orange-500", href: "/dashboard/interviews" },
    { label: "Resume ATS", value: data.resumeAtsScore, icon: FileText, color: "from-emerald-500 to-teal-500", href: "/dashboard/resume" },
  ];

  return (
    <>
      <DashboardHeader streak={data.dailyStreak} level={data.level} />
      <main className="p-4 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your placement preparation at a glance</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {scores.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="h-full hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <s.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">{Math.round(s.value)}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{s.label}</p>
                  <Progress value={s.value} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.aiInsights.map((insight) => (
                <div key={insight} className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
                  {insight}
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-muted-foreground">Skill gaps:</span>
                {data.skillGaps.map((g) => (
                  <Badge key={g} variant="warning">{g}</Badge>
                ))}
              </div>
              <Link href="/dashboard/career/dashboard">
                <Button variant="outline" size="sm" className="mt-2">Open Career Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Total XP</span>
                <span className="font-bold gradient-text">{data.totalXp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Daily Streak</span>
                <span className="font-bold">{data.dailyStreak} days 🔥</span>
              </div>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.upcomingTests.map((t) => (
                <div key={t.title} className="flex justify-between items-center rounded-lg border border-border/50 px-4 py-3">
                  <span className="text-sm font-medium">{t.title}</span>
                  <Badge>Upcoming</Badge>
                </div>
              ))}
              <Link href="/dashboard/contests">
                <Button variant="gradient" size="sm">View Contests</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Practice Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.practiceRecommendations.map((p) => (
                <Link
                  key={p.slug}
                  href={`/dashboard/coding/${p.slug}`}
                  className="flex justify-between items-center rounded-lg border border-border/50 px-4 py-3 hover:border-primary/30 transition-colors"
                >
                  <span className="text-sm font-medium">{p.title}</span>
                  <Badge variant={p.difficulty === "EASY" ? "success" : p.difficulty === "MEDIUM" ? "warning" : "destructive"}>
                    {p.difficulty}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Explore Features</h2>
              <p className="text-sm text-muted-foreground">Each tool opens on its own page</p>
            </div>
            <Link href="/dashboard/features">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </div>
          <FeatureHub showCategories={false} limit={9} title="" description="" />
        </section>
      </main>
    </>
  );
}

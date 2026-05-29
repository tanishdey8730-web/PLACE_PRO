"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const skillData = [
  { subject: "Arrays", score: 85 },
  { subject: "Strings", score: 78 },
  { subject: "Trees", score: 55 },
  { subject: "Graphs", score: 45 },
  { subject: "DP", score: 40 },
  { subject: "Aptitude", score: 75 },
];

const pieData = [
  { name: "Solved", value: 45, color: "#3b82f6" },
  { name: "Attempted", value: 30, color: "#8b5cf6" },
  { name: "Todo", value: 125, color: "#374151" },
];

const trendData = [
  { week: "W1", score: 40 },
  { week: "W2", score: 52 },
  { week: "W3", score: 58 },
  { week: "W4", score: 65 },
  { week: "W5", score: 72 },
];

const heatmap = Array.from({ length: 28 }, (_, i) => ({
  day: i,
  intensity: Math.floor(Math.random() * 4),
}));

export default function AnalyticsPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 space-y-8">
        <h1 className="text-2xl font-bold">Progress Analytics</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Skill Radar</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData}>
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
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((e) => (
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
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Activity Heatmap</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 max-w-md">
                {heatmap.map((d) => (
                  <div
                    key={d.day}
                    className="aspect-square rounded-sm"
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${0.2 + d.intensity * 0.2})`,
                    }}
                    title={`Day ${d.day + 1}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { RecruiterAnalytics } from "@placepro/shared";
import { Users, Briefcase, FileText, Calendar, TrendingUp } from "lucide-react";

export default function RecruiterAnalyticsPage() {
  const [data, setData] = useState<RecruiterAnalytics | null>(null);

  useEffect(() => {
    api<RecruiterAnalytics>("/api/recruiter/analytics").then((res) => {
      if (res.success && res.data) setData(res.data);
    });
  }, []);

  if (!data) {
    return <p className="p-8 text-muted-foreground text-sm">Loading analytics…</p>;
  }

  const stats = [
    { label: "Candidates", value: data.totalCandidates, icon: Users },
    { label: "Active jobs", value: data.activeJobs, icon: Briefcase },
    { label: "Applications", value: data.totalApplications, icon: FileText },
    { label: "Interviews scheduled", value: data.interviewsScheduled, icon: Calendar },
  ];

  return (
    <main className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recruiter overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Candidate analytics and hiring pipeline for your postings
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Score averages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Coding</span>
              <span className="font-medium">{data.scoreAverages.coding}</span>
            </div>
            <div className="flex justify-between">
              <span>Aptitude</span>
              <span className="font-medium">{data.scoreAverages.aptitude}</span>
            </div>
            <div className="flex justify-between">
              <span>Interview</span>
              <span className="font-medium">{data.scoreAverages.interview}</span>
            </div>
            <div className="flex justify-between">
              <span>Readiness</span>
              <span className="font-medium">{data.scoreAverages.readiness}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.pipeline.map((p) => (
              <div key={p.status} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{p.status}</span>
                <span className="font-medium">{p.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top skills in pool</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.topSkills.map((s) => (
            <span
              key={s.skill}
              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
            >
              {s.skill} ({s.count})
            </span>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent applications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border text-sm">
            {data.recentApplications.map((a) => (
              <li key={a.id} className="flex justify-between py-2">
                <span>
                  {a.candidateName} · {a.jobTitle}
                </span>
                <span className="text-muted-foreground">{a.status}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}

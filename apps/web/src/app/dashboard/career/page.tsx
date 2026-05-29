"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { api } from "@/lib/api";

const roles = ["Software Engineer", "Data Scientist", "Cloud Engineer", "AI Engineer", "Cybersecurity Analyst"];

export default function CareerPage() {
  const [plan, setPlan] = useState<{
    career_path: string;
    learning_plan: { week: number; focus: string; hours: number }[];
    recommended_companies: string[];
    certifications: string[];
  } | null>(null);
  const [role, setRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);

  async function generatePlan() {
    setLoading(true);
    const res = await api("/api/career/plan", {
      method: "POST",
      body: JSON.stringify({ targetRole: role }),
    });
    setLoading(false);
    if (res.success && res.data) setPlan(res.data as typeof plan);
    else {
      setPlan({
        career_path: role,
        learning_plan: [
          { week: 1, focus: "Arrays & Strings", hours: 12 },
          { week: 2, focus: "Linked Lists & Trees", hours: 12 },
          { week: 3, focus: "Dynamic Programming", hours: 15 },
        ],
        recommended_companies: ["Google", "Microsoft", "Amazon"],
        certifications: ["AWS Cloud Practitioner"],
      });
    }
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          AI Career Coach
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">Personalized career paths & learning plans</p>

        <Card className="mb-8">
          <CardContent className="pt-6 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground">Target Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <Button variant="gradient" onClick={generatePlan} disabled={loading}>
              {loading ? "Generating..." : "Generate Plan"}
            </Button>
          </CardContent>
        </Card>

        {plan && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Career Path: {plan.career_path}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {plan.learning_plan.map((w) => (
                  <div key={w.week} className="flex justify-between rounded-lg border border-border/50 px-4 py-3">
                    <span className="font-mono text-primary text-sm">Week {w.week}</span>
                    <span className="text-sm">{w.focus}</span>
                    <span className="text-sm text-muted-foreground">{w.hours}h</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Recommended Companies</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {plan.recommended_companies.map((c) => (
                    <span key={c} className="rounded-full bg-primary/10 px-3 py-1 text-sm">{c}</span>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Certifications</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {plan.certifications.map((c) => (
                    <p key={c} className="text-sm">• {c}</p>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

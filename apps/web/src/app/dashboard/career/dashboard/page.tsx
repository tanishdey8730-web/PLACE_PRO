"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { CareerCoachDashboardPanel } from "@/components/career/career-coach-dashboard";

const ROLES = [
  "Software Engineer",
  "Data Scientist",
  "Cloud Engineer",
  "AI Engineer",
  "Cybersecurity Analyst",
  "Product Manager",
];

export default function CareerDashboardPage() {
  const [targetRole, setTargetRole] = useState("Software Engineer");

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
        <Link
          href="/dashboard/career"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          AI Career Coach
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Career Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Career score, roadmaps, skill radar & placement insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <Link href="/dashboard/career/chat">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Open Coach Chat
              </Button>
            </Link>
          </div>
        </div>

        <CareerCoachDashboardPanel targetRole={targetRole} />
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, ChevronRight, Target } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CompanyPrepTrackerItem } from "@placepro/shared";

const COMPANIES = [
  "google",
  "amazon",
  "microsoft",
  "meta",
  "adobe",
  "atlassian",
  "tcs",
  "infosys",
  "wipro",
  "accenture",
];

export default function CompanyPrepPage() {
  const [tracker, setTracker] = useState<CompanyPrepTrackerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await api<CompanyPrepTrackerItem[]>("/api/company-prep");
      setLoading(false);
      if (res.success && res.data?.length) {
        setTracker(res.data);
      } else {
        setTracker(
          COMPANIES.map((slug) => ({
            slug,
            name: slug.charAt(0).toUpperCase() + slug.slice(1),
            logoColor: "#6366f1",
            tier: ["tcs", "infosys", "wipro", "accenture"].includes(slug)
              ? ("Service" as const)
              : ("Product" as const),
            difficulty: "High",
            progressPercent: 0,
            readinessScore: 0,
          }))
        );
      }
    }
    load();
  }, []);

  const product = tracker.filter((c) => c.tier === "Product");
  const service = tracker.filter((c) => c.tier === "Service");
  const avgReadiness =
    tracker.length > 0
      ? Math.round((tracker.reduce((s, c) => s + c.readinessScore, 0) / tracker.length) * 10) / 10
      : 0;
  const avgProgress =
    tracker.length > 0
      ? Math.round((tracker.reduce((s, c) => s + c.progressPercent, 0) / tracker.length) * 10) / 10
      : 0;

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary" />
          Company-Specific Preparation
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Interview rounds, DSA, aptitude, HR, system design, and real experiences — tailored per company
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Target className="h-4 w-4" /> Avg. Readiness Score
              </p>
              <p className="text-3xl font-bold gradient-text mt-1">{avgReadiness}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-3xl font-bold mt-1">{avgProgress}%</p>
              <Progress value={avgProgress} className="mt-3" />
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading company tracker...</p>
        ) : (
          <>
            <CompanySection title="Product Companies" companies={product} />
            <CompanySection title="Service Companies" companies={service} />
          </>
        )}
      </main>
    </>
  );
}

function CompanySection({
  title,
  companies,
}: {
  title: string;
  companies: CompanyPrepTrackerItem[];
}) {
  if (!companies.length) return null;
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {companies.map((c) => (
          <Link key={c.slug} href={`/dashboard/company-prep/${c.slug}`}>
            <Card className="hover:border-primary/40 transition-colors h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: c.logoColor }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{c.difficulty} difficulty</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{c.progressPercent}%</span>
                </div>
                <Progress value={c.progressPercent} className="mb-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Readiness</span>
                  <span
                    className={cn(
                      "font-medium",
                      c.readinessScore >= 70
                        ? "text-green-500"
                        : c.readinessScore >= 40
                          ? "text-amber-500"
                          : "text-muted-foreground"
                    )}
                  >
                    {c.readinessScore}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

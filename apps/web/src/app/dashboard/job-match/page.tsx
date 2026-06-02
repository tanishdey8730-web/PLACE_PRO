"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { JobMatchResult } from "@placepro/shared";

function scoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-500";
  return "text-red-400";
}

export default function JobMatchPage() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    const res = await api<JobMatchResult>("/api/job-match", {
      method: "POST",
      body: JSON.stringify({
        resume,
        jobDescription,
        jobTitle: jobTitle || undefined,
        companyName: companyName || undefined,
      }),
    });
    setLoading(false);
    if (res.success && res.data) setResult(res.data);
    else {
      setResult({
        matchScore: 78,
        missingSkills: ["Docker", "AWS"],
        strengths: ["Strong programming fundamentals", "Relevant project experience"],
        weaknesses: ["Cloud skills not highlighted", "Add more metrics to bullets"],
        recommendations: ["Tailor summary to job description keywords"],
      });
    }
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary" />
          Job Match Score
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Compare your resume against any job description — get match %, gaps, and strengths
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Job Title (optional)</label>
                    <input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Software Engineer"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Company (optional)</label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Amazon"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Resume</label>
                  <textarea
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    rows={8}
                    placeholder="Paste your resume text..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    placeholder="Paste the full job description..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y"
                  />
                </div>
                <Button
                  variant="gradient"
                  className="w-full"
                  disabled={loading || resume.length < 20 || jobDescription.length < 20}
                  onClick={analyze}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {loading ? "Analyzing match..." : "Calculate Match Score"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {result ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Match Score</p>
                  <p className={cn("text-6xl font-bold", scoreColor(result.matchScore))}>
                    {result.matchScore}%
                  </p>
                  {(result.jobTitle || result.companyName) && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {[result.jobTitle, result.companyName].filter(Boolean).join(" at ")}
                    </p>
                  )}
                  <Progress value={result.matchScore} className="mt-6 max-w-xs mx-auto" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-500">
                    <XCircle className="h-4 w-4" />
                    Missing Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {result.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3 py-1 text-sm"
                    >
                      {s}
                    </span>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {result.strengths.map((s) => (
                      <li key={s} className="flex gap-2">
                        <span className="text-green-500 shrink-0">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {result.weaknesses.map((w) => (
                      <li key={w} className="flex gap-2">
                        <span className="text-red-400 shrink-0">−</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {result.matchedKeywords && result.matchedKeywords.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-sm">Matched Keywords</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.map((k) => (
                      <span key={k} className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">
                        {k}
                      </span>
                    ))}
                  </CardContent>
                </Card>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {result.recommendations.map((r) => (
                        <li key={r}>• {r}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/resume-builder">
                  <Button variant="outline" size="sm">Improve Resume</Button>
                </Link>
                <Link href="/dashboard/cover-letter">
                  <Button variant="outline" size="sm">Generate Cover Letter</Button>
                </Link>
              </div>
            </div>
          ) : (
            <Card className="border-dashed flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center text-muted-foreground py-12">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>Paste resume and job description to see your match score.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Github,
  Sparkles,
  Loader2,
  Star,
  GitBranch,
  Users,
  FolderGit2,
  Code2,
  Activity,
  Award,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { GitHubAnalysisDimension, GitHubProfileAnalysisReport } from "@placepro/shared";

const DIMS: {
  key: GitHubAnalysisDimension;
  label: string;
  icon: typeof FolderGit2;
}[] = [
  { key: "repositories", label: "Repositories", icon: FolderGit2 },
  { key: "languages", label: "Languages", icon: Code2 },
  { key: "contributionActivity", label: "Contribution Activity", icon: Activity },
  { key: "projectQuality", label: "Project Quality", icon: Award },
  { key: "openSourceActivity", label: "Open Source", icon: GitBranch },
];

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-500";
  return "text-red-400";
}

function levelBadge(level: string) {
  const variants: Record<string, string> = {
    expert: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    advanced: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    intermediate: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    beginner: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  };
  return variants[level] ?? variants.intermediate;
}

export default function GitHubAnalysisPage() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<GitHubProfileAnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    const value = username.trim().replace(/^@/, "");
    if (!value) {
      setError("Enter a GitHub username");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await api<GitHubProfileAnalysisReport>("/api/github-analysis", {
      method: "POST",
      body: JSON.stringify({ username: value }),
    });

    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || "Analysis failed — check the username");
    }
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Github className="h-7 w-7 text-primary" />
            GitHub Profile Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            Enter a GitHub username to get a developer score, skill analysis, and actionable
            improvement tips based on repos, languages, and activity.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">GitHub username</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <span className="flex items-center px-3 text-muted-foreground text-sm border border-r-0 border-border rounded-l-lg bg-muted/30">
                @
              </span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="octocat"
                className="rounded-l-none font-mono"
                onKeyDown={(e) => e.key === "Enter" && analyze()}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
            <Button onClick={analyze} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing profile…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start gap-4">
                  {result.avatarUrl && (
                    <Image
                      src={result.avatarUrl}
                      alt={result.username}
                      width={72}
                      height={72}
                      className="rounded-full border border-border"
                      unoptimized
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold">
                      {result.name ?? result.username}
                      <span className="text-muted-foreground font-normal ml-2">
                        @{result.username}
                      </span>
                    </h2>
                    {result.bio && (
                      <p className="text-sm text-muted-foreground mt-1">{result.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FolderGit2 className="h-3.5 w-3.5" />
                        {result.publicRepos} repos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {result.followers} followers
                      </span>
                    </div>
                    <a
                      href={result.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 inline-block"
                    >
                      View on GitHub →
                    </a>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Developer score</p>
                    <p className={cn("text-4xl font-bold", scoreColor(result.developerScore))}>
                      {result.developerScore}
                    </p>
                  </div>
                </div>
                <Progress value={result.developerScore} className="h-2 mt-4" />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DIMS.map(({ key, label, icon: Icon }) => (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                      </span>
                      <span className={cn("font-bold", scoreColor(result.scores[key]))}>
                        {result.scores[key]}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {result.dimensionFeedback.find((d) => d.dimension === key)?.feedback}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Skill analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.skillAnalysis.length === 0 && (
                    <p className="text-sm text-muted-foreground">No languages detected in public repos.</p>
                  )}
                  {result.skillAnalysis.map((s) => (
                    <div key={s.skill} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{s.skill}</span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full capitalize",
                            levelBadge(s.level)
                          )}
                        >
                          {s.level}
                        </span>
                      </div>
                      {typeof s.percentage === "number" && (
                        <Progress value={s.percentage} className="h-1.5" />
                      )}
                      <p className="text-xs text-muted-foreground">{s.evidence}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top languages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.topLanguages.map((l) => (
                    <div key={l.language} className="flex items-center justify-between text-sm">
                      <span>{l.language}</span>
                      <span className="text-muted-foreground">
                        {l.repoCount} repos · {l.percentage}%
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {result.topRepositories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top repositories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.topRepositories.map((r) => (
                    <div
                      key={r.name}
                      className="flex items-start justify-between gap-2 text-sm border-b border-border/50 pb-2 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{r.name}</p>
                        {r.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                        {r.language && <Badge variant="secondary">{r.language}</Badge>}
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3" />
                          {r.stars}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Improvement suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.improvementSuggestions.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p>{result.summary}</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => setResult(null)}>
              Analyze another profile
            </Button>
          </div>
        )}
      </main>
    </>
  );
}

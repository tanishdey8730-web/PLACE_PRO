"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FolderGit2,
  Sparkles,
  Loader2,
  Star,
  Code2,
  Layers,
  FileText,
  Briefcase,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ProjectReviewDimension, ProjectReviewReport } from "@placepro/shared";

const DIMS: {
  key: ProjectReviewDimension;
  label: string;
  icon: typeof Code2;
}[] = [
  { key: "codeQuality", label: "Code Quality", icon: Code2 },
  { key: "architecture", label: "Architecture", icon: Layers },
  { key: "documentation", label: "Documentation", icon: FileText },
  { key: "resumeWorthiness", label: "Resume Worthiness", icon: Briefcase },
];

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-500";
  return "text-red-400";
}

export default function ProjectReviewPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState<ProjectReviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function review() {
    const url = repoUrl.trim();
    if (url.length < 5) {
      setError("Enter a valid GitHub repository URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await api<ProjectReviewReport>("/api/project-review", {
      method: "POST",
      body: JSON.stringify({ repoUrl: url }),
    });

    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || "Review failed — check the URL is public");
    }
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderGit2 className="h-7 w-7 text-primary" />
            AI Project Reviewer
          </h1>
          <p className="text-muted-foreground mt-1">
            Paste a public GitHub repo URL — get scores for code quality, architecture,
            documentation, resume impact, plus missing features and improvement tips.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">GitHub repository</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/project-name"
              className="font-mono text-sm"
            />
            {error && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
            <Button onClick={review} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing repository…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Review project
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Public repos only. We read metadata, README, languages, and root structure via
              GitHub API.
            </p>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{result.repoFullName}</h2>
                    {result.description && (
                      <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                        {result.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.primaryLanguage && (
                        <Badge variant="secondary">{result.primaryLanguage}</Badge>
                      )}
                      {typeof result.stars === "number" && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          {result.stars}
                        </Badge>
                      )}
                      {result.techStack?.slice(0, 4).map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Project score</p>
                    <p className={cn("text-4xl font-bold", scoreColor(result.scores.overall))}>
                      {result.scores.overall}
                    </p>
                  </div>
                </div>
                <Progress value={result.scores.overall} className="h-2 mt-4" />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
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
                  <CardContent className="text-sm text-muted-foreground">
                    {result.dimensionFeedback.find((d) => d.dimension === key)?.feedback}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Missing features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {result.missingFeatures.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-muted-foreground">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

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
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <p>{result.summary}</p>
                <div>
                  <p className="font-medium mb-2">Strengths</p>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => setResult(null)}>
              Review another repository
            </Button>
          </div>
        )}
      </main>
    </>
  );
}

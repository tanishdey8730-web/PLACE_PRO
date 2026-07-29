"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Map, RotateCcw, Shuffle } from "lucide-react";
import type { TestResult } from "./test-runner";

interface TestResultsProps {
  result: TestResult;
  onRetry?: () => void;
  onNewMock?: () => void;
  newMockLabel?: string;
  showRoadmap?: boolean;
}

export function TestResults({
  result,
  onRetry,
  onNewMock,
  newMockLabel = "Try New Mock",
  showRoadmap = true,
}: TestResultsProps) {
  const readiness = result.placementReadiness ?? result.score;

  function saveRoadmapPrefill() {
    if (!result.roadmapSuggestion) return;
    sessionStorage.setItem(
      "placepro_roadmap_prefill",
      JSON.stringify({
        branch: result.roadmapSuggestion.branch,
        skillLevel: result.roadmapSuggestion.skillLevel,
        studyHoursPerDay: result.roadmapSuggestion.studyHoursPerDay,
        targetCompanies: result.roadmapSuggestion.targetCompanies,
        skillGaps: result.roadmapSuggestion.skillGaps,
      })
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="border-primary/30">
        <CardContent className="pt-8 pb-8 text-center">
          <p className="text-5xl font-bold gradient-text mb-1">{Math.round(readiness)}%</p>
          <p className="text-lg font-semibold">
            {result.placementReadiness != null ? "Placement Readiness Score" : "Test Score"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {result.correct}/{result.total} correct · {Math.round(result.score)}% on this paper
          </p>
          {result.aptitudeScore != null && (
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span>Aptitude: <strong>{result.aptitudeScore}%</strong></span>
              {result.codingScore != null && <span>Coding MCQ: <strong>{result.codingScore}%</strong></span>}
            </div>
          )}
        </CardContent>
      </Card>

      {result.categoryBreakdown && Object.keys(result.categoryBreakdown).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(result.categoryBreakdown).map(([cat, b]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cat.replace("_", " ")}</span>
                  <span>{b.correct}/{b.total} ({b.percent}%)</span>
                </div>
                <Progress value={b.percent} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {result.weakTopics && result.weakTopics.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Weak Topics</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {result.weakTopics.map((t) => (
              <Badge key={t} variant="warning">{t}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {result.recommendations && result.recommendations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {result.recommendations.map((r) => (
              <p key={r} className="text-sm text-muted-foreground">• {r}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {result.results && result.results.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Answer Review</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {result.results.map((r, i) => (
              <div key={r.questionId} className="rounded-lg border border-border/50 p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  {r.correct ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">Q{i + 1} · {r.subCategory}</span>
                </div>
                {!r.correct && (
                  <p className="text-muted-foreground">Correct: {r.correctAnswer}</p>
                )}
                {r.explanation && <p className="text-xs mt-1 text-muted-foreground">{r.explanation}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw className="h-4 w-4 mr-2" /> Retake
          </Button>
        )}
        {onNewMock && (
          <Button variant="outline" onClick={onNewMock}>
            <Shuffle className="h-4 w-4 mr-2" /> {newMockLabel}
          </Button>
        )}
        {showRoadmap && result.roadmapSuggestion && (
          <Link href="/dashboard/roadmap" onClick={saveRoadmapPrefill}>
            <Button variant="gradient">
              <Map className="h-4 w-4 mr-2" /> View AI Roadmap
            </Button>
          </Link>
        )}
        <Link href="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

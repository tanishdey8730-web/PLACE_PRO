"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { TestRunner, type GeneratedTest, type TestResult } from "@/components/assessment/test-runner";
import { TestResults } from "@/components/assessment/test-results";
import { Loader2 } from "lucide-react";

const categories = [
  { id: "QUANTITATIVE", title: "Quantitative Aptitude", topics: ["Percentage", "Profit & Loss", "Time & Work", "Probability", "P&C"] },
  { id: "LOGICAL", title: "Logical Reasoning", topics: ["Puzzles", "Blood Relations", "Seating Arrangement", "Coding-Decoding"] },
  { id: "VERBAL", title: "Verbal Ability", topics: ["Reading Comprehension", "Grammar", "Vocabulary"] },
] as const;

type View = "menu" | "test" | "result";

export default function AptitudePage() {
  const [view, setView] = useState<View>("menu");
  const [loading, setLoading] = useState<string | null>(null);
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);

  async function generateTest(type: "quiz" | "mock" | "full_mock", category?: string) {
    const key = category ?? type;
    setLoading(key);
    const res = await api<GeneratedTest>("/api/aptitude/generate", {
      method: "POST",
      body: JSON.stringify({
        type,
        category,
        questionCount: type === "quiz" ? 10 : undefined,
      }),
    });
    setLoading(null);
    if (res.success && res.data) {
      setTest(res.data);
      setView("test");
    }
  }

  function backToMenu() {
    setView("menu");
    setTest(null);
    setResult(null);
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-4xl mx-auto">
        {view === "menu" && (
          <>
            <h1 className="text-2xl font-bold">Aptitude Preparation</h1>
            <p className="text-muted-foreground mt-1 mb-6">
              Topic-wise quizzes, timed mocks & full placement-style papers with instant scoring
            </p>

            {lastScore !== null && (
              <Card className="mb-6 border-emerald-500/30">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold gradient-text">{Math.round(lastScore)}%</p>
                  <p className="text-sm text-muted-foreground">Last test score</p>
                </CardContent>
              </Card>
            )}

            <Card className="mb-8 border-primary/20">
              <CardHeader>
                <CardTitle>Full Placement Mock</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  25 questions · Quant + Logical + Verbal + Coding MCQ · 45 minutes
                </p>
                <Button
                  variant="gradient"
                  disabled={loading === "full_mock"}
                  onClick={() => generateTest("full_mock")}
                >
                  {loading === "full_mock" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Full Mock"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              {categories.map((cat) => (
                <Card key={cat.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{cat.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {cat.topics.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                    <Button
                      variant="gradient"
                      className="w-full"
                      disabled={loading === cat.id}
                      onClick={() => generateTest("quiz", cat.id)}
                    >
                      {loading === cat.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Start Timed Quiz (10 Q)"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={loading === `${cat.id}-mock`}
                      onClick={() => {
                        setLoading(`${cat.id}-mock`);
                        generateTest("mock", cat.id).finally(() => setLoading(null));
                      }}
                    >
                      Mock Exam (15 Q)
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {view === "test" && test && (
          <TestRunner
            test={test}
            submitPath="/api/aptitude/submit"
            onComplete={(r) => {
              setResult(r);
              setLastScore(r.score);
              setView("result");
            }}
            onCancel={backToMenu}
          />
        )}

        {view === "result" && result && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Test Results</h1>
            <TestResults result={result} onRetry={backToMenu} showRoadmap={false} />
          </>
        )}
      </main>
    </>
  );
}

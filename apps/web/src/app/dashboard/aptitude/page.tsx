"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TestRunner, type GeneratedTest, type TestResult } from "@/components/assessment/test-runner";
import { TestResults } from "@/components/assessment/test-results";
import {
  generateMock,
  generateTopicQuiz,
  generateCustomMock,
  regenerateTest,
  scoreTest,
  type CustomMockConfig,
} from "@/lib/aptitudeEngine";
import {
  APTITUDE_QUESTION_BANK,
  CATEGORY_LABELS,
  CATEGORY_TOPICS,
  countQuestions,
  type AptitudeCategory,
  type TestDifficulty,
} from "@/data/aptitudeQuestionBank";
import {
  MOCK_CATALOG,
  MOCK_GROUP_LABELS,
  mockQuestionCount,
  type MockDefinition,
  type MockGroup,
} from "@/data/mockCatalog";
import { cn } from "@/lib/utils";
import { Clock, ListChecks, Search, Sparkles, Timer } from "lucide-react";

type View = "menu" | "test" | "result";
type Tab = "library" | "topics" | "custom";

const GROUP_ORDER: MockGroup[] = ["COMPANY", "TOPIC", "DIFFICULTY", "SPRINT", "FULL"];

const CATEGORY_ORDER: AptitudeCategory[] = ["QUANTITATIVE", "LOGICAL", "VERBAL"];

const CATEGORY_ACCENT: Record<AptitudeCategory, string> = {
  QUANTITATIVE: "text-blue-400",
  LOGICAL: "text-purple-400",
  VERBAL: "text-emerald-400",
};

const LEVEL_VARIANT: Record<MockDefinition["level"], "success" | "warning" | "destructive"> = {
  Easy: "success",
  Moderate: "warning",
  Hard: "destructive",
};

const DEFAULT_CUSTOM: CustomMockConfig = {
  numerical: 8,
  logical: 6,
  verbal: 4,
  technical: 2,
};

export default function AptitudePage() {
  const [view, setView] = useState<View>("menu");
  const [tab, setTab] = useState<Tab>("library");
  const [group, setGroup] = useState<MockGroup | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState<CustomMockConfig>(DEFAULT_CUSTOM);

  const visibleMocks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_CATALOG.filter((mock) => {
      if (group !== "ALL" && mock.group !== group) return false;
      if (!q) return true;
      return (
        mock.title.toLowerCase().includes(q) ||
        mock.description.toLowerCase().includes(q) ||
        mock.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [group, query]);

  const customTotal = custom.numerical + custom.logical + custom.verbal + custom.technical;

  function launch(build: () => GeneratedTest) {
    setError(null);
    try {
      const generated = build();
      if (!generated.questions.length) {
        setError("No questions matched that selection. Try a different combination.");
        return;
      }
      setTest(generated);
      setRunKey((k) => k + 1);
      setResult(null);
      setView("test");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the test.");
    }
  }

  function retakeSamePaper() {
    if (!test) return;
    setResult(null);
    setRunKey((k) => k + 1);
    setView("test");
  }

  function tryNewMock() {
    if (!test) return;
    launch(() => regenerateTest(test.id) ?? test);
  }

  function backToMenu() {
    setView("menu");
    setTest(null);
    setResult(null);
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
        {view === "menu" && (
          <>
            <h1 className="text-2xl font-bold">Aptitude Preparation</h1>
            <p className="text-muted-foreground mt-1 mb-6">
              {MOCK_CATALOG.length} ready-made mocks and {APTITUDE_QUESTION_BANK.length} questions across
              numerical, logical, verbal and technical ability — every paper is generated fresh.
            </p>

            {error && (
              <Card className="mb-6 border-red-500/30">
                <CardContent className="pt-4 text-sm text-red-500">{error}</CardContent>
              </Card>
            )}

            {lastScore !== null && (
              <Card className="mb-6 border-emerald-500/30">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold gradient-text">{Math.round(lastScore)}%</p>
                  <p className="text-sm text-muted-foreground">Your last test score</p>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap gap-2 border-b border-border pb-2 mb-6">
              {(
                [
                  ["library", "Mock Library"],
                  ["topics", "Topic Practice"],
                  ["custom", "Build Your Own"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg transition-colors",
                    tab === id
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "library" && (
              <>
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search mocks by company, topic or tag…"
                      className="pl-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["ALL", ...GROUP_ORDER] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGroup(g)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs transition-colors",
                          group === g
                            ? "border-primary bg-primary/15 text-primary font-medium"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {g === "ALL" ? "All Mocks" : MOCK_GROUP_LABELS[g]}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Showing {visibleMocks.length} of {MOCK_CATALOG.length} mocks
                </p>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleMocks.map((mock) => (
                    <Card key={mock.id} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base leading-snug">{mock.title}</CardTitle>
                          <Badge variant={LEVEL_VARIANT[mock.level]}>{mock.level}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1 gap-3">
                        <p className="text-sm text-muted-foreground flex-1">{mock.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {mock.tags.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ListChecks className="h-3.5 w-3.5" />
                            {mockQuestionCount(mock)} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {mock.durationMinutes} min
                          </span>
                        </div>
                        <Button variant="gradient" className="w-full" onClick={() => launch(() => generateMock(mock))}>
                          Start Mock
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {visibleMocks.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No mocks match your search. Try a different keyword or filter.
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {tab === "topics" && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Pick any sub-topic to practise it in isolation, or take a full quiz for the whole section.
                </p>
                {CATEGORY_ORDER.map((category) => (
                  <Card key={category}>
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle className={cn("text-lg", CATEGORY_ACCENT[category])}>
                          {CATEGORY_LABELS[category]}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={() => launch(() => generateTopicQuiz(category, undefined, 10))}
                          >
                            Quick Quiz (10 Q)
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => launch(() => generateTopicQuiz(category, undefined, 20))}
                          >
                            Section Test (20 Q)
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {CATEGORY_TOPICS[category].map((topic) => {
                          const available = countQuestions({
                            category,
                            subCategory: topic,
                            section: category === "QUANTITATIVE" ? null : undefined,
                          });
                          return (
                            <button
                              key={topic}
                              type="button"
                              onClick={() => launch(() => generateTopicQuiz(category, topic, Math.max(5, available)))}
                              className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
                            >
                              <span>{topic}</span>
                              <span className="text-xs text-muted-foreground shrink-0">{available} Q</span>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {tab === "custom" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Build Your Own Mock
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Choose how many questions you want from each section and we will assemble a fresh
                    paper every time you generate.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {(
                      [
                        ["numerical", "Numerical Ability"],
                        ["logical", "Logical Ability"],
                        ["verbal", "Verbal Ability"],
                        ["technical", "Technical MCQ"],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key}>
                        <label className="text-sm text-muted-foreground">{label}</label>
                        <Input
                          type="number"
                          min={0}
                          max={30}
                          value={custom[key]}
                          onChange={(e) =>
                            setCustom((c) => ({
                              ...c,
                              [key]: Math.max(0, Math.min(30, Number(e.target.value) || 0)),
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm text-muted-foreground">Difficulty</label>
                      <select
                        value={custom.difficulty ?? "MIXED"}
                        onChange={(e) =>
                          setCustom((c) => ({
                            ...c,
                            difficulty:
                              e.target.value === "MIXED" ? undefined : (e.target.value as TestDifficulty),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="MIXED">Mixed</option>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Duration (minutes)</label>
                      <Input
                        type="number"
                        min={1}
                        max={180}
                        value={custom.durationMinutes ?? Math.max(5, Math.ceil(customTotal * 1.5))}
                        onChange={(e) =>
                          setCustom((c) => ({
                            ...c,
                            durationMinutes: Math.max(1, Math.min(180, Number(e.target.value) || 1)),
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
                    <span className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-primary" />
                      {customTotal} questions selected
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setCustom(DEFAULT_CUSTOM)}>
                        Reset
                      </Button>
                      <Button
                        variant="gradient"
                        disabled={customTotal === 0}
                        onClick={() => launch(() => generateCustomMock(custom))}
                      >
                        Generate Mock
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {view === "test" && test && (
          <TestRunner
            key={`${test.id}-${runKey}`}
            test={test}
            onSubmitLocal={(answers, timeTaken) => scoreTest(test.id, answers, timeTaken)}
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
            <h1 className="text-2xl font-bold mb-2 text-center">Test Results</h1>
            {test && (
              <p className="text-center text-sm text-muted-foreground mb-6">{test.title}</p>
            )}
            <TestResults
              result={result}
              onRetry={retakeSamePaper}
              onNewMock={tryNewMock}
              showRoadmap={false}
            />
            <div className="flex justify-center mt-4">
              <Button variant="ghost" onClick={backToMenu}>
                Back to Mock Library
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
}

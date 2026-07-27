"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { api } from "@/lib/api";

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  category?: string;
  subCategory?: string;
  difficulty?: string;
}

export interface GeneratedTest {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  questionCount: number;
  questions: TestQuestion[];
}

export interface TestResult {
  testId: string;
  score: number;
  correct: number;
  total: number;
  placementReadiness?: number;
  aptitudeScore?: number;
  codingScore?: number;
  weakTopics?: string[];
  categoryBreakdown?: Record<string, { correct: number; total: number; percent: number }>;
  recommendations?: string[];
  roadmapSuggestion?: {
    branch: string;
    skillLevel: string;
    studyHoursPerDay: number;
    targetCompanies: string[];
    skillGaps: string[];
    focusAreas: string[];
  };
  results?: {
    questionId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    subCategory: string;
  }[];
}

interface TestRunnerProps {
  test: GeneratedTest;
  submitPath?: string;
  onComplete: (result: TestResult) => void;
  onCancel?: () => void;
}

export function TestRunner({ test, submitPath = "/api/assessment/submit", onComplete, onCancel }: TestRunnerProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(test.durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(Date.now());

  const submit = useCallback(async () => {
    setSubmitting(true);
    const timeTakenSeconds = Math.round((Date.now() - startedAt) / 1000);
    const res = await api<TestResult>(submitPath, {
      method: "POST",
      body: JSON.stringify({ testId: test.id, answers, timeTakenSeconds }),
    });
    setSubmitting(false);
    if (res.success && res.data) {
      onComplete(res.data);
    } else {
      onComplete({
        testId: test.id,
        score: 0,
        correct: 0,
        total: test.questions.length,
        recommendations: ["Could not reach server. Retry when API is running."],
      });
    }
  }, [answers, onComplete, startedAt, submitPath, test.id, test.questions.length]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, submit]);

  const q = test.questions[current];
  const answered = Object.keys(answers).length;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{test.title}</h2>
          <p className="text-sm text-muted-foreground">
            Question {current + 1} of {test.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={secondsLeft < 60 ? "destructive" : "secondary"} className="gap-1 text-sm px-3 py-1">
            <Clock className="h-4 w-4" />
            {mins}:{secs.toString().padStart(2, "0")}
          </Badge>
          <Badge variant="default">{answered}/{test.questions.length} answered</Badge>
        </div>
      </div>

      <Progress value={((current + 1) / test.questions.length) * 100} />

      <Card>
        <CardHeader>
          <div className="flex gap-2 flex-wrap">
            {q.category && <Badge variant="secondary">{q.category}</Badge>}
            {q.subCategory && <Badge variant="secondary">{q.subCategory}</Badge>}
            {q.difficulty && <Badge>{q.difficulty}</Badge>}
          </div>
          <CardTitle className="text-base font-medium leading-relaxed pt-2">{q.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {q.options.map((opt) => (
            <Button
              key={opt}
              variant={answers[q.id] === opt ? "gradient" : "outline"}
              className="w-full justify-start text-left h-auto py-3 whitespace-normal"
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
            >
              {opt}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <div className="flex gap-2">
          {onCancel && <Button variant="ghost" onClick={onCancel}>Exit</Button>}
          {current < test.questions.length - 1 ? (
            <Button variant="gradient" onClick={() => setCurrent((c) => c + 1)} disabled={!answers[q.id]}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button variant="gradient" onClick={submit} disabled={submitting || answered < test.questions.length}>
              <Send className="h-4 w-4 mr-1" />
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {test.questions.map((tq, i) => (
          <button
            key={tq.id}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-8 w-8 rounded-md text-xs font-medium border transition-colors ${
              i === current
                ? "bg-primary text-primary-foreground border-primary"
                : answers[tq.id]
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600"
                  : "border-border hover:bg-muted"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

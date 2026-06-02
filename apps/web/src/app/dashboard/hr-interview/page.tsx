"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  ChevronRight,
  ChevronLeft,
  FileText,
  MessageCircle,
  Award,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import type { HrInterviewQuestion, HrInterviewReport } from "@placepro/shared";

type Phase = "setup" | "interview" | "report";

const SCORE_LABELS = [
  { key: "communication" as const, label: "Communication" },
  { key: "confidence" as const, label: "Confidence" },
  { key: "clarity" as const, label: "Clarity" },
  { key: "professionalism" as const, label: "Professionalism" },
];

export default function HrInterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [companyName, setCompanyName] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<HrInterviewQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<HrInterviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const startSession = useCallback(async () => {
    setLoading(true);
    const res = await api<{
      sessionId: string;
      questions: HrInterviewQuestion[];
    }>("/api/hr-interview", {
      method: "POST",
      body: JSON.stringify({
        action: "start",
        targetRole,
        companyName: companyName || undefined,
      }),
    });
    setLoading(false);
    if (res.success && res.data) {
      setSessionId(res.data.sessionId);
      setQuestions(res.data.questions);
      setStep(0);
      setAnswers({});
      setStartedAt(Date.now());
      setPhase("interview");
    } else {
      setQuestions([
        { id: "about", question: "Tell me about yourself" },
        { id: "strengths", question: "What are your strengths?" },
        { id: "weaknesses", question: "What are your weaknesses?" },
        { id: "career_goals", question: "What are your career goals?" },
        { id: "why_hire", question: "Why should we hire you?" },
      ]);
      setSessionId("local");
      setStartedAt(Date.now());
      setPhase("interview");
    }
  }, [targetRole, companyName]);

  useEffect(() => {
    if (phase === "setup" && questions.length === 0) {
      api<HrInterviewQuestion[]>("/api/hr-interview/questions").then((res) => {
        if (res.success && res.data) setQuestions(res.data);
      });
    }
  }, [phase, questions.length]);

  const currentQ = questions[step];

  async function submitInterview() {
    const payload = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id]?.trim() || "",
    }));

    if (payload.some((a) => a.answer.length < 10)) {
      alert("Please provide at least a few sentences for each answer.");
      return;
    }

    setLoading(true);
    const duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : undefined;

    const res = await api<HrInterviewReport>("/api/hr-interview", {
      method: "POST",
      body: JSON.stringify({
        action: "complete",
        sessionId: sessionId ?? undefined,
        targetRole,
        companyName: companyName || undefined,
        answers: payload,
        duration,
      }),
    });
    setLoading(false);

    if (res.success && res.data) {
      setReport(res.data);
      setPhase("report");
    }
  }

  if (phase === "report" && report) {
    return (
      <>
        <DashboardHeader />
        <main className="p-4 lg:p-8 max-w-3xl mx-auto pb-24">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <FileText className="h-7 w-7 text-primary" />
            HR Interview Report
          </h1>
          <p className="text-muted-foreground mb-8">
            {report.targetRole}
            {report.companyName ? ` · ${report.companyName}` : ""}
          </p>

          <Card className="mb-6">
            <CardContent className="pt-8 text-center">
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="text-5xl font-bold gradient-text mt-2">{report.scores.overall}%</p>
              <Progress value={report.scores.overall} className="mt-4 max-w-xs mx-auto" />
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {SCORE_LABELS.map(({ key, label }) => (
              <Card key={key}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{label}</span>
                    <span className="font-bold">{report.scores[key]}%</span>
                  </div>
                  <Progress value={report.scores[key]} />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{report.summary}</CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Per-Question Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.questionFeedback.map((qf) => {
                const q = report.questions.find((x) => x.id === qf.questionId);
                return (
                  <div key={qf.questionId} className="rounded-lg border border-border/50 p-3 text-sm">
                    <div className="flex justify-between gap-2 mb-1">
                      <span className="font-medium">{q?.question}</span>
                      <span className="text-primary font-bold shrink-0">{qf.score}%</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{qf.feedback}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-green-500">
                  <Award className="h-4 w-4" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1 text-muted-foreground">
                {report.strengths.map((s) => (
                  <p key={s}>+ {s}</p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1 text-muted-foreground">
                {report.recommendations.map((r) => (
                  <p key={r}>• {r}</p>
                ))}
              </CardContent>
            </Card>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setPhase("setup");
              setReport(null);
              setStep(0);
            }}
          >
            Practice Again
          </Button>
        </main>
      </>
    );
  }

  if (phase === "interview" && currentQ) {
    return (
      <>
        <DashboardHeader />
        <main className="p-4 lg:p-8 max-w-2xl mx-auto pb-24">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Mock HR Interview
            </h1>
            <span className="text-sm text-muted-foreground">
              Question {step + 1} of {questions.length}
            </span>
          </div>

          <Progress value={((step + 1) / questions.length) * 100} className="mb-6" />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                {currentQ.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={answers[currentQ.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                }
                rows={8}
                placeholder="Type your answer as you would speak in the interview..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Aim for 45–90 seconds. Use STAR for behavioral points.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6 gap-2">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {step < questions.length - 1 ? (
              <Button
                variant="gradient"
                disabled={!(answers[currentQ.id]?.trim().length >= 10)}
                onClick={() => setStep((s) => s + 1)}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button variant="gradient" onClick={submitInterview} disabled={loading}>
                {loading ? "Generating report..." : "Submit & Get Report"}
              </Button>
            )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-lg mx-auto pb-24">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mic className="h-7 w-7 text-primary" />
          AI Mock HR Interview
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Practice the 5 essential HR questions and receive a detailed evaluation report
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Session setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Target Role</label>
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Company (optional)</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Amazon"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Questions covered</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              {(questions.length ? questions : [
                { id: "1", question: "Tell me about yourself" },
                { id: "2", question: "Strengths" },
                { id: "3", question: "Weaknesses" },
                { id: "4", question: "Career goals" },
                { id: "5", question: "Why should we hire you?" },
              ]).map((q, i) => (
                <li key={q.id} className="flex gap-2">
                  <span className="text-primary font-mono text-xs">{i + 1}.</span>
                  {q.question}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mb-4 text-center">
          Evaluated on: Communication · Confidence · Clarity · Professionalism
        </p>

        <Button variant="gradient" className="w-full" onClick={startSession} disabled={loading}>
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? "Starting..." : "Start HR Interview"}
        </Button>
      </main>
    </>
  );
}

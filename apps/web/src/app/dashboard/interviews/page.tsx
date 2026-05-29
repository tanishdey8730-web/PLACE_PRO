"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Video, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

const types = [
  { id: "TECHNICAL", title: "Technical Interview", desc: "DSA, system design & coding questions" },
  { id: "HR", title: "HR Interview", desc: "Culture fit, salary & career goals" },
  { id: "BEHAVIORAL", title: "Behavioral Interview", desc: "STAR method & situational questions" },
];

export default function InterviewsPage() {
  const [active, setActive] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);

  async function startInterview(type: string) {
    const res = await api<{ questions: string[] }>("/api/interviews/start", {
      method: "POST",
      body: JSON.stringify({ type, role: "Software Engineer" }),
    });
    setActive(type);
    if (res.success && res.data) setQuestions((res.data as { questions: string[] }).questions);
    else setQuestions(["Tell me about yourself.", "Explain a challenging project.", "Why this company?"]);
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold">AI Mock Interviews</h1>
        <p className="text-muted-foreground mt-1 mb-8">Voice interaction, webcam support & detailed feedback</p>

        {!active ? (
          <div className="grid gap-6 md:grid-cols-3">
            {types.map((t) => (
              <Card key={t.id} className="hover:border-primary/30 transition-colors">
                <CardHeader>
                  <Mic className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{t.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{t.desc}</p>
                  <Button variant="gradient" className="w-full" onClick={() => startInterview(t.id)}>
                    <Video className="h-4 w-4 mr-2" /> Start Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                Live Interview — {active}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="flex gap-3 rounded-lg bg-muted/50 p-4">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm">{q}</p>
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <Button variant="gradient">Complete & Get Feedback</Button>
                <Button variant="outline" onClick={() => setActive(null)}>End Session</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

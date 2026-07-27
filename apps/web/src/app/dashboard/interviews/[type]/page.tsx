"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Video } from "lucide-react";
import { api } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  technical: "Technical Interview",
  behavioral: "Behavioral Interview",
};

const TYPE_API: Record<string, string> = {
  technical: "TECHNICAL",
  behavioral: "BEHAVIORAL",
};

export default function MockInterviewSessionPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: typeParam } = use(params);
  const type = typeParam.toLowerCase();
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiType = TYPE_API[type] ?? "TECHNICAL";
    setLoading(true);
    api<{ questions: string[] }>("/api/interviews/start", {
      method: "POST",
      body: JSON.stringify({ type: apiType, role: "Software Engineer" }),
    }).then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setQuestions((res.data as { questions: string[] }).questions);
      } else {
        setQuestions([
          "Tell me about yourself.",
          "Explain a challenging project you worked on.",
          "Why do you want to join this company?",
        ]);
      }
    });
  }, [type]);

  const title = TYPE_LABELS[type] ?? "Mock Interview";

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-3xl mx-auto pb-24 lg:pb-8">
        <Link
          href="/dashboard/interviews"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Mock Interviews
        </Link>

        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="h-7 w-7 text-primary" />
          {title}
        </h1>
        <p className="text-muted-foreground mt-1 mb-6">Dedicated session page — practice & get feedback</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              Live session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading questions…</p>
            ) : (
              questions.map((q, i) => (
                <div key={i} className="flex gap-3 rounded-lg bg-muted/50 p-4">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm">{q}</p>
                </div>
              ))
            )}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button variant="gradient">Complete & Get Feedback</Button>
              <Link href="/dashboard/interviews">
                <Button variant="outline">End Session</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

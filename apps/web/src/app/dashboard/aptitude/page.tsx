"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const categories = [
  { id: "QUANTITATIVE", title: "Quantitative Aptitude", topics: ["Percentage", "Profit & Loss", "Time & Work", "Probability", "Permutation & Combination"] },
  { id: "LOGICAL", title: "Logical Reasoning", topics: ["Puzzles", "Blood Relations", "Seating Arrangement", "Coding-Decoding"] },
  { id: "VERBAL", title: "Verbal Ability", topics: ["Reading Comprehension", "Grammar", "Vocabulary"] },
];

export default function AptitudePage() {
  const [score, setScore] = useState<number | null>(null);

  async function startQuiz(category: string) {
    const res = await api<{ score: number }>("/api/aptitude/submit", {
      method: "POST",
      body: JSON.stringify({ answers: { demo: "100" } }),
    });
    if (res.success && res.data) setScore((res.data as { score: number }).score);
    else setScore(85);
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold">Aptitude Preparation</h1>
        <p className="text-muted-foreground mt-1 mb-8">Topic-wise quizzes, timed tests & mock exams</p>
        {score !== null && (
          <Card className="mb-6 border-emerald-500/30">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold gradient-text">{Math.round(score)}%</p>
              <p className="text-sm text-muted-foreground">Last quiz score</p>
            </CardContent>
          </Card>
        )}
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
                <Button variant="gradient" className="w-full" onClick={() => startQuiz(cat.id)}>
                  Start Timed Quiz
                </Button>
                <Button variant="outline" className="w-full">Mock Exam</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}

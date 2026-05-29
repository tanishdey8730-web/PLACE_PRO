"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const questions = [
  { q: "What is your target role?", options: ["Software Engineer", "Data Scientist", "Other"] },
  { q: "How would you rate your coding skills?", options: ["Beginner", "Intermediate", "Advanced"] },
  { q: "Months until placement?", options: ["< 3", "3-6", "6-12", "12+"] },
];

export default function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <>
        <DashboardHeader />
        <main className="p-4 lg:p-8 max-w-lg mx-auto text-center">
          <Card>
            <CardContent className="pt-8 pb-8">
              <p className="text-5xl font-bold gradient-text mb-2">68%</p>
              <p className="text-lg font-semibold">Placement Readiness Score</p>
              <p className="text-sm text-muted-foreground mt-2">We&apos;ve created a personalized roadmap for you.</p>
              <Button variant="gradient" className="mt-6" asChild>
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const q = questions[step];
  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2">Free Placement Assessment</h1>
        <Progress value={((step + 1) / questions.length) * 100} className="mb-8" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="font-medium">{q.q}</p>
            {q.options.map((o) => (
              <Button
                key={o}
                variant="outline"
                className="w-full justify-start"
                onClick={() => (step < questions.length - 1 ? setStep(step + 1) : setDone(true))}
              >
                {o}
              </Button>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

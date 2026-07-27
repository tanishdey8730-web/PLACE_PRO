"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TestRunner, type GeneratedTest, type TestResult } from "@/components/assessment/test-runner";
import { TestResults } from "@/components/assessment/test-results";
import { generatePlacementTest, scoreTest } from "@/lib/aptitudeEngine";
import { ClipboardList, Loader2 } from "lucide-react";

type Phase = "profile" | "test" | "result";

const profileSteps = [
  {
    key: "targetRole",
    q: "What is your target role?",
    options: ["Software Engineer", "Data Scientist", "Cloud Engineer", "Other"],
  },
  {
    key: "codingLevel",
    q: "How would you rate your coding skills?",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    key: "monthsToPlacement",
    q: "Months until placement?",
    options: ["< 3", "3-6", "6-12", "12+"],
  },
] as const;

export default function AssessmentPage() {
  const [phase, setPhase] = useState<Phase>("profile");
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  function startTest(finalProfile: Record<string, string>) {
    setLoading(true);
    const generated = generatePlacementTest({
      targetRole: finalProfile.targetRole ?? "Software Engineer",
      codingLevel: finalProfile.codingLevel ?? "Beginner",
      monthsToPlacement: finalProfile.monthsToPlacement ?? "6-12",
      branch: "Computer Science",
    });
    setTest(generated);
    setPhase("test");
    setLoading(false);
  }

  function handleProfileAnswer(option: string) {
    const key = profileSteps[step].key;
    const next = { ...profile, [key]: option };
    setProfile(next);
    if (step < profileSteps.length - 1) {
      setStep(step + 1);
    } else {
      startTest(next);
    }
  }

  function reset() {
    setPhase("profile");
    setStep(0);
    setProfile({});
    setTest(null);
    setResult(null);
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-3xl mx-auto">
        {phase === "profile" && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">Free Placement Assessment</h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Answer 3 quick questions, then take a 15-question mock test. Get your readiness score and AI roadmap.
            </p>
            <Progress value={((step + 1) / (profileSteps.length + 1)) * 100} className="mb-8" />
            {loading ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">Generating your personalized test paper...</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <p className="font-medium">{profileSteps[step].q}</p>
                  {profileSteps[step].options.map((o) => (
                    <Button
                      key={o}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleProfileAnswer(o)}
                    >
                      {o}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {phase === "test" && test && (
          <TestRunner
            test={test}
            onSubmitLocal={(answers, timeTaken) => scoreTest(test.id, answers, timeTaken)}
            onComplete={(r) => {
              setResult(r);
              setPhase("result");
            }}
            onCancel={reset}
          />
        )}

        {phase === "result" && result && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Assessment Complete</h1>
            <TestResults result={result} onRetry={reset} />
          </>
        )}
      </main>
    </>
  );
}

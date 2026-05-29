"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Play, Send } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = ["PYTHON", "JAVASCRIPT", "JAVA", "CPP", "C"] as const;

export default function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [problem, setProblem] = useState<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    starterCode: Record<string, string>;
    editorial?: string;
  } | null>(null);
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("PYTHON");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api(`/api/coding/problems/${slug}`).then((res) => {
      if (res.success && res.data) {
        const p = res.data as typeof problem & { starterCode: Record<string, string> };
        setProblem(p);
        setCode(p.starterCode?.PYTHON || "");
      } else {
        setProblem({
          id: "1",
          title: "Two Sum",
          description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
          difficulty: "EASY",
          starterCode: { PYTHON: "def two_sum(nums, target):\n    pass\n" },
        });
        setCode("def two_sum(nums, target):\n    pass\n");
      }
    });
  }, [slug]);

  useEffect(() => {
    if (problem?.starterCode?.[language]) setCode(problem.starterCode[language]);
  }, [language, problem]);

  async function runCode() {
    setLoading(true);
    const res = await api<{ stdout?: string; stderr?: string; status: string }>("/api/coding/run", {
      method: "POST",
      body: JSON.stringify({ code, language }),
    });
    setLoading(false);
    if (res.success && res.data) {
      const d = res.data;
      setOutput(d.stdout || d.stderr || d.status);
    } else setOutput("Run failed — ensure API is running");
  }

  async function submitCode() {
    if (!problem) return;
    setLoading(true);
    const res = await api("/api/coding/submit", {
      method: "POST",
      body: JSON.stringify({ problemId: problem.id, code, language }),
    });
    setLoading(false);
    if (res.success && res.data) {
      const d = res.data as { status: string; passedTests: number; totalTests: number };
      setOutput(`${d.status} — ${d.passedTests}/${d.totalTests} tests passed`);
    }
  }

  if (!problem) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        <div className="w-full lg:w-2/5 overflow-y-auto p-4 lg:p-6 border-r border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold">{problem.title}</h1>
            <Badge variant={problem.difficulty === "EASY" ? "success" : "warning"}>{problem.difficulty}</Badge>
          </div>
          <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap text-sm">{problem.description}</div>
          {problem.editorial && (
            <Card className="mt-6">
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2">Editorial</h3>
                <p className="text-sm text-muted-foreground">{problem.editorial}</p>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="flex-1 flex flex-col min-h-[400px]">
          <div className="flex items-center gap-2 p-2 border-b border-border/50 bg-card/30">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as (typeof LANGUAGES)[number])}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={runCode} disabled={loading}>
              <Play className="h-4 w-4 mr-1" /> Run
            </Button>
            <Button variant="gradient" size="sm" onClick={submitCode} disabled={loading}>
              <Send className="h-4 w-4 mr-1" /> Submit
            </Button>
          </div>
          <div className="flex-1 min-h-[200px]">
            <MonacoEditor
              height="100%"
              language={language === "PYTHON" ? "python" : language === "JAVASCRIPT" ? "javascript" : "java"}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
            />
          </div>
          {output && (
            <div className="h-32 overflow-auto border-t border-border/50 bg-black/40 p-4 font-mono text-sm text-emerald-400">
              {output}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

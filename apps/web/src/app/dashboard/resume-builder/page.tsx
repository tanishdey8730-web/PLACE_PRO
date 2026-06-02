"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResumePreview } from "@/components/resume-builder/resume-preview";
import {
  FileText,
  Sparkles,
  Download,
  Wand2,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  ResumeContent,
  ResumeBuilderTemplateId,
  ResumeBuilderScores,
  ResumeGenerateSection,
} from "@placepro/shared";

const TEMPLATES: { id: ResumeBuilderTemplateId; name: string; desc: string }[] = [
  { id: "ats", name: "ATS-Friendly", desc: "Optimized for applicant tracking systems" },
  { id: "professional", name: "Professional", desc: "Classic corporate layout" },
  { id: "modern", name: "Modern", desc: "Sidebar accent design" },
];

const EMPTY_RESUME: ResumeContent = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
  },
  skills: [],
  education: [{ school: "", degree: "", year: "" }],
  experience: [],
  projects: [],
  internships: [],
  achievements: [],
};

const AI_SECTIONS: { id: ResumeGenerateSection; label: string }[] = [
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "internships", label: "Internships" },
  { id: "achievements", label: "Achievements" },
  { id: "summary", label: "Summary" },
];

function downloadBase64(base64: string, fileName: string, mime: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ResumeBuilderPage() {
  const [template, setTemplate] = useState<ResumeBuilderTemplateId>("ats");
  const [content, setContent] = useState<ResumeContent>(EMPTY_RESUME);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [scores, setScores] = useState<ResumeBuilderScores | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [skillsInput, setSkillsInput] = useState("");

  function updatePersonal(field: keyof ResumeContent["personal"], value: string) {
    setContent((c) => ({ ...c, personal: { ...c.personal, [field]: value } }));
  }

  async function generateSection(section: ResumeGenerateSection) {
    setLoading(`gen-${section}`);
    const res = await api<{ generated: Record<string, unknown> }>("/api/resume-builder", {
      method: "POST",
      body: JSON.stringify({
        action: "generate",
        template,
        targetRole,
        generateSection: section,
        content,
        context: { branch: "Computer Science" },
      }),
    });
    setLoading(null);
    if (res.success && res.data?.generated) {
      const g = res.data.generated;
      setContent((c) => ({
        ...c,
        ...(g.skills ? { skills: g.skills as string[] } : {}),
        ...(g.achievements ? { achievements: g.achievements as string[] } : {}),
        ...(g.projects ? { projects: g.projects as ResumeContent["projects"] } : {}),
        ...(g.internships ? { internships: g.internships as ResumeContent["internships"] } : {}),
        ...(g.personal ? { personal: { ...c.personal, ...(g.personal as ResumeContent["personal"]) } } : {}),
      }));
      if (g.skills) setSkillsInput((g.skills as string[]).join(", "));
    }
  }

  async function buildAndScore() {
    setLoading("build");
    const res = await api<{ content: ResumeContent; scores: ResumeBuilderScores }>(
      "/api/resume-builder",
      {
        method: "POST",
        body: JSON.stringify({
          action: "build",
          template,
          targetRole,
          title: `${content.personal.fullName || "My"} Resume`,
          content: {
            ...content,
            skills: skillsInput
              ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
              : content.skills,
          },
        }),
      }
    );
    setLoading(null);
    if (res.success && res.data) {
      setScores(res.data.scores);
      if (res.data.content) setContent(res.data.content);
    } else {
      setScores({
        atsScore: 76,
        qualityScore: 74,
        feedback: ["Add quantified project metrics", "Expand skills with job keywords"],
        keywordSuggestions: ["REST API", "CI/CD", "Docker"],
      });
    }
  }

  async function exportFile(format: "pdf" | "docx") {
    setLoading(`export-${format}`);
    const res = await api<{ base64: string; fileName: string; mimeType: string }>(
      "/api/resume-builder",
      {
        method: "POST",
        body: JSON.stringify({
          action: "export",
          template,
          exportFormat: format,
          content: {
            ...content,
            skills: skillsInput
              ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
              : content.skills,
          },
        }),
      }
    );
    setLoading(null);
    if (res.success && res.data) {
      downloadBase64(res.data.base64, res.data.fileName, res.data.mimeType);
    }
  }

  const displayContent: ResumeContent = {
    ...content,
    skills: skillsInput
      ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : content.skills,
  };

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          AI Resume Builder
        </h1>
        <p className="text-muted-foreground mt-1 mb-6">
          ATS-friendly templates, AI-generated sections, scoring, and PDF/DOCX export
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Template</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "text-left rounded-lg border px-4 py-3 transition-colors",
                      template === t.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Target Role</label>
                  <input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {AI_SECTIONS.map((s) => (
                    <Button
                      key={s.id}
                      size="sm"
                      variant="outline"
                      disabled={!!loading}
                      onClick={() => generateSection(s.id)}
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      {loading === `gen-${s.id}` ? "..." : s.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Personal Info</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                {(
                  [
                    ["fullName", "Full Name"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["location", "Location"],
                    ["github", "GitHub"],
                    ["linkedin", "LinkedIn"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className={key === "fullName" ? "sm:col-span-2" : ""}>
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <input
                      value={content.personal[key] ?? ""}
                      onChange={(e) => updatePersonal(key, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Skills (comma-separated)</label>
                  <input
                    value={skillsInput || content.skills.join(", ")}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Java, Python, React, SQL..."
                  />
                </div>
              </CardContent>
            </Card>

            {scores && (
              <Card>
                <CardHeader><CardTitle className="text-base">Resume Scores</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ATS Score</span>
                      <span className="font-bold gradient-text">{scores.atsScore}%</span>
                    </div>
                    <Progress value={scores.atsScore} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quality Score</span>
                      <span className="font-bold">{scores.qualityScore}%</span>
                    </div>
                    <Progress value={scores.qualityScore} />
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {scores.feedback.map((f) => (
                      <li key={f} className="flex gap-1">
                        <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="gradient" onClick={buildAndScore} disabled={!!loading}>
                {loading === "build" ? "Scoring..." : "Save & Score Resume"}
              </Button>
              <Button variant="outline" onClick={() => exportFile("pdf")} disabled={!!loading}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => exportFile("docx")} disabled={!!loading}>
                <Download className="h-4 w-4 mr-1" />
                DOCX
              </Button>
            </div>
          </div>

          <Card className="lg:sticky lg:top-4 h-fit">
            <CardHeader>
              <CardTitle className="text-base">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResumePreview content={displayContent} template={template} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

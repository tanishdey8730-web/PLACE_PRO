"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Download, Wand2, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  CoverLetterGenerateResult,
  CoverLetterTemplateId,
  CoverLetterContent,
  CoverLetterDocumentType,
} from "@placepro/shared";

const TEMPLATES: { id: CoverLetterTemplateId; name: string; desc: string }[] = [
  { id: "professional", name: "Professional", desc: "Balanced business tone" },
  { id: "modern", name: "Modern", desc: "Confident, approachable hook" },
  { id: "formal", name: "Formal", desc: "Traditional corporate style" },
  { id: "concise", name: "Concise", desc: "Short, recruiter-friendly" },
];

const DOC_TABS: { id: keyof CoverLetterGenerateResult["documents"]; label: string; exportKey: CoverLetterDocumentType }[] = [
  { id: "coverLetter", label: "Cover Letter", exportKey: "cover_letter" },
  { id: "internshipApplication", label: "Internship Application", exportKey: "internship_application" },
  { id: "referralRequest", label: "Referral Request", exportKey: "referral_request" },
  { id: "hrFollowUp", label: "HR Follow-up", exportKey: "hr_follow_up" },
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

function LetterPreview({ doc }: { doc: CoverLetterContent }) {
  return (
    <div className="rounded-lg border border-border/50 bg-white text-gray-900 p-6 text-sm space-y-4 min-h-[320px]">
      <p className="text-xs text-gray-500">{new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</p>
      <p className="font-semibold text-gray-800">Subject: {doc.subject}</p>
      <p>{doc.salutation}</p>
      {doc.body.split(/\n\n+/).map((p) => (
        <p key={p.slice(0, 40)} className="leading-relaxed">
          {p}
        </p>
      ))}
      <p>
        {doc.closing}
        <br />
        {doc.signature}
      </p>
    </div>
  );
}

export default function CoverLetterPage() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [resume, setResume] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [template, setTemplate] = useState<CoverLetterTemplateId>("professional");
  const [result, setResult] = useState<CoverLetterGenerateResult | null>(null);
  const [activeDoc, setActiveDoc] = useState<keyof CoverLetterGenerateResult["documents"]>("coverLetter");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await api<CoverLetterGenerateResult>("/api/cover-letter", {
      method: "POST",
      body: JSON.stringify({
        action: "generate",
        companyName,
        jobTitle,
        resume,
        skills,
        template,
        applicantName: applicantName || "Applicant",
        documentType: "all",
      }),
    });
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
    }
  }

  async function exportDoc(format: "pdf" | "docx") {
    if (!result) return;
    const tab = DOC_TABS.find((t) => t.id === activeDoc)!;
    setLoading(true);
    const res = await api<{ base64: string; fileName: string; mimeType: string }>("/api/cover-letter", {
      method: "POST",
      body: JSON.stringify({
        action: "export",
        companyName: result.companyName,
        jobTitle: result.jobTitle,
        resume,
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        exportFormat: format,
        exportDocument: tab.exportKey,
        content: result.documents[activeDoc],
      }),
    });
    setLoading(false);
    if (res.success && res.data) {
      downloadBase64(res.data.base64, res.data.fileName, res.data.mimeType);
    }
  }

  function copyText() {
    if (!result) return;
    const doc = result.documents[activeDoc];
    const text = `${doc.salutation}\n\n${doc.body}\n\n${doc.closing}\n${doc.signature}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const currentDoc = result?.documents[activeDoc];

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="h-7 w-7 text-primary" />
          AI Cover Letter Generator
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Cover letters, internship applications, referral emails, and HR follow-ups — with PDF/DOCX export
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Company Name</label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Google"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Job Title</label>
                  <input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Software Engineer"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Your Name</label>
                  <input
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Skills (comma-separated)</label>
                  <input
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="Java, Python, React, SQL"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Resume (paste summary or full text)</label>
                  <textarea
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    rows={6}
                    placeholder="Paste resume content, experience bullets, and education..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Custom Template</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "text-left rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      template === t.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Button
              variant="gradient"
              className="w-full"
              disabled={loading || !companyName || !jobTitle || resume.length < 10}
              onClick={generate}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Generate All Documents"}
            </Button>
          </div>

          <div className="space-y-4">
            {result ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {DOC_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveDoc(tab.id)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full border transition-colors",
                        activeDoc === tab.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {currentDoc && <LetterPreview doc={currentDoc} />}

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={copyText}>
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" disabled={loading} onClick={() => exportDoc("pdf")}>
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" disabled={loading} onClick={() => exportDoc("docx")}>
                    <Download className="h-4 w-4 mr-1" /> DOCX
                  </Button>
                </div>
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p>Fill in job details and resume, then generate tailored documents.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

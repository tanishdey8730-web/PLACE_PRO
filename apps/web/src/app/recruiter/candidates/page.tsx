"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { RecruiterCandidateDetail, RecruiterCandidateSummary } from "@placepro/shared";
import { Search, FileText, ExternalLink } from "lucide-react";

export default function RecruiterCandidatesPage() {
  const [q, setQ] = useState("");
  const [college, setCollege] = useState("");
  const [skill, setSkill] = useState("");
  const [minCoding, setMinCoding] = useState("");
  const [appliedOnly, setAppliedOnly] = useState(false);
  const [list, setList] = useState<RecruiterCandidateSummary[]>([]);
  const [selected, setSelected] = useState<RecruiterCandidateDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (college) params.set("college", college);
    if (skill) params.set("skill", skill);
    if (minCoding) params.set("minCoding", minCoding);
    if (appliedOnly) params.set("appliedOnly", "true");

    const res = await api<RecruiterCandidateSummary[]>(
      `/api/recruiter/candidates?${params.toString()}`
    );
    setLoading(false);
    if (res.success && res.data) {
      setList(res.data);
      if (res.data[0]) loadDetail(res.data[0].id);
    }
  }, [q, college, skill, minCoding, appliedOnly]);

  async function loadDetail(id: string) {
    const res = await api<RecruiterCandidateDetail>(`/api/recruiter/candidates/${id}`);
    if (res.success && res.data) setSelected(res.data);
  }

  useEffect(() => {
    void search();
  }, []);

  return (
    <main className="p-4 lg:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Candidates</h1>
        <p className="text-muted-foreground text-sm">Search and filter the student talent pool</p>
      </div>

      <Card>
        <CardContent className="pt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search name, email, college…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Input
            placeholder="College filter"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          />
          <Input
            placeholder="Skill (e.g. Java)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
          <Input
            placeholder="Min coding score"
            value={minCoding}
            onChange={(e) => setMinCoding(e.target.value)}
            type="number"
          />
          <label className="flex items-center gap-2 text-sm col-span-full">
            <input
              type="checkbox"
              checked={appliedOnly}
              onChange={(e) => setAppliedOnly(e.target.checked)}
            />
            Applied to my jobs only
          </label>
          <Button onClick={search} disabled={loading} className="sm:col-span-2">
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching…" : "Search"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Results ({list.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
            {list.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => loadDetail(c.id)}
                className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                  selected?.id === c.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
                }`}
              >
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.college ?? c.email}</p>
                <p className="text-xs mt-1">
                  Coding {c.codingScore} · Readiness {c.placementReadiness}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selected.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">{selected.email}</p>
              {selected.bio && <p>{selected.bio}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span>Coding: {selected.codingScore}</span>
                <span>Aptitude: {selected.aptitudeScore}</span>
                <span>Interview: {selected.interviewScore}</span>
                <span>ATS resume: {selected.resumeAtsScore}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selected.skills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded bg-muted">
                    {s}
                  </span>
                ))}
              </div>

              <div>
                <p className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resumes
                </p>
                {selected.resumes.length === 0 && (
                  <p className="text-muted-foreground text-xs">No resume uploaded</p>
                )}
                {selected.resumes.map((r) => (
                  <a
                    key={r.id}
                    href={r.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between border rounded-lg p-2 mb-2 hover:bg-muted/30"
                  >
                    <span>{r.fileName}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {r.atsScore != null && `ATS ${r.atsScore}`}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                ))}
              </div>

              {selected.applications.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Applications to your jobs</p>
                  <ul className="text-xs space-y-1">
                    {selected.applications.map((a) => (
                      <li key={a.id}>
                        {a.jobTitle} — {a.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

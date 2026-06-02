"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type {
  RecruiterCandidateSummary,
  RecruiterInterview,
  RecruiterJobPosting,
} from "@placepro/shared";
import { Calendar, Plus } from "lucide-react";

export default function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState<RecruiterInterview[]>([]);
  const [candidates, setCandidates] = useState<RecruiterCandidateSummary[]>([]);
  const [jobs, setJobs] = useState<RecruiterJobPosting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    candidateId: "",
    jobId: "",
    scheduledAt: "",
    type: "technical" as const,
    meetingUrl: "",
    notes: "",
  });

  function loadInterviews() {
    api<RecruiterInterview[]>("/api/recruiter/interviews").then((res) => {
      if (res.success && res.data) setInterviews(res.data);
    });
  }

  useEffect(() => {
    loadInterviews();
    api<RecruiterCandidateSummary[]>("/api/recruiter/candidates?appliedOnly=true").then(
      (res) => {
        if (res.success && res.data) {
          setCandidates(res.data);
          if (res.data[0]) setForm((f) => ({ ...f, candidateId: res.data![0]!.id }));
        }
      }
    );
    api<RecruiterJobPosting[]>("/api/recruiter/jobs").then((res) => {
      if (res.success && res.data) setJobs(res.data);
    });
  }, []);

  async function schedule() {
    const res = await api<RecruiterInterview>("/api/recruiter/interviews", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        jobId: form.jobId || undefined,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      }),
    });
    if (res.success) {
      setShowForm(false);
      loadInterviews();
    }
  }

  async function markCompleted(id: string) {
    await api(`/api/recruiter/interviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "completed" }),
    });
    loadInterviews();
  }

  return (
    <main className="p-4 lg:p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Interviews</h1>
          <p className="text-muted-foreground text-sm">Schedule and track candidate interviews</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New interview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.candidateId}
              onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={form.jobId}
              onChange={(e) => setForm({ ...form, jobId: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">No job linked</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as typeof form.type })
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="technical">Technical</option>
              <option value="hr">HR</option>
              <option value="manager">Manager</option>
              <option value="final">Final</option>
            </select>
            <Input
              placeholder="Meeting URL"
              value={form.meetingUrl}
              onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
              className="sm:col-span-2"
            />
            <Input
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="sm:col-span-2"
            />
            <Button onClick={schedule} className="sm:col-span-2">
              Schedule interview
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {interviews.map((i) => (
          <Card key={i.id}>
            <CardContent className="py-4 flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {i.candidateName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(i.scheduledAt).toLocaleString()} · {i.type} · {i.status}
                </p>
                {i.jobTitle && (
                  <p className="text-xs text-muted-foreground mt-1">Role: {i.jobTitle}</p>
                )}
                {i.meetingUrl && (
                  <a
                    href={i.meetingUrl}
                    className="text-xs text-primary hover:underline mt-1 block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join meeting
                  </a>
                )}
              </div>
              {i.status === "scheduled" && (
                <Button size="sm" variant="outline" onClick={() => markCompleted(i.id)}>
                  Mark completed
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

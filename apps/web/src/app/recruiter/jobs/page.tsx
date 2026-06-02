"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { RecruiterJobPosting } from "@placepro/shared";
import { Plus, Briefcase } from "lucide-react";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJobPosting[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    companyId: "",
    title: "",
    description: "",
    type: "INTERNSHIP" as const,
    location: "",
    skills: "",
  });

  function load() {
    api<RecruiterJobPosting[]>("/api/recruiter/jobs").then((res) => {
      if (res.success && res.data) setJobs(res.data);
    });
  }

  useEffect(() => {
    load();
    api<{ id: string; name: string }[]>("/api/recruiter/companies").then((res) => {
      if (res.success && res.data) {
        setCompanies(res.data);
        if (res.data[0]) setForm((f) => ({ ...f, companyId: res.data![0]!.id }));
      }
    });
  }, []);

  async function createJob() {
    const res = await api<RecruiterJobPosting>("/api/recruiter/jobs", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    if (res.success) {
      setShowForm(false);
      load();
    }
  }

  async function toggleActive(job: RecruiterJobPosting) {
    await api(`/api/recruiter/jobs/${job.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !job.isActive }),
    });
    load();
  }

  return (
    <main className="p-4 lg:p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Job postings</h1>
          <p className="text-muted-foreground text-sm">Create and manage openings</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New job
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create posting</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Job title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as typeof form.type })
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="INTERNSHIP">Internship</option>
              <option value="FULL_TIME">Full time</option>
              <option value="CONTRACT">Contract</option>
            </select>
            <Input
              placeholder="Skills (comma-separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="sm:col-span-2 min-h-[100px] rounded-lg border border-border bg-background p-3 text-sm"
            />
            <Button onClick={createJob} className="sm:col-span-2">
              Publish job
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="py-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  {job.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {job.companyName} · {job.location} · {job.type}
                </p>
                <p className="text-sm mt-2 line-clamp-2">{job.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {job.applicationsCount} applications
                  {!job.isActive && " · Inactive"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleActive(job)}>
                {job.isActive ? "Deactivate" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

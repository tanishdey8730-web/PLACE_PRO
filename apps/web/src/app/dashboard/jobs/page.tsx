"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, IndianRupee } from "lucide-react";
import { api } from "@/lib/api";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  company: { name: string };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<"jobs" | "internships">("jobs");

  useEffect(() => {
    api<Job[]>("/api/jobs").then((res) => {
      if (res.success && res.data) setJobs(res.data as Job[]);
      else setJobs([{
        id: "1", title: "Software Engineer Intern", location: "Bangalore", type: "INTERNSHIP",
        salaryMin: 80000, salaryMax: 120000, skills: ["Python", "Java"], company: { name: "Google" },
      }]);
    });
  }, []);

  const filtered = jobs.filter((j) => tab === "internships" ? j.type === "INTERNSHIP" : j.type !== "INTERNSHIP");

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold">Jobs & Internships</h1>
        <div className="flex gap-2 mt-4 mb-8">
          <Button variant={tab === "jobs" ? "gradient" : "outline"} size="sm" onClick={() => setTab("jobs")}>Jobs</Button>
          <Button variant={tab === "internships" ? "gradient" : "outline"} size="sm" onClick={() => setTab("internships")}>Internships</Button>
        </div>
        <div className="space-y-4">
          {filtered.map((job) => (
            <Card key={job.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-primary">{job.company.name}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                    {job.salaryMin && (
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />{job.salaryMin/1000}k–{job.salaryMax! / 1000}k
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.skills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
                <Button variant="gradient">Apply Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}

import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, authorize, isRecruiterDemo } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  RecruiterAnalytics,
  RecruiterCandidateDetail,
  RecruiterCandidateSummary,
  RecruiterInterview,
  RecruiterJobPosting,
} from "@placepro/shared";
import {
  addDemoInterview,
  demoAnalytics,
  demoJobs,
  filterDemoCandidates,
  getDemoCandidateDetail,
  getDemoInterviews,
  updateDemoInterview,
} from "../demo/recruiter.js";
import { randomBytes } from "crypto";

const router = Router();

const recruiterOnly = [authenticate, authorize("RECRUITER", "ADMIN")] as const;

function mapCandidate(
  user: {
    id: string;
    name: string;
    email: string;
    college: string | null;
    graduationYear: number | null;
    skills: string[];
    avatar: string | null;
    profile: {
      codingScore: number;
      aptitudeScore: number;
      interviewScore: number;
      resumeAtsScore: number;
    } | null;
    resumes: { id: string; fileUrl: string }[];
    jobApplications: { id: string }[];
  },
  appliedToMyJobs: boolean
): RecruiterCandidateSummary {
  const p = user.profile;
  const coding = p?.codingScore ?? 0;
  const aptitude = p?.aptitudeScore ?? 0;
  const interview = p?.interviewScore ?? 0;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    graduationYear: user.graduationYear,
    skills: user.skills,
    avatar: user.avatar,
    codingScore: coding,
    aptitudeScore: aptitude,
    interviewScore: interview,
    placementReadiness: Math.round((coding + aptitude + interview) / 3),
    resumeAtsScore: p?.resumeAtsScore ?? 0,
    applicationsCount: user.jobApplications.length,
    latestResumeId: user.resumes[0]?.id,
    latestResumeUrl: user.resumes[0]?.fileUrl,
    appliedToMyJobs,
  };
}

router.get("/analytics", ...recruiterOnly, async (req, res, next) => {
  try {
    if (isRecruiterDemo(req)) {
      return res.json({ success: true, data: demoAnalytics });
    }

    const recruiterId = req.user!.userId;
    const myJobIds = (
      await prisma.job.findMany({
        where: { postedById: recruiterId },
        select: { id: true },
      })
    ).map((j) => j.id);

    const [
      totalCandidates,
      activeJobs,
      applications,
      interviewsScheduled,
      interviewsThisWeek,
      pipelineGroups,
      students,
      recentApps,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.job.count({ where: { postedById: recruiterId, isActive: true } }),
      prisma.jobApplication.count({ where: { jobId: { in: myJobIds } } }),
      prisma.recruiterInterview.count({
        where: { recruiterId, status: "scheduled" },
      }),
      prisma.recruiterInterview.count({
        where: {
          recruiterId,
          status: "scheduled",
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 86400000),
          },
        },
      }),
      prisma.jobApplication.groupBy({
        by: ["status"],
        where: { jobId: { in: myJobIds } },
        _count: true,
      }),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        take: 200,
        include: { profile: true },
      }),
      prisma.jobApplication.findMany({
        where: { jobId: { in: myJobIds } },
        take: 8,
        orderBy: { appliedAt: "desc" },
        include: { user: { select: { name: true } }, job: { select: { title: true } } },
      }),
    ]);

    const skillCounts = new Map<string, number>();
    for (const s of students) {
      for (const skill of s.skills) {
        skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
      }
    }
    const topSkills = [...skillCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([skill, count]) => ({ skill, count }));

    const profiles = students.filter((s) => s.profile);
    const avg = (fn: (p: NonNullable<(typeof profiles)[0]["profile"]>) => number) => {
      if (!profiles.length) return 0;
      return Math.round(
        profiles.reduce((sum, s) => sum + fn(s.profile!), 0) / profiles.length
      );
    };

    const data: RecruiterAnalytics = {
      totalCandidates,
      activeJobs,
      totalApplications: applications,
      interviewsScheduled,
      interviewsThisWeek,
      pipeline: pipelineGroups.map((g) => ({
        status: g.status,
        count: g._count,
      })),
      topSkills,
      scoreAverages: {
        coding: avg((p) => p.codingScore),
        aptitude: avg((p) => p.aptitudeScore),
        interview: avg((p) => p.interviewScore),
        readiness: avg((p) => (p.codingScore + p.aptitudeScore + p.interviewScore) / 3),
      },
      recentApplications: recentApps.map((a) => ({
        id: a.id,
        candidateName: a.user.name,
        jobTitle: a.job.title,
        status: a.status,
        appliedAt: a.appliedAt.toISOString(),
      })),
    };

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/candidates", ...recruiterOnly, async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const college = String(req.query.college ?? "").trim();
    const skill = String(req.query.skill ?? "").trim();
    const minCoding = req.query.minCoding ? Number(req.query.minCoding) : undefined;
    const graduationYear = req.query.year ? Number(req.query.year) : undefined;
    const appliedOnly = req.query.appliedOnly === "true";

    if (isRecruiterDemo(req)) {
      return res.json({
        success: true,
        data: filterDemoCandidates({
          q,
          college,
          skill,
          minCoding,
          graduationYear,
          appliedOnly,
        }),
      });
    }

    const recruiterId = req.user!.userId;
    const myJobIds = (
      await prisma.job.findMany({
        where: { postedById: recruiterId },
        select: { id: true },
      })
    ).map((j) => j.id);

    const where: Prisma.UserWhereInput = {
      role: "STUDENT",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { college: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(college ? { college: { contains: college, mode: "insensitive" } } : {}),
      ...(skill ? { skills: { has: skill } } : {}),
      ...(graduationYear ? { graduationYear } : {}),
      ...(minCoding
        ? { profile: { codingScore: { gte: minCoding } } }
        : {}),
      ...(appliedOnly && myJobIds.length
        ? { jobApplications: { some: { jobId: { in: myJobIds } } } }
        : appliedOnly
          ? { id: "none" }
          : {}),
    };

    const users = await prisma.user.findMany({
      where,
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        resumes: { take: 1, orderBy: { createdAt: "desc" }, select: { id: true, fileUrl: true } },
        jobApplications: {
          where: myJobIds.length ? { jobId: { in: myJobIds } } : undefined,
          select: { id: true },
        },
      },
    });

    const data: RecruiterCandidateSummary[] = users.map((u) =>
      mapCandidate(u, u.jobApplications.length > 0)
    );

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/candidates/:id", ...recruiterOnly, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    if (isRecruiterDemo(req)) {
      const detail = getDemoCandidateDetail(id);
      if (!detail) throw new AppError(404, "Candidate not found");
      return res.json({ success: true, data: detail });
    }

    const recruiterId = req.user!.userId;
    const user = await prisma.user.findFirst({
      where: { id, role: "STUDENT" },
      include: {
        profile: true,
        resumes: { orderBy: { createdAt: "desc" }, take: 5 },
        jobApplications: {
          include: { job: { select: { title: true, postedById: true } } },
          orderBy: { appliedAt: "desc" },
        },
      },
    });

    if (!user) throw new AppError(404, "Candidate not found");

    const summary = mapCandidate(
      {
        ...user,
        jobApplications: user.jobApplications.filter(
          (a) => a.job.postedById === recruiterId
        ),
      },
      user.jobApplications.some((a) => a.job.postedById === recruiterId)
    );

    const detail: RecruiterCandidateDetail = {
      ...summary,
      bio: user.bio,
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      resumes: user.resumes.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        fileUrl: r.fileUrl,
        atsScore: r.atsScore,
        createdAt: r.createdAt.toISOString(),
      })),
      applications: user.jobApplications
        .filter((a) => a.job.postedById === recruiterId)
        .map((a) => ({
          id: a.id,
          status: a.status,
          jobTitle: a.job.title,
          appliedAt: a.appliedAt.toISOString(),
        })),
    };

    res.json({ success: true, data: detail });
  } catch (e) {
    next(e);
  }
});

router.get("/jobs", ...recruiterOnly, async (req, res, next) => {
  try {
    if (isRecruiterDemo(req)) {
      return res.json({ success: true, data: demoJobs });
    }

    const jobs = await prisma.job.findMany({
      where: { postedById: req.user!.userId },
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data: RecruiterJobPosting[] = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      description: j.description,
      type: j.type,
      location: j.location,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      skills: j.skills,
      experience: j.experience,
      isActive: j.isActive,
      companyName: j.company.name,
      companyId: j.companyId,
      applicationsCount: j._count.applications,
      createdAt: j.createdAt.toISOString(),
    }));

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

const jobSchema = z.object({
  companyId: z.string(),
  title: z.string().min(2),
  description: z.string().min(20),
  type: z.enum(["FULL_TIME", "INTERNSHIP", "CONTRACT"]),
  location: z.string().min(2),
  salaryMin: z.number().int().optional(),
  salaryMax: z.number().int().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.post("/jobs", ...recruiterOnly, async (req, res, next) => {
  try {
    const input = jobSchema.parse(req.body);

    if (isRecruiterDemo(req)) {
      const job: RecruiterJobPosting = {
        id: `job-${randomBytes(3).toString("hex")}`,
        ...input,
        skills: input.skills ?? [],
        isActive: input.isActive ?? true,
        companyName: "PlacePro Labs",
        applicationsCount: 0,
        createdAt: new Date().toISOString(),
      };
      demoJobs.unshift(job);
      return res.status(201).json({ success: true, data: job });
    }

    const job = await prisma.job.create({
      data: {
        ...input,
        skills: input.skills ?? [],
        postedById: req.user!.userId,
        isActive: input.isActive ?? true,
      },
      include: { company: true, _count: { select: { applications: true } } },
    });

    res.status(201).json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        description: job.description,
        type: job.type,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        skills: job.skills,
        experience: job.experience,
        isActive: job.isActive,
        companyName: job.company.name,
        companyId: job.companyId,
        applicationsCount: 0,
        createdAt: job.createdAt.toISOString(),
      } satisfies RecruiterJobPosting,
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/jobs/:id", ...recruiterOnly, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const input = jobSchema.partial().parse(req.body);

    if (isRecruiterDemo(req)) {
      const idx = demoJobs.findIndex((j) => j.id === id);
      if (idx < 0) throw new AppError(404, "Job not found");
      demoJobs[idx] = { ...demoJobs[idx]!, ...input };
      return res.json({ success: true, data: demoJobs[idx] });
    }

    const existing = await prisma.job.findFirst({
      where: { id, postedById: req.user!.userId },
    });
    if (!existing) throw new AppError(404, "Job not found");

    const job = await prisma.job.update({
      where: { id },
      data: input,
      include: { company: true, _count: { select: { applications: true } } },
    });

    res.json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        description: job.description,
        type: job.type,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        skills: job.skills,
        experience: job.experience,
        isActive: job.isActive,
        companyName: job.company.name,
        companyId: job.companyId,
        applicationsCount: job._count.applications,
        createdAt: job.createdAt.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

router.delete("/jobs/:id", ...recruiterOnly, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    if (isRecruiterDemo(req)) {
      const idx = demoJobs.findIndex((j) => j.id === id);
      if (idx >= 0) demoJobs.splice(idx, 1);
      return res.json({ success: true, data: { deleted: true } });
    }

    const existing = await prisma.job.findFirst({
      where: { id, postedById: req.user!.userId },
    });
    if (!existing) throw new AppError(404, "Job not found");

    await prisma.job.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, data: { deleted: true } });
  } catch (e) {
    next(e);
  }
});

router.get("/interviews", ...recruiterOnly, async (req, res, next) => {
  try {
    if (isRecruiterDemo(req)) {
      return res.json({ success: true, data: getDemoInterviews() });
    }

    const rows = await prisma.recruiterInterview.findMany({
      where: { recruiterId: req.user!.userId },
      include: {
        candidate: { select: { name: true, email: true } },
        job: { select: { title: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    const data: RecruiterInterview[] = rows.map((r) => ({
      id: r.id,
      candidateId: r.candidateId,
      candidateName: r.candidate.name,
      candidateEmail: r.candidate.email,
      jobId: r.jobId,
      jobTitle: r.job?.title ?? null,
      scheduledAt: r.scheduledAt.toISOString(),
      durationMinutes: r.durationMinutes,
      type: r.type as RecruiterInterview["type"],
      status: r.status as RecruiterInterview["status"],
      location: r.location,
      meetingUrl: r.meetingUrl,
      notes: r.notes,
    }));

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

const interviewSchema = z.object({
  candidateId: z.string(),
  jobId: z.string().optional(),
  scheduledAt: z.string(),
  durationMinutes: z.number().int().min(15).max(180).optional(),
  type: z.enum(["technical", "hr", "manager", "final"]).optional(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  notes: z.string().optional(),
});

router.post("/interviews", ...recruiterOnly, async (req, res, next) => {
  try {
    const input = interviewSchema.parse(req.body);

    if (isRecruiterDemo(req)) {
      const cand = getDemoCandidateDetail(input.candidateId);
      const job = input.jobId ? demoJobs.find((j) => j.id === input.jobId) : undefined;
      const interview: RecruiterInterview = {
        id: `int-${randomBytes(3).toString("hex")}`,
        candidateId: input.candidateId,
        candidateName: cand?.name ?? "Candidate",
        candidateEmail: cand?.email ?? "",
        jobId: input.jobId,
        jobTitle: job?.title,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes ?? 45,
        type: input.type ?? "technical",
        status: "scheduled",
        location: input.location,
        meetingUrl: input.meetingUrl || undefined,
        notes: input.notes,
      };
      addDemoInterview(interview);
      return res.status(201).json({ success: true, data: interview });
    }

    const candidate = await prisma.user.findFirst({
      where: { id: input.candidateId, role: "STUDENT" },
    });
    if (!candidate) throw new AppError(404, "Candidate not found");

    const row = await prisma.recruiterInterview.create({
      data: {
        recruiterId: req.user!.userId,
        candidateId: input.candidateId,
        jobId: input.jobId,
        scheduledAt: new Date(input.scheduledAt),
        durationMinutes: input.durationMinutes ?? 45,
        type: input.type ?? "technical",
        location: input.location,
        meetingUrl: input.meetingUrl || null,
        notes: input.notes,
      },
      include: {
        candidate: { select: { name: true, email: true } },
        job: { select: { title: true } },
      },
    });

    if (input.jobId) {
      await prisma.jobApplication.updateMany({
        where: { jobId: input.jobId, userId: input.candidateId },
        data: { status: "INTERVIEW" },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: row.id,
        candidateId: row.candidateId,
        candidateName: row.candidate.name,
        candidateEmail: row.candidate.email,
        jobId: row.jobId,
        jobTitle: row.job?.title ?? null,
        scheduledAt: row.scheduledAt.toISOString(),
        durationMinutes: row.durationMinutes,
        type: row.type as RecruiterInterview["type"],
        status: row.status as RecruiterInterview["status"],
        location: row.location,
        meetingUrl: row.meetingUrl,
        notes: row.notes,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/interviews/:id", ...recruiterOnly, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const input = z
      .object({
        scheduledAt: z.string().optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
        notes: z.string().optional(),
        meetingUrl: z.string().optional(),
      })
      .parse(req.body);

    if (isRecruiterDemo(req)) {
      const updated = updateDemoInterview(id, {
        ...(input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.meetingUrl !== undefined ? { meetingUrl: input.meetingUrl } : {}),
      });
      if (!updated) throw new AppError(404, "Interview not found");
      return res.json({ success: true, data: updated });
    }

    const existing = await prisma.recruiterInterview.findFirst({
      where: { id, recruiterId: req.user!.userId },
    });
    if (!existing) throw new AppError(404, "Interview not found");

    const row = await prisma.recruiterInterview.update({
      where: { id },
      data: {
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        status: input.status,
        notes: input.notes,
        meetingUrl: input.meetingUrl,
      },
      include: {
        candidate: { select: { name: true, email: true } },
        job: { select: { title: true } },
      },
    });

    res.json({
      success: true,
      data: {
        id: row.id,
        candidateId: row.candidateId,
        candidateName: row.candidate.name,
        candidateEmail: row.candidate.email,
        jobId: row.jobId,
        jobTitle: row.job?.title ?? null,
        scheduledAt: row.scheduledAt.toISOString(),
        durationMinutes: row.durationMinutes,
        type: row.type as RecruiterInterview["type"],
        status: row.status as RecruiterInterview["status"],
        location: row.location,
        meetingUrl: row.meetingUrl,
        notes: row.notes,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/applications/:id/status", ...recruiterOnly, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { status } = z
      .object({
        status: z.enum([
          "APPLIED",
          "REVIEWING",
          "SHORTLISTED",
          "INTERVIEW",
          "OFFERED",
          "REJECTED",
          "WITHDRAWN",
        ]),
      })
      .parse(req.body);

    if (isRecruiterDemo(req)) {
      return res.json({ success: true, data: { id, status } });
    }

    const app = await prisma.jobApplication.findFirst({
      where: { id },
      include: { job: true },
    });
    if (!app || app.job.postedById !== req.user!.userId) {
      throw new AppError(404, "Application not found");
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
});

router.get("/companies", ...recruiterOnly, async (req, res, next) => {
  try {
    if (isRecruiterDemo(req)) {
      return res.json({
        success: true,
        data: [{ id: "company-1", name: "PlacePro Labs", industry: "EdTech" }],
      });
    }
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, industry: true },
    });
    res.json({ success: true, data: companies });
  } catch (e) {
    next(e);
  }
});

export default router;

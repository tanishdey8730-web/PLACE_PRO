import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { location, type, skills } = req.query;
    const where: Record<string, unknown> = { isActive: true };
    if (location) where.location = { contains: String(location), mode: "insensitive" };
    if (type) where.type = type;
    if (skills) where.skills = { hasSome: String(skills).split(",") };

    const jobs = await prisma.job.findMany({
      where,
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: jobs });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/apply", authenticate, async (req, res, next) => {
  try {
    const { resumeUrl, coverNote } = req.body as { resumeUrl?: string; coverNote?: string };
    const application = await prisma.jobApplication.upsert({
      where: {
        jobId_userId: { jobId: req.params.id, userId: req.user!.userId },
      },
      update: { resumeUrl, coverNote },
      create: {
        jobId: req.params.id,
        userId: req.user!.userId,
        resumeUrl,
        coverNote,
      },
    });
    res.status(201).json({ success: true, data: application });
  } catch (e) {
    next(e);
  }
});

router.get("/applications", authenticate, async (req, res, next) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId: req.user!.userId },
      include: { job: { include: { company: true } } },
      orderBy: { appliedAt: "desc" },
    });
    res.json({ success: true, data: applications });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, authorize("RECRUITER", "ADMIN"), async (req, res, next) => {
  try {
    const job = await prisma.job.create({ data: req.body });
    res.status(201).json({ success: true, data: job });
  } catch (e) {
    next(e);
  }
});

export default router;

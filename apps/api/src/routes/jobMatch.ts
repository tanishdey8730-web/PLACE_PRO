import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { analyzeJobMatch } from "../services/aiClient.js";
import { computeLocalJobMatch, normalizeAiJobMatch } from "../services/jobMatchScoring.js";
import { demoJobMatch } from "../demo/jobMatch.js";
import type { JobMatchResult } from "@placepro/shared";

const router = Router();

const bodySchema = z.object({
  resume: z.string().min(20),
  jobDescription: z.string().min(20),
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({ success: true, data: [demoJobMatch] });
    }

    const rows = await prisma.jobMatchAnalysis.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        matchScore: true,
        jobTitle: true,
        companyName: true,
        missingSkills: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = bodySchema.parse(req.body);
    const local = computeLocalJobMatch(input.resume, input.jobDescription);

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          ...demoJobMatch,
          ...local,
          matchScore: demoJobMatch.matchScore,
          missingSkills: demoJobMatch.missingSkills,
          jobTitle: input.jobTitle,
          companyName: input.companyName,
        } satisfies JobMatchResult,
      });
    }

    let result: JobMatchResult = local;
    try {
      const raw = (await analyzeJobMatch({
        resume: input.resume,
        job_description: input.jobDescription,
        job_title: input.jobTitle,
        company_name: input.companyName,
      })) as Record<string, unknown>;
      result = { ...local, ...normalizeAiJobMatch(raw, local) };
    } catch {
      result = local;
    }

    const record = await prisma.jobMatchAnalysis.create({
      data: {
        userId: req.user!.userId,
        jobTitle: input.jobTitle,
        companyName: input.companyName,
        resumeText: input.resume.slice(0, 50000),
        jobDescription: input.jobDescription.slice(0, 50000),
        matchScore: result.matchScore,
        missingSkills: result.missingSkills,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        analysis: {
          matchedKeywords: result.matchedKeywords,
          recommendations: result.recommendations,
        } as Prisma.InputJsonValue,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...result,
        id: record.id,
        jobTitle: input.jobTitle,
        companyName: input.companyName,
        createdAt: record.createdAt.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

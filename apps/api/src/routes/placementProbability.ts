import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { predictPlacementProbability } from "../services/aiClient.js";
import {
  computePlacementProbability,
  normalizeAiPlacementResult,
} from "../services/placementProbability.js";
import { demoPlacementProbability } from "../demo/placementProbability.js";
import type { PlacementProbabilityInput, PlacementProbabilityResult } from "@placepro/shared";

const router = Router();

const inputSchema = z.object({
  cgpa: z.number().min(0).max(10),
  dsaScore: z.number().min(0).max(100),
  aptitudeScore: z.number().min(0).max(100),
  resumeScore: z.number().min(0).max(100),
  projects: z.number().int().min(0).max(20),
  certifications: z.number().int().min(0).max(20),
  targetRole: z.string().optional(),
  branch: z.string().optional(),
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({ success: true, data: [demoPlacementProbability] });
    }

    const rows = await prisma.placementProbabilityPrediction.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        overallProbability: r.overallProbability,
        companyProbabilities: r.companyProbabilities,
        improvementSuggestions: r.improvementSuggestions,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = inputSchema.parse(req.body);
    const payload: PlacementProbabilityInput = {
      cgpa: input.cgpa,
      dsaScore: input.dsaScore,
      aptitudeScore: input.aptitudeScore,
      resumeScore: input.resumeScore,
      projects: input.projects,
      certifications: input.certifications,
      targetRole: input.targetRole,
      branch: input.branch,
    };

    const localResult = computePlacementProbability(payload);

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          ...localResult,
          id: "demo-prediction",
        } satisfies PlacementProbabilityResult,
      });
    }

    let result: PlacementProbabilityResult = localResult;
    try {
      const raw = (await predictPlacementProbability({
        cgpa: input.cgpa,
        dsa_score: input.dsaScore,
        aptitude_score: input.aptitudeScore,
        resume_score: input.resumeScore,
        projects: input.projects,
        certifications: input.certifications,
        target_role: input.targetRole ?? "Software Engineer",
        branch: input.branch ?? "Computer Science",
      })) as Record<string, unknown>;
      result = normalizeAiPlacementResult(raw, payload, localResult);
      const level = raw.readiness_level ?? raw.readinessLevel;
      if (typeof level === "string") {
        result.readinessLevel = level as PlacementProbabilityResult["readinessLevel"];
      }
    } catch {
      result = localResult;
    }

    const record = await prisma.placementProbabilityPrediction.create({
      data: {
        userId: req.user!.userId,
        cgpa: input.cgpa,
        dsaScore: input.dsaScore,
        aptitudeScore: input.aptitudeScore,
        resumeScore: input.resumeScore,
        projectCount: input.projects,
        certificationCount: input.certifications,
        overallProbability: result.overallProbability,
        companyProbabilities: result.companyProbabilities as unknown as Prisma.InputJsonValue,
        improvementSuggestions: result.improvementSuggestions as unknown as Prisma.InputJsonValue,
      },
    });

    await prisma.studentProfile
      .update({
        where: { userId: req.user!.userId },
        data: {
          placementReadiness: result.overallProbability,
          codingScore: input.dsaScore,
          aptitudeScore: input.aptitudeScore,
          resumeAtsScore: input.resumeScore,
        },
      })
      .catch(() => undefined);

    res.status(201).json({
      success: true,
      data: {
        ...result,
        id: record.id,
        createdAt: record.createdAt.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

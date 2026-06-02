import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { analyzeLinkedInProfile } from "../services/aiClient.js";
import { normalizeLinkedInAnalysis, isValidLinkedInUrl } from "../services/linkedinScoring.js";
import { demoLinkedInAnalysis } from "../demo/linkedinAnalysis.js";
import type { LinkedInAnalysisResult } from "@placepro/shared";

const router = Router();

const analyzeSchema = z.object({
  profileUrl: z.string().min(1),
  targetRole: z.string().default("Software Engineer"),
  headline: z.string().optional(),
  about: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: [demoLinkedInAnalysis],
      });
    }

    const records = await prisma.linkedInAnalysis.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.json({
      success: true,
      data: records.map((r) => ({
        id: r.id,
        profileUrl: r.profileUrl,
        linkedinScore: r.linkedinScore,
        analysis: r.analysis,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = analyzeSchema.parse(req.body);

    if (!isValidLinkedInUrl(input.profileUrl)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid LinkedIn profile URL (linkedin.com/in/...)",
      });
    }

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          ...demoLinkedInAnalysis,
          profileUrl: input.profileUrl,
        } satisfies LinkedInAnalysisResult,
      });
    }

    let analysis: LinkedInAnalysisResult;
    try {
      const raw = (await analyzeLinkedInProfile({
        profile_url: input.profileUrl,
        target_role: input.targetRole,
        headline: input.headline,
        about: input.about,
        skills: input.skills,
      })) as Record<string, unknown>;
      analysis = normalizeLinkedInAnalysis(raw, input.profileUrl);
    } catch {
      analysis = normalizeLinkedInAnalysis(
        {
          linkedin_score: demoLinkedInAnalysis.linkedinScore,
          headline: demoLinkedInAnalysis.headline,
          about: demoLinkedInAnalysis.about,
          skills: demoLinkedInAnalysis.skills,
          missing_keywords: demoLinkedInAnalysis.missingKeywords,
          completeness: demoLinkedInAnalysis.completeness,
          suggestions: {
            profile: demoLinkedInAnalysis.suggestions.profile,
            visibility: demoLinkedInAnalysis.suggestions.visibility,
            recruiter_appeal: demoLinkedInAnalysis.suggestions.recruiterAppeal,
          },
          recommendations: demoLinkedInAnalysis.recommendations,
        },
        input.profileUrl
      );
    }

    const record = await prisma.linkedInAnalysis.create({
      data: {
        userId: req.user!.userId,
        profileUrl: input.profileUrl,
        linkedinScore: analysis.linkedinScore,
        analysis: analysis as unknown as Prisma.InputJsonValue,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...analysis,
        id: record.id,
        createdAt: record.createdAt.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

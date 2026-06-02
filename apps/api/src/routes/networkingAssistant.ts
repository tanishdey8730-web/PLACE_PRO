import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { generateNetworkingAssistant } from "../services/aiClient.js";
import { gatherNetworkingContext } from "../services/networkingContext.js";
import { normalizeNetworkingResult } from "../services/networkingAssistantNormalize.js";
import { demoNetworkingResult } from "../demo/networkingAssistant.js";
import type {
  NetworkingAssistantHistoryItem,
  NetworkingAssistantResult,
} from "@placepro/shared";

const router = Router();

const generateSchema = z.object({
  targetRole: z.string().min(2).default("Software Engineer"),
  targetCompanies: z.array(z.string()).default([]),
  industry: z.string().optional(),
  networkingGoal: z.string().optional(),
});

router.get("/history", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: [
          {
            id: "demo-net",
            targetRole: demoNetworkingResult.targetRole,
            targetCompanies: demoNetworkingResult.targetCompanies,
            summary: demoNetworkingResult.summary,
            createdAt: new Date().toISOString(),
          },
        ] satisfies NetworkingAssistantHistoryItem[],
      });
    }

    const rows = await prisma.networkingAssistantSession.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        targetRole: true,
        targetCompanies: true,
        summary: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        targetRole: r.targetRole,
        targetCompanies: r.targetCompanies,
        summary: r.summary,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:sessionId", authenticate, async (req, res, next) => {
  try {
    const sessionId = String(req.params.sessionId);

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: { ...demoNetworkingResult, id: "demo-net", createdAt: new Date().toISOString() },
      });
    }

    const session = await prisma.networkingAssistantSession.findFirst({
      where: { id: sessionId, userId: req.user!.userId },
    });

    if (!session) throw new AppError(404, "Session not found");

    const stored = session.result as NetworkingAssistantResult;
    res.json({
      success: true,
      data: {
        ...stored,
        id: session.id,
        targetRole: session.targetRole,
        targetCompanies: session.targetCompanies,
        summary: session.summary,
        createdAt: session.createdAt.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/generate", authenticate, async (req, res, next) => {
  try {
    const input = generateSchema.parse(req.body);

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          ...demoNetworkingResult,
          targetRole: input.targetRole,
          targetCompanies:
            input.targetCompanies.length > 0
              ? input.targetCompanies
              : demoNetworkingResult.targetCompanies,
          id: "demo-net",
          createdAt: new Date().toISOString(),
        },
      });
    }

    const userId = req.user!.userId;
    const { user, platformHints, platformMentors } = await gatherNetworkingContext(userId);

    let result: NetworkingAssistantResult;

    try {
      const raw = (await generateNetworkingAssistant({
        target_role: input.targetRole,
        target_companies: input.targetCompanies,
        industry: input.industry ?? "Technology",
        networking_goal: input.networkingGoal ?? "campus placement networking",
        context: {
          name: user?.name,
          college: user?.college,
          graduation_year: user?.graduationYear,
          skills: user?.skills,
          linkedin_url: user?.linkedinUrl,
          bio: user?.bio,
        },
        platform_hints: platformHints,
      })) as Record<string, unknown>;

      result = normalizeNetworkingResult(raw, {
        targetRole: input.targetRole,
        targetCompanies: input.targetCompanies,
      });
    } catch {
      result = {
        ...demoNetworkingResult,
        targetRole: input.targetRole,
        targetCompanies:
          input.targetCompanies.length > 0
            ? input.targetCompanies
            : demoNetworkingResult.targetCompanies,
      };
    }

    if (!result.summary) {
      result = {
        ...demoNetworkingResult,
        targetRole: input.targetRole,
        targetCompanies:
          input.targetCompanies.length > 0
            ? input.targetCompanies
            : demoNetworkingResult.targetCompanies,
      };
    }

    if (platformMentors.length > 0 && result.mentors.length < 2) {
      const fromDb = platformMentors.slice(0, 3).map((m) => ({
        id: `men-db-${m.userId}`,
        type: "MENTOR" as const,
        name: m.name,
        title: `Mentor · ${m.expertise.slice(0, 2).join(", ")}`,
        company: "PlacePro",
        matchScore: Math.round(m.rating * 20),
        reason: m.bio?.slice(0, 120) ?? "Verified mentor on PlacePro",
        connectionTip: "Book via Dashboard → Mentors",
        isPlatformUser: true,
        platformUserId: m.userId,
      }));
      result = {
        ...result,
        mentors: [...fromDb, ...result.mentors].slice(0, 5),
      };
    }

    const record = await prisma.networkingAssistantSession.create({
      data: {
        userId,
        targetRole: input.targetRole,
        targetCompanies: input.targetCompanies,
        industry: input.industry,
        summary: result.summary,
        result: result as unknown as Prisma.InputJsonValue,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...result,
        id: record.id,
        createdAt: record.createdAt.toISOString(),
      } satisfies NetworkingAssistantResult,
    });
  } catch (e) {
    next(e);
  }
});

export default router;

import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { analyzeProjectReview } from "../services/aiClient.js";
import { fetchGitHubRepoContext, buildRepoAnalysisPayload } from "../services/githubRepo.js";
import {
  computeLocalProjectReview,
  normalizeAiProjectReview,
} from "../services/projectReviewScoring.js";
import { demoProjectReview } from "../demo/projectReview.js";
import type { ProjectReviewReport } from "@placepro/shared";
import { awardXp } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";

const router = Router();

const bodySchema = z.object({
  repoUrl: z.string().min(5, "GitHub repository URL is required"),
});

function buildReport(
  ctx: Awaited<ReturnType<typeof fetchGitHubRepoContext>>,
  repoUrl: string,
  aiRaw: Record<string, unknown> | null
): ProjectReviewReport {
  const local = computeLocalProjectReview(ctx, repoUrl);
  return aiRaw ? { ...local, ...normalizeAiProjectReview(aiRaw, local) } : local;
}

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: [
          {
            id: demoProjectReview.id,
            repoFullName: demoProjectReview.repoFullName,
            projectScore: demoProjectReview.scores.overall,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }

    const rows = await prisma.projectReview.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        repoUrl: true,
        repoFullName: true,
        projectScore: true,
        primaryLanguage: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    if (isGuestUser(req)) {
      return res.json({ success: true, data: demoProjectReview });
    }

    const row = await prisma.projectReview.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!row?.report) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }

    res.json({ success: true, data: row.report });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = bodySchema.parse(req.body);
    const repoUrl = input.repoUrl.trim();

    let ctx;
    try {
      ctx = await fetchGitHubRepoContext(repoUrl);
    } catch (e) {
      if (isGuestUser(req) && demoProjectReview.repoUrl === repoUrl) {
        return res.json({
          success: true,
          data: { ...demoProjectReview, repoUrl },
        });
      }
      throw e;
    }

    const payload = buildRepoAnalysisPayload(ctx);

    if (isGuestUser(req)) {
      let report: ProjectReviewReport;
      try {
        const aiRaw = (await analyzeProjectReview({
          repo_url: ctx.htmlUrl,
          repo_full_name: ctx.fullName,
          repo_context: payload,
        })) as Record<string, unknown>;
        report = buildReport(ctx, repoUrl, aiRaw);
      } catch {
        report = buildReport(ctx, repoUrl, null);
      }
      return res.json({
        success: true,
        data: { ...report, id: demoProjectReview.id },
      });
    }

    let aiRaw: Record<string, unknown> | null = null;
    try {
      aiRaw = (await analyzeProjectReview({
        repo_url: ctx.htmlUrl,
        repo_full_name: ctx.fullName,
        repo_context: payload,
      })) as Record<string, unknown>;
    } catch {
      aiRaw = null;
    }

    const report = buildReport(ctx, repoUrl, aiRaw);

    const record = await prisma.projectReview.create({
      data: {
        userId: req.user!.userId,
        repoUrl: ctx.htmlUrl,
        repoFullName: ctx.fullName,
        primaryLanguage: ctx.primaryLanguage,
        projectScore: report.scores.overall,
        codeQuality: report.scores.codeQuality,
        architecture: report.scores.architecture,
        documentation: report.scores.documentation,
        resumeWorthiness: report.scores.resumeWorthiness,
        report: report as unknown as Prisma.InputJsonValue,
      },
    });

    await awardXp(req.user!.userId, XP_REWARDS.MOCK_INTERVIEW, "project_review");

    res.status(201).json({
      success: true,
      data: {
        ...report,
        id: record.id,
        createdAt: record.createdAt.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

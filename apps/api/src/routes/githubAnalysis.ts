import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { analyzeGitHubProfile } from "../services/aiClient.js";
import { normalizeUsername } from "../services/githubClient.js";
import {
  buildProfileAnalysisPayload,
  fetchGitHubProfileContext,
} from "../services/githubProfile.js";
import {
  computeLocalGitHubAnalysis,
  normalizeAiGitHubAnalysis,
} from "../services/githubAnalysisScoring.js";
import { demoGitHubAnalysis } from "../demo/githubAnalysis.js";
import type { GitHubProfileAnalysisReport } from "@placepro/shared";
import { awardXp } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";

const router = Router();

const bodySchema = z.object({
  username: z.string().min(1, "GitHub username is required"),
});

function buildReport(
  ctx: Awaited<ReturnType<typeof fetchGitHubProfileContext>>,
  aiRaw: Record<string, unknown> | null
): GitHubProfileAnalysisReport {
  const local = computeLocalGitHubAnalysis(ctx);
  return aiRaw ? { ...local, ...normalizeAiGitHubAnalysis(aiRaw, local) } : local;
}

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: [
          {
            id: demoGitHubAnalysis.id,
            username: demoGitHubAnalysis.username,
            developerScore: demoGitHubAnalysis.developerScore,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }

    const rows = await prisma.gitHubProfileAnalysis.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        username: true,
        developerScore: true,
        publicRepos: true,
        followers: true,
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
      return res.json({ success: true, data: demoGitHubAnalysis });
    }

    const row = await prisma.gitHubProfileAnalysis.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!row?.report) {
      return res.status(404).json({ success: false, error: "Analysis not found" });
    }

    res.json({ success: true, data: row.report });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = bodySchema.parse(req.body);
    const username = normalizeUsername(input.username);

    let ctx;
    try {
      ctx = await fetchGitHubProfileContext(username);
    } catch (e) {
      if (isGuestUser(req) && username.toLowerCase() === "octocat") {
        return res.json({ success: true, data: demoGitHubAnalysis });
      }
      throw e;
    }

    const payload = buildProfileAnalysisPayload(ctx);

    if (isGuestUser(req)) {
      let report: GitHubProfileAnalysisReport;
      try {
        const aiRaw = (await analyzeGitHubProfile({
          username: ctx.username,
          profile_context: payload,
        })) as Record<string, unknown>;
        report = buildReport(ctx, aiRaw);
      } catch {
        report = buildReport(ctx, null);
      }
      return res.json({
        success: true,
        data: { ...report, id: demoGitHubAnalysis.id },
      });
    }

    let aiRaw: Record<string, unknown> | null = null;
    try {
      aiRaw = (await analyzeGitHubProfile({
        username: ctx.username,
        profile_context: payload,
      })) as Record<string, unknown>;
    } catch {
      aiRaw = null;
    }

    const report = buildReport(ctx, aiRaw);

    const record = await prisma.gitHubProfileAnalysis.create({
      data: {
        userId: req.user!.userId,
        username: ctx.username,
        profileUrl: ctx.profileUrl,
        publicRepos: ctx.publicRepos,
        followers: ctx.followers,
        developerScore: report.developerScore,
        repositories: report.scores.repositories,
        languages: report.scores.languages,
        contributionActivity: report.scores.contributionActivity,
        projectQuality: report.scores.projectQuality,
        openSourceActivity: report.scores.openSourceActivity,
        report: report as unknown as Prisma.InputJsonValue,
      },
    });

    await awardXp(req.user!.userId, XP_REWARDS.MOCK_INTERVIEW, "github_analysis");

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

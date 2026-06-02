import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { generateDailyChallenges } from "../services/aiClient.js";
import {
  buildUserChallengeContext,
  placementGoalLabel,
  todayDateString,
} from "../services/dailyChallengeContext.js";
import {
  generateLocalDailyChallenges,
  normalizeAiDailyChallenges,
  stripAnswersForClient,
  type StoredChallenge,
} from "../services/dailyChallengeGenerator.js";
import { buildDemoDailyChallengeSet } from "../demo/dailyChallenge.js";
import type {
  CompleteDailyChallengeResult,
  DailyChallengeItem,
  DailyChallengeSet,
  DailyChallengeHistoryItem,
  PlacementGoal,
} from "@placepro/shared";
import { PLACEMENT_GOALS } from "@placepro/shared";
import { awardXp, updateStreak } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";

const router = Router();

const generateSchema = z.object({
  placementGoal: z
    .enum(["product_company", "service_company", "faang", "core_cs", "general"])
    .optional(),
  weakTopics: z.array(z.string()).optional(),
  force: z.boolean().optional(),
});

const completeSchema = z.object({
  setId: z.string(),
  challengeId: z.string(),
  answer: z.string().optional(),
});

function toClientSet(
  row: {
    id: string;
    challengeDate: string;
    placementGoal: string;
    weakTopics: string[];
    progressSnapshot: unknown;
    challenges: unknown;
    completedCount: number;
    totalCount: number;
    isDayComplete: boolean;
    xpEarned: number;
    summary: string | null;
    createdAt: Date;
  },
  goalLabel: string
): DailyChallengeSet {
  const challenges = row.challenges as DailyChallengeItem[];
  const progress = row.progressSnapshot as DailyChallengeSet["progress"];
  const total = row.totalCount || challenges.length;
  const completed = row.completedCount;
  return {
    id: row.id,
    challengeDate: row.challengeDate,
    placementGoal: row.placementGoal as PlacementGoal,
    placementGoalLabel: goalLabel,
    weakTopics: row.weakTopics,
    progress,
    challenges: stripAnswersForClient(challenges),
    completedCount: completed,
    totalCount: total,
    completionPercent: total ? Math.round((completed / total) * 100) : 0,
    isDayComplete: row.isDayComplete,
    xpEarnedToday: row.xpEarned,
    summary: row.summary ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}

async function createChallengeSet(
  userId: string,
  ctx: Awaited<ReturnType<typeof buildUserChallengeContext>>,
  force: boolean
): Promise<DailyChallengeSet> {
  const date = todayDateString();

  if (!force) {
    const existing = await prisma.dailyChallengeSet.findUnique({
      where: { userId_challengeDate: { userId, challengeDate: date } },
    });
    if (existing) {
      return toClientSet(existing, placementGoalLabel(existing.placementGoal as PlacementGoal));
    }
  } else {
    await prisma.dailyChallengeSet.deleteMany({
      where: { userId, challengeDate: date },
    });
  }

  let generated: {
    challenges: StoredChallenge[];
    answerKey: Record<string, string>;
    summary: string;
  };

  try {
    const aiRaw = (await generateDailyChallenges({
      placement_goal: ctx.placementGoal,
      placement_goal_label: ctx.placementGoalLabel,
      weak_topics: ctx.weakTopics,
      progress: ctx.progress,
    })) as Record<string, unknown>;
    generated = normalizeAiDailyChallenges(aiRaw, ctx);
  } catch {
    generated = generateLocalDailyChallenges(ctx);
  }

  const clientChallenges: DailyChallengeItem[] = generated.challenges.map(
    ({ correctAnswer: _c, ...c }) => ({ ...c, completed: false })
  );

  const row = await prisma.dailyChallengeSet.create({
    data: {
      userId,
      challengeDate: date,
      placementGoal: ctx.placementGoal,
      weakTopics: ctx.weakTopics,
      progressSnapshot: ctx.progress as unknown as Prisma.InputJsonValue,
      challenges: clientChallenges as unknown as Prisma.InputJsonValue,
      answerKey: generated.answerKey as unknown as Prisma.InputJsonValue,
      completedCount: 0,
      totalCount: clientChallenges.length,
      summary: generated.summary,
    },
  });

  return toClientSet(row, ctx.placementGoalLabel);
}

router.get("/goals", authenticate, (_req, res) => {
  res.json({ success: true, data: PLACEMENT_GOALS });
});

router.get("/history", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      const date = todayDateString();
      const demo = buildDemoDailyChallengeSet(date);
      const history: DailyChallengeHistoryItem[] = [
        {
          id: demo.id,
          challengeDate: demo.challengeDate,
          completedCount: demo.completedCount,
          totalCount: demo.totalCount,
          completionPercent: demo.completionPercent,
          isDayComplete: demo.isDayComplete,
          placementGoal: demo.placementGoal,
        },
      ];
      return res.json({ success: true, data: history });
    }

    const rows = await prisma.dailyChallengeSet.findMany({
      where: { userId: req.user!.userId },
      orderBy: { challengeDate: "desc" },
      take: 14,
      select: {
        id: true,
        challengeDate: true,
        completedCount: true,
        totalCount: true,
        isDayComplete: true,
        placementGoal: true,
      },
    });

    const history: DailyChallengeHistoryItem[] = rows.map((r) => ({
      id: r.id,
      challengeDate: r.challengeDate,
      completedCount: r.completedCount,
      totalCount: r.totalCount,
      completionPercent: r.totalCount
        ? Math.round((r.completedCount / r.totalCount) * 100)
        : 0,
      isDayComplete: r.isDayComplete,
      placementGoal: r.placementGoal as PlacementGoal,
    }));

    res.json({ success: true, data: history });
  } catch (e) {
    next(e);
  }
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    const date = todayDateString();

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: buildDemoDailyChallengeSet(date),
      });
    }

    const userId = req.user!.userId;
    let row = await prisma.dailyChallengeSet.findUnique({
      where: { userId_challengeDate: { userId, challengeDate: date } },
    });

    if (!row) {
      const ctx = await buildUserChallengeContext(userId, false);
      const set = await createChallengeSet(userId, ctx, false);
      return res.json({ success: true, data: set });
    }

    res.json({
      success: true,
      data: toClientSet(row, placementGoalLabel(row.placementGoal as PlacementGoal)),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = generateSchema.parse(req.body ?? {});
    const date = todayDateString();

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: buildDemoDailyChallengeSet(
          date,
          input.placementGoal ?? "product_company"
        ),
      });
    }

    const ctx = await buildUserChallengeContext(
      req.user!.userId,
      false,
      input.placementGoal,
      input.weakTopics
    );

    const set = await createChallengeSet(req.user!.userId, ctx, input.force ?? true);
    res.status(201).json({ success: true, data: set });
  } catch (e) {
    next(e);
  }
});

router.post("/complete", authenticate, async (req, res, next) => {
  try {
    const input = completeSchema.parse(req.body);

    if (isGuestUser(req)) {
      const demo = buildDemoDailyChallengeSet(todayDateString());
      const ch = demo.challenges.find((c) => c.id === input.challengeId);
      if (!ch) {
        return res.status(404).json({ success: false, error: "Challenge not found" });
      }
      const updated: DailyChallengeItem = {
        ...ch,
        completed: true,
        completedAt: new Date().toISOString(),
        userAnswer: input.answer,
        isCorrect: ch.type === "aptitude" ? input.answer === "Some roses may fade quickly" : true,
        feedback:
          ch.type === "aptitude" && input.answer !== "Some roses may fade quickly"
            ? "Review the explanation and try similar logic puzzles."
            : "Great work! Keep your daily streak going.",
      };
      const completedCount = demo.challenges.filter((c) => c.completed).length + (ch.completed ? 0 : 1);
      const result: CompleteDailyChallengeResult = {
        challenge: updated,
        completedCount: Math.min(completedCount, demo.totalCount),
        totalCount: demo.totalCount,
        completionPercent: Math.round((completedCount / demo.totalCount) * 100),
        isDayComplete: completedCount >= demo.totalCount,
        xpAwarded: 10,
      };
      return res.json({ success: true, data: result });
    }

    const row = await prisma.dailyChallengeSet.findFirst({
      where: { id: input.setId, userId: req.user!.userId },
    });

    if (!row) {
      return res.status(404).json({ success: false, error: "Challenge set not found" });
    }

    const challenges = [...(row.challenges as DailyChallengeItem[])];
    const answerKey = (row.answerKey ?? {}) as Record<string, string>;
    const idx = challenges.findIndex((c) => c.id === input.challengeId);

    if (idx < 0) {
      return res.status(404).json({ success: false, error: "Challenge not found" });
    }

    const current = challenges[idx]!;
    if (current.completed) {
      return res.json({
        success: true,
        data: {
          challenge: stripAnswersForClient([current])[0],
          completedCount: row.completedCount,
          totalCount: row.totalCount,
          completionPercent: Math.round((row.completedCount / row.totalCount) * 100),
          isDayComplete: row.isDayComplete,
          xpAwarded: 0,
        } satisfies CompleteDailyChallengeResult,
      });
    }

    let isCorrect = true;
    let feedback = "Marked complete — nice work!";

    if (current.type === "aptitude") {
      const expected = answerKey[current.id];
      isCorrect = expected ? input.answer?.trim() === expected : !!input.answer?.trim();
      feedback = isCorrect
        ? "Correct! Strong aptitude fundamentals."
        : `Incorrect. The correct answer was: ${expected ?? "see explanation"}.`;
    } else if (current.type === "interview") {
      const len = (input.answer ?? "").trim().length;
      isCorrect = len >= 30;
      feedback = isCorrect
        ? "Solid response length — practice delivering it aloud under 2 minutes."
        : "Expand your answer with a concrete example (STAR format).";
    } else {
      isCorrect = true;
      feedback = "DSA challenge logged. Implement and test on the coding platform when ready.";
    }

    challenges[idx] = {
      ...current,
      completed: true,
      completedAt: new Date().toISOString(),
      userAnswer: input.answer,
      isCorrect,
      feedback,
    };

    const completedCount = challenges.filter((c) => c.completed).length;
    const isDayComplete = completedCount >= row.totalCount;
    let xpAwarded = XP_REWARDS.DAILY_STREAK;
    let totalXp = row.xpEarned + xpAwarded;

    if (isDayComplete && !row.isDayComplete) {
      xpAwarded += XP_REWARDS.APTITUDE_QUIZ;
      totalXp += XP_REWARDS.APTITUDE_QUIZ;
    }

    const updated = await prisma.dailyChallengeSet.update({
      where: { id: row.id },
      data: {
        challenges: challenges as unknown as Prisma.InputJsonValue,
        completedCount,
        isDayComplete,
        xpEarned: totalXp,
      },
    });

    await awardXp(req.user!.userId, xpAwarded, "daily_challenge");
    await updateStreak(req.user!.userId);

    res.json({
      success: true,
      data: {
        challenge: stripAnswersForClient([challenges[idx]!])[0]!,
        completedCount,
        totalCount: updated.totalCount,
        completionPercent: Math.round((completedCount / updated.totalCount) * 100),
        isDayComplete,
        xpAwarded,
      } satisfies CompleteDailyChallengeResult,
    });
  } catch (e) {
    next(e);
  }
});

export default router;

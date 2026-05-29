import { Router } from "express";
import { z } from "zod";
import { prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import {
  codingProblems,
  twoSumProblem,
  reverseListProblem,
} from "../demo/responses.js";
import { submitToJudge0 } from "../services/judge0.js";
import { awardXp, updateStreak } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/problems", async (req, res, next) => {
  try {
    if (req.headers.authorization?.includes("placepro-demo-token")) {
      return res.json({ success: true, data: codingProblems });
    }

    const { category, difficulty, company, page = "1", limit = "20" } = req.query;
    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (company) where.companies = { has: String(company) };

    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const [items, total] = await Promise.all([
      prisma.codingProblem.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          category: true,
          acceptance: true,
          companies: true,
          tags: true,
        },
      }),
      prisma.codingProblem.count({ where }),
    ]);

    res.json({
      success: true,
      data: { items, total, page: pageNum, pageSize: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/problems/:slug", async (req, res, next) => {
  try {
    if (req.headers.authorization?.includes("placepro-demo-token")) {
      const demo = req.params.slug === "two-sum" ? twoSumProblem : reverseListProblem;
      return res.json({ success: true, data: demo });
    }

    const problem = await prisma.codingProblem.findUnique({
      where: { slug: req.params.slug },
      include: {
        testCases: { where: { isHidden: false }, orderBy: { order: "asc" } },
        discussions: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    });
    if (!problem) throw new AppError(404, "Problem not found");
    res.json({ success: true, data: problem });
  } catch (e) {
    next(e);
  }
});

router.post("/run", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: { status: "ACCEPTED", stdout: "Demo output\n[0, 1]", stderr: null, time: 42, memory: 1024 },
      });
    }

    const { code, language, stdin } = z
      .object({
        code: z.string(),
        language: z.enum(["C", "CPP", "JAVA", "PYTHON", "JAVASCRIPT"]),
        stdin: z.string().optional(),
      })
      .parse(req.body);

    const result = await submitToJudge0(code, language, stdin);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

router.post("/submit", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          id: "demo-sub",
          status: "ACCEPTED",
          passedTests: 2,
          totalTests: 2,
          runtime: 42,
          memory: 1024,
        },
      });
    }

    const { problemId, code, language } = z
      .object({
        problemId: z.string(),
        code: z.string(),
        language: z.enum(["C", "CPP", "JAVA", "PYTHON", "JAVASCRIPT"]),
      })
      .parse(req.body);

    const userId = req.user!.userId;
    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId },
      include: { testCases: { orderBy: { order: "asc" } } },
    });
    if (!problem) throw new AppError(404, "Problem not found");

    const submission = await prisma.submission.create({
      data: { userId, problemId, code, language, status: "RUNNING", totalTests: problem.testCases.length },
    });

    let passed = 0;
    let finalStatus = "ACCEPTED";
    let runtime: number | null = null;
    let memory: number | null = null;

    for (const tc of problem.testCases) {
      const result = await submitToJudge0(code, language, tc.input, tc.output);
      if (result.status === "ACCEPTED") {
        passed++;
        runtime = result.time;
        memory = result.memory;
      } else {
        finalStatus = result.status;
        break;
      }
    }

    const updated = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: finalStatus as "ACCEPTED",
        passedTests: passed,
        runtime: runtime ?? undefined,
        memory: memory ?? undefined,
      },
    });

    if (finalStatus === "ACCEPTED") {
      const xp =
        problem.difficulty === "EASY"
          ? XP_REWARDS.PROBLEM_SOLVED_EASY
          : problem.difficulty === "MEDIUM"
            ? XP_REWARDS.PROBLEM_SOLVED_MEDIUM
            : XP_REWARDS.PROBLEM_SOLVED_HARD;
      await awardXp(userId, xp, `solved_${problem.slug}`);
      await updateStreak(userId);
      await prisma.codingProblem.update({
        where: { id: problemId },
        data: { totalSubs: { increment: 1 } },
      });
    }

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
});

router.post("/discussions", authenticate, async (req, res, next) => {
  try {
    const { problemId, content } = z
      .object({ problemId: z.string(), content: z.string().min(10) })
      .parse(req.body);

    const discussion = await prisma.discussion.create({
      data: { problemId, userId: req.user!.userId, content },
      include: { user: { select: { name: true, avatar: true } } },
    });
    res.status(201).json({ success: true, data: discussion });
  } catch (e) {
    next(e);
  }
});

export default router;

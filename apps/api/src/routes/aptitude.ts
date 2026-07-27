import { Router } from "express";
import { z } from "zod";
import { prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { awardXp, updateStreak } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";
import {
  generateAptitudeQuiz,
  generateAptitudeMock,
  generateFullMock,
  getTest,
  submitTest,
  getResult,
  listQuestionBank,
} from "../services/assessmentService.js";
import { scoreAnswers, listQuestionBank } from "../data/aptitudeQuestionBank.js";

const router = Router();

router.get("/questions", async (req, res, next) => {
  try {
    const category = req.query.category as "QUANTITATIVE" | "LOGICAL" | "VERBAL" | undefined;

    if (isGuestFromHeader(req)) {
      return res.json({ success: true, data: listQuestionBank(category) });
    }

    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;
    if (req.query.subCategory) where.subCategory = req.query.subCategory;
    if (req.query.difficulty) where.difficulty = req.query.difficulty;

    const questions = await prisma.aptitudeQuestion.findMany({
      where,
      select: {
        id: true,
        category: true,
        subCategory: true,
        question: true,
        options: true,
        difficulty: true,
      },
    });

    if (questions.length === 0) {
      return res.json({ success: true, data: listQuestionBank(category) });
    }

    res.json({ success: true, data: questions });
  } catch (e) {
    next(e);
  }
});

router.post("/generate", authenticate, async (req, res, next) => {
  try {
    const body = z
      .object({
        type: z.enum(["quiz", "mock", "full_mock"]).default("quiz"),
        category: z.enum(["QUANTITATIVE", "LOGICAL", "VERBAL"]).optional(),
        questionCount: z.number().int().min(5).max(25).optional(),
      })
      .parse(req.body);

    let test;
    if (body.type === "full_mock") {
      test = generateFullMock();
    } else if (body.type === "mock") {
      test = generateAptitudeMock(body.category);
    } else {
      if (!body.category) {
        return res.status(400).json({ success: false, error: "category required for quiz" });
      }
      test = generateAptitudeQuiz(body.category, body.questionCount ?? 10);
    }

    res.status(201).json({ success: true, data: test });
  } catch (e) {
    next(e);
  }
});

router.get("/tests/:testId", authenticate, async (req, res, next) => {
  try {
    const test = getTest(String(req.params.testId));
    if (!test) {
      return res.status(404).json({ success: false, error: "Test not found" });
    }
    res.json({ success: true, data: test });
  } catch (e) {
    next(e);
  }
});

router.get("/quizzes", async (_req, res, next) => {
  try {
    const tests = [
      { id: "quiz-quant", title: "Quantitative Quiz", category: "QUANTITATIVE", duration: 15, questions: 10 },
      { id: "quiz-logical", title: "Logical Reasoning Quiz", category: "LOGICAL", duration: 15, questions: 10 },
      { id: "quiz-verbal", title: "Verbal Ability Quiz", category: "VERBAL", duration: 12, questions: 8 },
      { id: "mock-full", title: "Full Aptitude Mock", category: "ALL", duration: 45, questions: 25 },
    ];
    res.json({ success: true, data: tests });
  } catch (e) {
    next(e);
  }
});

router.post("/submit", authenticate, async (req, res, next) => {
  try {
    const { quizId, testId, answers, timeTakenSeconds } = z
      .object({
        quizId: z.string().optional(),
        testId: z.string().optional(),
        answers: z.record(z.string()),
        timeTakenSeconds: z.number().int().optional(),
      })
      .parse(req.body);

    const id = testId ?? quizId;
    if (id && getTest(id)) {
      const result = submitTest(id, answers, timeTakenSeconds);
      if (result) {
        return res.json({ success: true, data: { ...result, attempt: { id, score: result.score } } });
      }
    }

    if (isGuestUser(req) || isGuestFromHeader(req)) {
      const scored = scoreAnswers(answers);
      return res.json({
        success: true,
        data: {
          attempt: { id: id ?? "guest-attempt", score: scored.score },
          score: scored.score,
          correct: scored.correct,
          total: scored.total,
          results: scored.results,
          weakTopics: scored.weakTopics,
          categoryBreakdown: scored.categoryBreakdown,
        },
      });
    }

    const questionIds = Object.keys(answers);
    const questions = await prisma.aptitudeQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    let correct = 0;
    const results =
      questions.length > 0
        ? questions.map((q) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) correct++;
            return {
              questionId: q.id,
              correct: isCorrect,
              explanation: q.explanation,
              correctAnswer: q.correctAnswer,
            };
          })
        : scoreAnswers(answers).results;

    const score =
      questions.length > 0
        ? (correct / questions.length) * 100
        : scoreAnswers(answers).score;

    const attempt = await prisma.aptitudeAttempt.create({
      data: {
        userId: req.user!.userId,
        quizId,
        answers,
        score,
        timeTaken: timeTakenSeconds,
      },
    });

    await awardXp(req.user!.userId, XP_REWARDS.APTITUDE_QUIZ, "aptitude_quiz");
    await updateStreak(req.user!.userId);

    res.json({ success: true, data: { attempt, score, results } });
  } catch (e) {
    next(e);
  }
});

router.get("/results/:testId", authenticate, async (req, res, next) => {
  try {
    const result = getResult(String(req.params.testId));
    if (!result) {
      return res.status(404).json({ success: false, error: "Result not found" });
    }
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

router.get("/analytics", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: { attempts: [], avgScore: 0, totalAttempts: 0 },
      });
    }

    const attempts = await prisma.aptitudeAttempt.findMany({
      where: { userId: req.user!.userId },
      orderBy: { completedAt: "desc" },
      take: 30,
    });

    const avgScore =
      attempts.length > 0 ? attempts.reduce((s, a) => s + a.score, 0) / attempts.length : 0;

    res.json({
      success: true,
      data: { attempts, avgScore, totalAttempts: attempts.length },
    });
  } catch (e) {
    next(e);
  }
});

function isGuestFromHeader(req: { headers: { authorization?: string } }): boolean {
  return req.headers.authorization?.includes("placepro-demo-token") ?? false;
}

export default router;

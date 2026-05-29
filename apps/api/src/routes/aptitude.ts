import { Router } from "express";
import { z } from "zod";
import { prisma } from "@placepro/database";
import { authenticate } from "../middleware/auth.js";
import { awardXp, updateStreak } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";

const router = Router();

router.get("/questions", async (req, res, next) => {
  try {
    const { category, subCategory, difficulty } = req.query;
    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;
    if (subCategory) where.subCategory = subCategory;
    if (difficulty) where.difficulty = difficulty;

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
    res.json({ success: true, data: questions });
  } catch (e) {
    next(e);
  }
});

router.get("/quizzes", async (_req, res, next) => {
  try {
    const quizzes = await prisma.aptitudeQuiz.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ success: true, data: quizzes });
  } catch (e) {
    next(e);
  }
});

router.post("/submit", authenticate, async (req, res, next) => {
  try {
    const { quizId, answers } = z
      .object({
        quizId: z.string().optional(),
        answers: z.record(z.string()),
      })
      .parse(req.body);

    const questionIds = Object.keys(answers);
    const questions = await prisma.aptitudeQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    let correct = 0;
    const results = questions.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        correct: isCorrect,
        explanation: q.explanation,
        correctAnswer: q.correctAnswer,
      };
    });

    const score = questions.length ? (correct / questions.length) * 100 : 0;

    const attempt = await prisma.aptitudeAttempt.create({
      data: {
        userId: req.user!.userId,
        quizId,
        answers,
        score,
      },
    });

    await awardXp(req.user!.userId, XP_REWARDS.APTITUDE_QUIZ, "aptitude_quiz");
    await updateStreak(req.user!.userId);

    res.json({ success: true, data: { attempt, score, results } });
  } catch (e) {
    next(e);
  }
});

router.get("/analytics", authenticate, async (req, res, next) => {
  try {
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

export default router;

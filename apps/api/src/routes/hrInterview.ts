import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { analyzeHrInterview } from "../services/aiClient.js";
import { computeLocalHrReport, normalizeAiHrReport } from "../services/hrInterviewScoring.js";
import { STANDARD_HR_QUESTIONS } from "../data/hrInterview/questions.js";
import { demoHrReport } from "../demo/hrInterview.js";
import type { HrInterviewAnswer, HrInterviewReport } from "@placepro/shared";
import { awardXp } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";

const router = Router();

const answerSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  answer: z.string().min(10),
});

const bodySchema = z.object({
  action: z.enum(["start", "complete"]).default("complete"),
  sessionId: z.string().optional(),
  targetRole: z.string().default("Software Engineer"),
  companyName: z.string().optional(),
  answers: z.array(answerSchema).optional(),
  duration: z.number().int().optional(),
});

function buildReport(
  answers: HrInterviewAnswer[],
  targetRole: string,
  companyName: string | undefined,
  aiRaw: Record<string, unknown> | null
): HrInterviewReport {
  const local = computeLocalHrReport(answers, targetRole);
  const base = {
    ...local,
    questions: STANDARD_HR_QUESTIONS,
    companyName,
  };
  if (!aiRaw) return base;
  return { ...base, ...normalizeAiHrReport(aiRaw, answers, targetRole, local) };
}

router.get("/questions", authenticate, (_req, res) => {
  res.json({ success: true, data: STANDARD_HR_QUESTIONS });
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({ success: true, data: [demoHrReport] });
    }

    const rows = await prisma.hrMockInterview.findMany({
      where: { userId: req.user!.userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 10,
      select: {
        id: true,
        targetRole: true,
        companyName: true,
        overallScore: true,
        communication: true,
        confidence: true,
        clarity: true,
        professionalism: true,
        completedAt: true,
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
      return res.json({ success: true, data: demoHrReport });
    }

    const row = await prisma.hrMockInterview.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!row || !row.report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    res.json({ success: true, data: row.report });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = bodySchema.parse(req.body);

    if (input.action === "start") {
      if (isGuestUser(req)) {
        return res.status(201).json({
          success: true,
          data: {
            sessionId: "demo-hr-session",
            targetRole: input.targetRole,
            companyName: input.companyName,
            questions: STANDARD_HR_QUESTIONS,
          },
        });
      }

      const session = await prisma.hrMockInterview.create({
        data: {
          userId: req.user!.userId,
          targetRole: input.targetRole,
          companyName: input.companyName,
          questions: STANDARD_HR_QUESTIONS as unknown as Prisma.InputJsonValue,
        },
      });

      return res.status(201).json({
        success: true,
        data: {
          sessionId: session.id,
          targetRole: session.targetRole,
          companyName: session.companyName,
          questions: STANDARD_HR_QUESTIONS,
        },
      });
    }

    const answers: HrInterviewAnswer[] = (input.answers ?? []).map((a) => ({
      questionId: a.questionId,
      question: a.question,
      answer: a.answer,
    }));

    if (answers.length < STANDARD_HR_QUESTIONS.length) {
      return res.status(400).json({
        success: false,
        error: `Please answer all ${STANDARD_HR_QUESTIONS.length} HR questions`,
      });
    }

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          ...demoHrReport,
          answers,
          targetRole: input.targetRole,
          companyName: input.companyName,
        } satisfies HrInterviewReport,
      });
    }

    let aiRaw: Record<string, unknown> | null = null;
    try {
      aiRaw = (await analyzeHrInterview({
        target_role: input.targetRole,
        company_name: input.companyName,
        answers: answers.map((a) => ({
          question_id: a.questionId,
          question: a.question,
          answer: a.answer,
        })),
        duration_seconds: input.duration,
      })) as Record<string, unknown>;
    } catch {
      aiRaw = null;
    }

    const report = buildReport(answers, input.targetRole, input.companyName, aiRaw);

    let record;
    if (input.sessionId) {
      const existing = await prisma.hrMockInterview.findFirst({
        where: { id: input.sessionId, userId: req.user!.userId },
      });
      if (!existing) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }
      record = await prisma.hrMockInterview.update({
        where: { id: existing.id },
        data: {
          answers: answers as unknown as Prisma.InputJsonValue,
          communication: report.scores.communication,
          confidence: report.scores.confidence,
          clarity: report.scores.clarity,
          professionalism: report.scores.professionalism,
          overallScore: report.scores.overall,
          report: { ...report, questions: STANDARD_HR_QUESTIONS } as unknown as Prisma.InputJsonValue,
          duration: input.duration,
          completedAt: new Date(),
        },
      });
    } else {
      record = await prisma.hrMockInterview.create({
        data: {
          userId: req.user!.userId,
          targetRole: input.targetRole,
          companyName: input.companyName,
          questions: STANDARD_HR_QUESTIONS as unknown as Prisma.InputJsonValue,
          answers: answers as unknown as Prisma.InputJsonValue,
          communication: report.scores.communication,
          confidence: report.scores.confidence,
          clarity: report.scores.clarity,
          professionalism: report.scores.professionalism,
          overallScore: report.scores.overall,
          report: { ...report, questions: STANDARD_HR_QUESTIONS } as unknown as Prisma.InputJsonValue,
          duration: input.duration,
          completedAt: new Date(),
        },
      });
    }

    await awardXp(req.user!.userId, XP_REWARDS.MOCK_INTERVIEW, "hr_mock_interview");
    await prisma.studentProfile
      .update({
        where: { userId: req.user!.userId },
        data: { interviewScore: report.scores.overall },
      })
      .catch(() => undefined);

    res.status(201).json({
      success: true,
      data: {
        ...report,
        id: record.id,
        questions: STANDARD_HR_QUESTIONS,
        completedAt: record.completedAt?.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

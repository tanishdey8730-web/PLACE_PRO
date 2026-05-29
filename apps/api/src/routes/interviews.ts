import { Router } from "express";
import { z } from "zod";
import { prisma } from "@placepro/database";
import { authenticate } from "../middleware/auth.js";
import { generateInterviewQuestions, analyzeInterview } from "../services/aiClient.js";
import { awardXp } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";

const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const interviews = await prisma.mockInterview.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: interviews });
  } catch (e) {
    next(e);
  }
});

router.post("/start", authenticate, async (req, res, next) => {
  try {
    const { type, role } = z
      .object({
        type: z.enum(["TECHNICAL", "HR", "BEHAVIORAL"]),
        role: z.string().default("Software Engineer"),
      })
      .parse(req.body);

    let questions;
    try {
      const result = await generateInterviewQuestions(type, role);
      questions = result.questions;
    } catch {
      questions = [
        "Tell me about yourself.",
        "Explain a challenging project you worked on.",
        "How do you handle tight deadlines?",
        "Describe a time you resolved a conflict in a team.",
      ];
    }

    const interview = await prisma.mockInterview.create({
      data: { userId: req.user!.userId, type, questions },
    });

    res.status(201).json({ success: true, data: interview });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/complete", authenticate, async (req, res, next) => {
  try {
    const { transcript, recordingUrl, duration } = req.body;
    const interview = await prisma.mockInterview.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!interview) return res.status(404).json({ success: false, error: "Not found" });

    let feedback;
    try {
      feedback = await analyzeInterview(transcript, interview.type);
    } catch {
      feedback = {
        communication: 75,
        confidence: 70,
        technical_accuracy: 68,
        speech_clarity: 72,
        suggestions: ["Speak more slowly", "Use STAR method for behavioral questions"],
      };
    }

    const updated = await prisma.mockInterview.update({
      where: { id: interview.id },
      data: {
        transcript,
        recordingUrl,
        duration,
        completedAt: new Date(),
        communication: feedback.communication ?? feedback.communication_score,
        confidence: feedback.confidence ?? feedback.confidence_score,
        technicalScore: feedback.technical_accuracy ?? feedback.technicalAccuracy,
        feedback,
      },
    });

    await awardXp(req.user!.userId, XP_REWARDS.MOCK_INTERVIEW, "mock_interview");
    await prisma.studentProfile.update({
      where: { userId: req.user!.userId },
      data: { interviewScore: updated.technicalScore ?? 0 },
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
});

export default router;

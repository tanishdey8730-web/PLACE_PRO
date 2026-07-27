import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import {
  generatePlacementTest,
  generateAptitudeQuiz,
  generateAptitudeMock,
  generateFullMock,
  getTest,
  submitTest,
  getResult,
} from "../services/assessmentService.js";

const router = Router();

const profileSchema = z.object({
  targetRole: z.string().default("Software Engineer"),
  codingLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  monthsToPlacement: z.enum(["< 3", "3-6", "6-12", "12+"]).default("6-12"),
  branch: z.string().optional(),
});

router.post("/generate", authenticate, async (req, res, next) => {
  try {
    const body = z
      .object({
        type: z.enum(["PLACEMENT_READINESS", "APTITUDE_QUIZ", "APTITUDE_MOCK", "FULL_MOCK"]),
        category: z.enum(["QUANTITATIVE", "LOGICAL", "VERBAL"]).optional(),
        questionCount: z.number().int().min(5).max(30).optional(),
        profile: profileSchema.optional(),
      })
      .parse(req.body);

    let test;
    switch (body.type) {
      case "PLACEMENT_READINESS":
        test = generatePlacementTest(
          body.profile ?? {
            targetRole: "Software Engineer",
            codingLevel: "Beginner",
            monthsToPlacement: "6-12",
          }
        );
        break;
      case "APTITUDE_QUIZ":
        if (!body.category) {
          return res.status(400).json({ success: false, error: "category required for quiz" });
        }
        test = generateAptitudeQuiz(body.category, body.questionCount ?? 10);
        break;
      case "APTITUDE_MOCK":
        test = generateAptitudeMock(body.category);
        break;
      case "FULL_MOCK":
        test = generateFullMock();
        break;
    }

    res.status(201).json({ success: true, data: test });
  } catch (e) {
    next(e);
  }
});

router.post("/start-placement", authenticate, async (req, res, next) => {
  try {
    const profile = profileSchema.parse(req.body);
    const test = generatePlacementTest(profile);
    res.status(201).json({ success: true, data: test });
  } catch (e) {
    next(e);
  }
});

router.get("/tests/:testId", authenticate, async (req, res, next) => {
  try {
    const test = getTest(String(req.params.testId));
    if (!test) {
      return res.status(404).json({ success: false, error: "Test not found or expired" });
    }
    res.json({ success: true, data: test });
  } catch (e) {
    next(e);
  }
});

router.post("/submit", authenticate, async (req, res, next) => {
  try {
    const { testId, answers, timeTakenSeconds } = z
      .object({
        testId: z.string(),
        answers: z.record(z.string()),
        timeTakenSeconds: z.number().int().optional(),
      })
      .parse(req.body);

    const result = submitTest(testId, answers, timeTakenSeconds);
    if (!result) {
      return res.status(404).json({ success: false, error: "Test not found or expired" });
    }

    res.json({ success: true, data: result });
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

export default router;

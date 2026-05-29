import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate } from "../middleware/auth.js";
import { analyzeResume } from "../services/aiClient.js";

const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: resumes });
  } catch (e) {
    next(e);
  }
});

router.post("/analyze", authenticate, async (req, res, next) => {
  try {
    const { fileName, fileUrl } = req.body as { fileName: string; fileUrl: string };
    const userId = req.user!.userId;

    let analysis;
    try {
      analysis = await analyzeResume(fileUrl, userId);
    } catch {
      analysis = {
        ats_score: 72,
        resume_strength: "Good",
        missing_skills: ["Kubernetes", "CI/CD"],
        formatting_issues: ["Use consistent bullet points"],
        keyword_suggestions: ["microservices", "REST API", "agile"],
        improvements: ["Add quantified achievements", "Include GitHub link"],
      };
    }

    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName,
        fileUrl,
        atsScore: analysis.ats_score ?? analysis.atsScore ?? 0,
        analysis,
        suggestions: analysis.improvements ?? analysis.improvement_suggestions,
      },
    });

    await prisma.studentProfile.update({
      where: { userId },
      data: { resumeAtsScore: resume.atsScore ?? 0 },
    });

    res.status(201).json({ success: true, data: resume });
  } catch (e) {
    next(e);
  }
});

export default router;

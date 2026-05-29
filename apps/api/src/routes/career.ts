import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate } from "../middleware/auth.js";
import { generateCareerPlan } from "../services/aiClient.js";

const router = Router();

router.post("/plan", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const profile = {
      skills: user?.skills,
      college: user?.college,
      scores: user?.profile,
      target_role: req.body.targetRole || "Software Engineer",
    };

    let plan;
    try {
      plan = await generateCareerPlan(profile);
    } catch {
      plan = {
        career_path: req.body.targetRole || "Software Engineer",
        learning_plan: [
          { week: 1, focus: "Arrays & Strings", hours: 10 },
          { week: 2, focus: "Linked Lists & Trees", hours: 12 },
          { week: 3, focus: "Dynamic Programming", hours: 15 },
          { week: 4, focus: "System Design basics", hours: 10 },
        ],
        certifications: ["AWS Cloud Practitioner", "Google IT Support"],
        recommended_companies: ["Google", "Microsoft", "Amazon", "Flipkart"],
        strengths: ["Problem solving", "Quick learner"],
        improvements: ["System design", "Behavioral interviews"],
      };
    }

    await prisma.careerPlan.create({
      data: { userId, path: plan.career_path, plan },
    });

    res.json({ success: true, data: plan });
  } catch (e) {
    next(e);
  }
});

export default router;

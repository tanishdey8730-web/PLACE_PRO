import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { dashboardStats } from "../demo/responses.js";

const router = Router();

router.get("/stats", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({ success: true, data: dashboardStats });
    }

    const userId = req.user!.userId;
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    const streak = await prisma.streak.findUnique({ where: { userId } });

    const [recentSubs, upcomingContests, recommendations] = await Promise.all([
      prisma.submission.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { problem: { select: { title: true, slug: true } } },
      }),
      prisma.contest.findMany({
        where: { endTime: { gt: new Date() }, isActive: true },
        take: 3,
        orderBy: { startTime: "asc" },
      }),
      prisma.codingProblem.findMany({
        where: { isPublished: true },
        take: 5,
        orderBy: { acceptance: "asc" },
      }),
    ]);

    res.json({
      success: true,
      data: {
        placementReadiness: profile?.placementReadiness ?? 0,
        codingScore: profile?.codingScore ?? 0,
        aptitudeScore: profile?.aptitudeScore ?? 0,
        interviewScore: profile?.interviewScore ?? 0,
        resumeAtsScore: profile?.resumeAtsScore ?? 0,
        totalXp: profile?.totalXp ?? 0,
        level: profile?.level ?? 1,
        dailyStreak: streak?.currentStreak ?? 0,
        recentActivity: recentSubs,
        upcomingTests: upcomingContests,
        practiceRecommendations: recommendations,
        aiInsights: [
          "Focus on Dynamic Programming — your weakest topic.",
          "Complete 2 mock interviews this week to boost readiness.",
          "Your resume ATS score can improve with more action verbs.",
        ],
        skillGaps: ["Graphs", "Dynamic Programming", "System Design"],
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

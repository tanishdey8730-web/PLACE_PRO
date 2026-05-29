import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/analytics", async (_req, res, next) => {
  try {
    const [users, problems, jobs, activeContests, subscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.codingProblem.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.contest.count({ where: { isActive: true } }),
      prisma.subscription.count({ where: { isActive: true, plan: { not: "FREE" } } }),
    ]);

    const students = await prisma.user.count({ where: { role: "STUDENT" } });
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({
      success: true,
      data: {
        totalUsers: users,
        students,
        codingProblems: problems,
        activeJobs: jobs,
        activeContests,
        premiumSubscriptions: subscriptions,
        estimatedRevenue: subscriptions * 999,
        recentUsers,
        placementStats: { placed: 847, interviewing: 234, preparing: students },
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json({ success: true, data: users });
  } catch (e) {
    next(e);
  }
});

export default router;

import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const contests = await prisma.contest.findMany({
      where: { isActive: true },
      orderBy: { startTime: "desc" },
      include: { _count: { select: { entries: true } } },
    });
    res.json({ success: true, data: contests });
  } catch (e) {
    next(e);
  }
});

router.get("/:id/leaderboard", async (req, res, next) => {
  try {
    const entries = await prisma.contestEntry.findMany({
      where: { contestId: req.params.id },
      orderBy: { score: "desc" },
      take: 100,
      include: { user: { select: { name: true, avatar: true } } },
    });
    res.json({ success: true, data: entries });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/join", authenticate, async (req, res, next) => {
  try {
    const entry = await prisma.contestEntry.upsert({
      where: {
        contestId_userId: { contestId: req.params.id, userId: req.user!.userId },
      },
      update: {},
      create: { contestId: req.params.id, userId: req.user!.userId },
    });
    res.status(201).json({ success: true, data: entry });
  } catch (e) {
    next(e);
  }
});

export default router;

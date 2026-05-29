import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { guestUser } from "../demo/responses.js";

const router = Router();

router.get("/me", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({ success: true, data: guestUser });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        profile: true,
        streak: true,
        badges: { include: { badge: true } },
        xpLogs: { take: 10, orderBy: { createdAt: "desc" } },
      },
    });
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

router.patch("/me", authenticate, async (req, res, next) => {
  try {
    const { name, bio, college, skills, githubUrl, linkedinUrl, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, bio, college, skills, githubUrl, linkedinUrl, avatar },
    });
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

export default router;

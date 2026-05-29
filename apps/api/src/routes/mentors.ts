import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const mentors = await prisma.mentorProfile.findMany({
      where: { isVerified: true },
      include: { user: { select: { name: true, avatar: true, email: true } } },
      orderBy: { rating: "desc" },
    });
    res.json({ success: true, data: mentors });
  } catch (e) {
    next(e);
  }
});

router.post("/book", authenticate, async (req, res, next) => {
  try {
    const { mentorId, scheduledAt, topic, duration } = req.body;
    const mentor = await prisma.mentorProfile.findUnique({ where: { id: mentorId } });
    const booking = await prisma.mentorBooking.create({
      data: {
        mentorId,
        studentId: req.user!.userId,
        scheduledAt: new Date(scheduledAt),
        topic,
        duration: duration || 60,
        meetUrl: mentor?.meetLink || mentor?.zoomLink,
      },
    });
    res.status(201).json({ success: true, data: booking });
  } catch (e) {
    next(e);
  }
});

export default router;

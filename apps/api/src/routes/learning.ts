import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate } from "../middleware/auth.js";
import { awardXp } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";

const router = Router();

router.get("/courses", async (_req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: { _count: { select: { lessons: true } } },
    });
    res.json({ success: true, data: courses });
  } catch (e) {
    next(e);
  }
});

router.get("/courses/:slug", async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: { lessons: { orderBy: { order: "asc" } } },
    });
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    res.json({ success: true, data: course });
  } catch (e) {
    next(e);
  }
});

router.post("/progress", authenticate, async (req, res, next) => {
  try {
    const { courseId, lessonId, completed } = req.body as {
      courseId: string;
      lessonId: string;
      completed: number;
    };

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { lessons: true } } },
    });
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });

    const progress = await prisma.courseProgress.upsert({
      where: {
        userId_courseId: { userId: req.user!.userId, courseId },
      },
      update: { completed, lastLessonId: lessonId, total: course._count.lessons },
      create: {
        userId: req.user!.userId,
        courseId,
        completed,
        total: course._count.lessons,
        lastLessonId: lessonId,
      },
    });

    await awardXp(req.user!.userId, XP_REWARDS.COURSE_LESSON, "lesson_complete");
    res.json({ success: true, data: progress });
  } catch (e) {
    next(e);
  }
});

export default router;

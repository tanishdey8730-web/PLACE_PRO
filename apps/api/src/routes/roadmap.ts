import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma, RoadmapSkillLevel, RoadmapCategory } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { generatePlacementRoadmap } from "../services/aiClient.js";
import { demoRoadmapRecord } from "../demo/roadmap.js";
const router = Router();

interface RoadmapDailyTask {
  id: string;
  day: number;
  category: string;
}

interface PlacementRoadmapPlan {
  daily_tasks: RoadmapDailyTask[];
  [key: string]: unknown;
}

const generateSchema = z.object({
  branch: z.string().min(1),
  graduationYear: z.number().int().min(2020).max(2035),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  targetCompanies: z.array(z.string()).default([]),
  studyHoursPerDay: z.number().int().min(1).max(16),
});

function normalizePlan(plan: PlacementRoadmapPlan): PlacementRoadmapPlan {
  const tasks = plan.daily_tasks ?? [];
  const normalizedTasks = tasks.map((task, index) => ({
    ...task,
    id: task.id || `day-${task.day ?? index + 1}`,
  }));
  return { ...plan, daily_tasks: normalizedTasks };
}

function computeProgress(plan: PlacementRoadmapPlan, completedKeys: Set<string>): number {
  const total = plan.daily_tasks?.length ?? 0;
  if (total === 0) return 0;
  const done = plan.daily_tasks.filter((t) => completedKeys.has(t.id)).length;
  return Math.round((done / total) * 1000) / 10;
}

function serializeRoadmap(
  roadmap: {
    id: string;
    userId: string;
    branch: string;
    graduationYear: number;
    skillLevel: RoadmapSkillLevel;
    targetCompanies: string[];
    studyHoursPerDay: number;
    plan: unknown;
    progressPercent: number;
    adaptiveNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    completedTasks?: { taskKey: string; category: RoadmapCategory | null; completedAt: Date }[];
  }
) {
  const tasks = roadmap.completedTasks ?? [];
  return {
    id: roadmap.id,
    userId: roadmap.userId,
    branch: roadmap.branch,
    graduationYear: roadmap.graduationYear,
    skillLevel: roadmap.skillLevel,
    targetCompanies: roadmap.targetCompanies,
    studyHoursPerDay: roadmap.studyHoursPerDay,
    plan: roadmap.plan,
    progressPercent: roadmap.progressPercent,
    adaptiveNotes: roadmap.adaptiveNotes,
    createdAt: roadmap.createdAt.toISOString(),
    updatedAt: roadmap.updatedAt.toISOString(),
    completedTasks: tasks.map((t) => ({
      taskKey: t.taskKey,
      category: t.category,
      completedAt: t.completedAt.toISOString(),
    })),
  };
}

router.post("/generate", authenticate, async (req, res, next) => {
  try {
    const input = generateSchema.parse(req.body);
    const userId = req.user!.userId;

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          ...demoRoadmapRecord,
          branch: input.branch,
          graduationYear: input.graduationYear,
          skillLevel: input.skillLevel,
          targetCompanies: input.targetCompanies.length
            ? input.targetCompanies
            : demoRoadmapRecord.targetCompanies,
          studyHoursPerDay: input.studyHoursPerDay,
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { college: true, skills: true },
    });

    let plan: PlacementRoadmapPlan;
    try {
      plan = normalizePlan(
        (await generatePlacementRoadmap({
          branch: input.branch,
          graduationYear: input.graduationYear,
          skillLevel: input.skillLevel,
          targetCompanies: input.targetCompanies,
          studyHoursPerDay: input.studyHoursPerDay,
          college: user?.college,
          skills: user?.skills,
        })) as PlacementRoadmapPlan
      );
    } catch {
      const { demoRoadmapPlan } = await import("../demo/roadmap.js");
      plan = normalizePlan(demoRoadmapPlan as PlacementRoadmapPlan);
      if (input.targetCompanies.length) {
        plan.target_companies = input.targetCompanies;
      }
    }

    const roadmap = await prisma.placementRoadmap.create({
      data: {
        userId,
        branch: input.branch,
        graduationYear: input.graduationYear,
        skillLevel: input.skillLevel as RoadmapSkillLevel,
        targetCompanies: input.targetCompanies,
        studyHoursPerDay: input.studyHoursPerDay,
        plan: plan as Prisma.InputJsonValue,
        progressPercent: 0,
      },
      include: { completedTasks: true },
    });

    res.status(201).json({ success: true, data: serializeRoadmap(roadmap) });
  } catch (e) {
    next(e);
  }
});

router.get("/:userId", authenticate, async (req, res, next) => {
  try {
    const userId = String(req.params.userId);
    const requesterId = req.user!.userId;

    if (userId !== requesterId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    if (isGuestUser(req)) {
      return res.json({ success: true, data: demoRoadmapRecord });
    }

    const roadmap = await prisma.placementRoadmap.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { completedTasks: true },
    });

    if (!roadmap) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: serializeRoadmap(roadmap) });
  } catch (e) {
    next(e);
  }
});

router.post("/:roadmapId/tasks/:taskKey/complete", authenticate, async (req, res, next) => {
  try {
    const roadmapId = String(req.params.roadmapId);
    const taskKey = String(req.params.taskKey);
    const userId = req.user!.userId;
    const category = req.body?.category as RoadmapCategory | undefined;

    if (isGuestUser(req)) {
      const completed = new Set(demoRoadmapRecord.completedTasks.map((t) => t.taskKey));
      if (!completed.has(taskKey)) {
        demoRoadmapRecord.completedTasks.push({
          taskKey,
          category: category ?? null,
          completedAt: new Date().toISOString(),
        });
      }
      const plan = demoRoadmapRecord.plan as PlacementRoadmapPlan;
      const keys = new Set(demoRoadmapRecord.completedTasks.map((t) => t.taskKey));
      demoRoadmapRecord.progressPercent = computeProgress(plan, keys);
      return res.json({ success: true, data: demoRoadmapRecord });
    }

    const roadmap = await prisma.placementRoadmap.findFirst({
      where: { id: roadmapId, userId },
      include: { completedTasks: true },
    });
    if (!roadmap) {
      return res.status(404).json({ success: false, error: "Roadmap not found" });
    }

    await prisma.roadmapTaskCompletion.upsert({
      where: { roadmapId_taskKey: { roadmapId, taskKey } },
      create: {
        roadmapId,
        taskKey,
        ...(category ? { category } : {}),
      },
      update: { completedAt: new Date(), ...(category ? { category } : {}) },
    });

    const plan = roadmap.plan as PlacementRoadmapPlan;
    const completedKeys = new Set([
      ...roadmap.completedTasks.map((t) => t.taskKey),
      taskKey,
    ]);
    const progressPercent = computeProgress(plan, completedKeys);

    const updated = await prisma.placementRoadmap.update({
      where: { id: roadmapId },
      data: { progressPercent },
      include: { completedTasks: true },
    });

    res.json({ success: true, data: serializeRoadmap(updated) });
  } catch (e) {
    next(e);
  }
});

export default router;

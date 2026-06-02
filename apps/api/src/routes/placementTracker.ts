import { Router } from "express";
import { z } from "zod";
import { prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import type { PlacementTrackerEntry, PlacementTrackerStage } from "@placepro/shared";
import { PLACEMENT_TRACKER_STAGES } from "@placepro/shared";
import { buildBoard, demoPlacementEntries } from "../demo/placementTracker.js";
import { randomBytes } from "crypto";

const router = Router();

const STAGES = PLACEMENT_TRACKER_STAGES.map((s) => s.id);

function mapEntry(row: {
  id: string;
  companyName: string;
  role: string;
  location: string | null;
  jobType: string | null;
  stage: PlacementTrackerStage;
  appliedAt: Date;
  nextEventAt: Date | null;
  notes: string | null;
  salaryOffer: string | null;
  updatedAt: Date;
}): PlacementTrackerEntry {
  return {
    id: row.id,
    companyName: row.companyName,
    role: row.role,
    location: row.location,
    jobType: row.jobType,
    stage: row.stage,
    appliedAt: row.appliedAt.toISOString(),
    nextEventAt: row.nextEventAt?.toISOString() ?? null,
    notes: row.notes,
    salaryOffer: row.salaryOffer,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const createSchema = z.object({
  companyName: z.string().min(1),
  role: z.string().min(1),
  location: z.string().optional(),
  jobType: z.string().optional(),
  stage: z.enum(STAGES as [PlacementTrackerStage, ...PlacementTrackerStage[]]).optional(),
  appliedAt: z.string().optional(),
  nextEventAt: z.string().optional(),
  notes: z.string().optional(),
  salaryOffer: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({
  stage: z.enum(STAGES as [PlacementTrackerStage, ...PlacementTrackerStage[]]).optional(),
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({ success: true, data: buildBoard(demoPlacementEntries) });
    }

    const rows = await prisma.placementApplication.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: "desc" },
    });

    res.json({
      success: true,
      data: buildBoard(rows.map(mapEntry)),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = createSchema.parse(req.body);

    if (isGuestUser(req)) {
      const entry: PlacementTrackerEntry = {
        id: `pt-${randomBytes(3).toString("hex")}`,
        companyName: input.companyName,
        role: input.role,
        location: input.location,
        jobType: input.jobType,
        stage: input.stage ?? "APPLIED",
        appliedAt: input.appliedAt ?? new Date().toISOString(),
        nextEventAt: input.nextEventAt ?? null,
        notes: input.notes,
        salaryOffer: input.salaryOffer,
        updatedAt: new Date().toISOString(),
      };
      demoPlacementEntries.unshift(entry);
      return res.status(201).json({
        success: true,
        data: buildBoard(demoPlacementEntries),
      });
    }

    const row = await prisma.placementApplication.create({
      data: {
        userId: req.user!.userId,
        companyName: input.companyName,
        role: input.role,
        location: input.location,
        jobType: input.jobType,
        stage: input.stage ?? "APPLIED",
        appliedAt: input.appliedAt ? new Date(input.appliedAt) : undefined,
        nextEventAt: input.nextEventAt ? new Date(input.nextEventAt) : undefined,
        notes: input.notes,
        salaryOffer: input.salaryOffer,
      },
    });

    const all = await prisma.placementApplication.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: "desc" },
    });

    res.status(201).json({
      success: true,
      data: buildBoard(all.map(mapEntry)),
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const input = updateSchema.parse(req.body);

    if (isGuestUser(req)) {
      const idx = demoPlacementEntries.findIndex((e) => e.id === id);
      if (idx < 0) throw new AppError(404, "Application not found");
      demoPlacementEntries[idx] = {
        ...demoPlacementEntries[idx]!,
        ...input,
        stage: input.stage ?? demoPlacementEntries[idx]!.stage,
        updatedAt: new Date().toISOString(),
      };
      return res.json({
        success: true,
        data: buildBoard(demoPlacementEntries),
      });
    }

    const existing = await prisma.placementApplication.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!existing) throw new AppError(404, "Application not found");

    await prisma.placementApplication.update({
      where: { id },
      data: {
        companyName: input.companyName,
        role: input.role,
        location: input.location,
        jobType: input.jobType,
        stage: input.stage,
        appliedAt: input.appliedAt ? new Date(input.appliedAt) : undefined,
        nextEventAt: input.nextEventAt ? new Date(input.nextEventAt) : null,
        notes: input.notes,
        salaryOffer: input.salaryOffer,
      },
    });

    const all = await prisma.placementApplication.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: "desc" },
    });

    res.json({
      success: true,
      data: buildBoard(all.map(mapEntry)),
    });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    if (isGuestUser(req)) {
      const next = demoPlacementEntries.filter((e) => e.id !== id);
      demoPlacementEntries.splice(0, demoPlacementEntries.length, ...next);
      return res.json({
        success: true,
        data: buildBoard(demoPlacementEntries),
      });
    }

    const existing = await prisma.placementApplication.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!existing) throw new AppError(404, "Application not found");

    await prisma.placementApplication.delete({ where: { id } });

    const all = await prisma.placementApplication.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: "desc" },
    });

    res.json({
      success: true,
      data: buildBoard(all.map(mapEntry)),
    });
  } catch (e) {
    next(e);
  }
});

export default router;

import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { analyzeSystemDesign } from "../services/aiClient.js";
import {
  computeLocalSystemDesignReport,
  normalizeAiSystemDesign,
} from "../services/systemDesignScoring.js";
import { SYSTEM_DESIGN_TOPICS, getSystemDesignTopic } from "../data/systemDesign/topics.js";
import { demoSystemDesignReport } from "../demo/systemDesign.js";
import type { SystemDesignReport, SystemDesignTopicId } from "@placepro/shared";
import { awardXp } from "../services/gamification.js";
import { XP_REWARDS } from "@placepro/shared";

const router = Router();

const bodySchema = z.object({
  action: z.enum(["start", "evaluate"]).default("evaluate"),
  topicId: z.enum(["instagram", "whatsapp", "uber", "youtube"]),
  design: z.string().optional(),
  sessionId: z.string().optional(),
  duration: z.number().int().optional(),
});

function buildReport(
  topicId: SystemDesignTopicId,
  design: string,
  aiRaw: Record<string, unknown> | null
): SystemDesignReport {
  const topic = getSystemDesignTopic(topicId)!;
  const local = computeLocalSystemDesignReport(topic, design);
  const merged = aiRaw ? { ...local, ...normalizeAiSystemDesign(aiRaw, local) } : local;
  return merged;
}

router.get("/topics", authenticate, (_req, res) => {
  res.json({ success: true, data: SYSTEM_DESIGN_TOPICS });
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: [
          {
            id: demoSystemDesignReport.id,
            topicId: demoSystemDesignReport.topicId,
            topicTitle: demoSystemDesignReport.topicTitle,
            overallScore: demoSystemDesignReport.scores.overall,
            completedAt: new Date().toISOString(),
          },
        ],
      });
    }

    const rows = await prisma.systemDesignSession.findMany({
      where: { userId: req.user!.userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 10,
      select: {
        id: true,
        topicId: true,
        topicTitle: true,
        overallScore: true,
        scalability: true,
        architecture: true,
        completedAt: true,
      },
    });

    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    if (isGuestUser(req)) {
      return res.json({ success: true, data: demoSystemDesignReport });
    }

    const row = await prisma.systemDesignSession.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!row?.report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    res.json({ success: true, data: row.report });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = bodySchema.parse(req.body);
    const topic = getSystemDesignTopic(input.topicId);

    if (!topic) {
      return res.status(400).json({ success: false, error: "Invalid topic" });
    }

    if (input.action === "start") {
      if (isGuestUser(req)) {
        return res.status(201).json({
          success: true,
          data: {
            sessionId: "demo-system-design",
            topic,
          },
        });
      }

      const session = await prisma.systemDesignSession.create({
        data: {
          userId: req.user!.userId,
          topicId: topic.id,
          topicTitle: topic.title,
          design: "",
        },
      });

      return res.status(201).json({
        success: true,
        data: { sessionId: session.id, topic },
      });
    }

    const design = (input.design ?? "").trim();
    if (design.length < 80) {
      return res.status(400).json({
        success: false,
        error: "Please write at least 80 characters describing your system design",
      });
    }

    if (isGuestUser(req)) {
      let report: SystemDesignReport;
      try {
        const aiRaw = (await analyzeSystemDesign({
          topic_id: topic.id,
          topic_title: topic.title,
          design,
          scale_hint: topic.scaleHint,
          discussion_points: topic.discussionPoints,
        })) as Record<string, unknown>;
        report = buildReport(topic.id, design, aiRaw);
      } catch {
        report = buildReport(topic.id, design, null);
      }
      return res.json({
        success: true,
        data: {
          ...report,
          id: demoSystemDesignReport.id,
        },
      });
    }

    let aiRaw: Record<string, unknown> | null = null;
    try {
      aiRaw = (await analyzeSystemDesign({
        topic_id: topic.id,
        topic_title: topic.title,
        design,
        scale_hint: topic.scaleHint,
        discussion_points: topic.discussionPoints,
      })) as Record<string, unknown>;
    } catch {
      aiRaw = null;
    }

    const report = buildReport(topic.id, design, aiRaw);

    let record;
    if (input.sessionId) {
      const existing = await prisma.systemDesignSession.findFirst({
        where: { id: input.sessionId, userId: req.user!.userId },
      });
      if (!existing) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }
      record = await prisma.systemDesignSession.update({
        where: { id: existing.id },
        data: {
          design: design.slice(0, 100000),
          scalability: report.scores.scalability,
          architecture: report.scores.architecture,
          databaseDesign: report.scores.databaseDesign,
          caching: report.scores.caching,
          security: report.scores.security,
          overallScore: report.scores.overall,
          report: report as unknown as Prisma.InputJsonValue,
          duration: input.duration,
          completedAt: new Date(),
        },
      });
    } else {
      record = await prisma.systemDesignSession.create({
        data: {
          userId: req.user!.userId,
          topicId: topic.id,
          topicTitle: topic.title,
          design: design.slice(0, 100000),
          scalability: report.scores.scalability,
          architecture: report.scores.architecture,
          databaseDesign: report.scores.databaseDesign,
          caching: report.scores.caching,
          security: report.scores.security,
          overallScore: report.scores.overall,
          report: report as unknown as Prisma.InputJsonValue,
          duration: input.duration,
          completedAt: new Date(),
        },
      });
    }

    await awardXp(req.user!.userId, XP_REWARDS.MOCK_INTERVIEW, "system_design");

    res.status(201).json({
      success: true,
      data: {
        ...report,
        id: record.id,
        completedAt: record.completedAt?.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

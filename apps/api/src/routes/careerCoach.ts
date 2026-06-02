import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { callCareerCoach } from "../services/aiClient.js";
import { demoInsights, getDemoChatReply, demoSessionMessages } from "../demo/careerCoach.js";
import type { CareerCoachInsights, CareerCoachMessage } from "@placepro/shared";

const router = Router();

const contextSchema = z.object({
  branch: z.string().optional(),
  graduationYear: z.number().optional(),
  skills: z.array(z.string()).optional(),
  college: z.string().optional(),
});

const bodySchema = z.object({
  action: z.enum(["chat", "insights", "new_session"]).default("chat"),
  sessionId: z.string().optional(),
  message: z.string().optional(),
  targetRole: z.string().default("Software Engineer"),
  context: contextSchema.optional(),
});

function normalizeInsights(raw: Record<string, unknown>): CareerCoachInsights {
  const path = (raw.learning_path ?? raw.learningPath) as
    | { phase?: string; focus?: string; hours_per_week?: number; hoursPerWeek?: number }[]
    | undefined;

  return {
    careerGuidance: String(raw.career_guidance ?? raw.careerGuidance ?? ""),
    skillRecommendations: (raw.skill_recommendations ?? raw.skillRecommendations ?? []) as string[],
    technologyRecommendations: (raw.technology_recommendations ??
      raw.technologyRecommendations ??
      []) as string[],
    learningPath: (path ?? []).map((p) => ({
      phase: String(p.phase ?? ""),
      focus: String(p.focus ?? ""),
      hoursPerWeek: Number(p.hours_per_week ?? p.hoursPerWeek ?? 0),
    })),
    placementStrategy: (raw.placement_strategy ?? raw.placementStrategy ?? []) as string[],
    currentSkillsAssessed: (raw.current_skills_assessed ?? raw.currentSkillsAssessed ?? []) as string[],
  };
}

router.get("/sessions", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: [{ id: "demo-session", title: "Career coaching", targetRole: "Software Engineer", updatedAt: new Date().toISOString() }],
      });
    }

    const sessions = await prisma.careerCoachSession.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, title: true, targetRole: true, updatedAt: true },
    });

    res.json({
      success: true,
      data: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        targetRole: s.targetRole,
        updatedAt: s.updatedAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/sessions/:sessionId", authenticate, async (req, res, next) => {
  try {
    const sessionId = String(req.params.sessionId);

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          id: "demo-session",
          targetRole: "Software Engineer",
          insights: demoInsights,
          messages: demoSessionMessages,
        },
      });
    }

    const session = await prisma.careerCoachSession.findFirst({
      where: { id: sessionId, userId: req.user!.userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    res.json({
      success: true,
      data: {
        id: session.id,
        title: session.title,
        targetRole: session.targetRole,
        insights: session.insights,
        messages: session.messages.map((m) => ({
          id: m.id,
          role: m.role.toLowerCase() as "user" | "assistant",
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = bodySchema.parse(req.body);
    const userId = req.user!.userId;

    if (input.action === "new_session") {
      if (isGuestUser(req)) {
        return res.status(201).json({
          success: true,
          data: { sessionId: "demo-session", insights: demoInsights, messages: demoSessionMessages },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { skills: true, college: true, graduationYear: true },
      });

      const ctx = {
        branch: input.context?.branch ?? "Computer Science",
        graduation_year: input.context?.graduationYear ?? user?.graduationYear,
        skills: input.context?.skills ?? user?.skills,
        college: input.context?.college ?? user?.college,
      };

      let insights = demoInsights;
      try {
        const raw = (await callCareerCoach({
          action: "insights",
          target_role: input.targetRole,
          context: ctx,
        })) as Record<string, unknown>;
        insights = normalizeInsights(raw);
      } catch {
        insights = demoInsights;
      }

      const session = await prisma.careerCoachSession.create({
        data: {
          userId,
          targetRole: input.targetRole,
          title: `${input.targetRole} coaching`,
          insights: insights as unknown as Prisma.InputJsonValue,
          messages: {
            create: {
              role: "ASSISTANT",
              content:
                `Hi! I'm your AI Career Coach for **${input.targetRole}** placements. ` +
                `I've prepared personalized insights on the right — ask me anything about skills, tech stack, learning path, or placement strategy.`,
            },
          },
        },
        include: { messages: true },
      });

      return res.status(201).json({
        success: true,
        data: {
          sessionId: session.id,
          insights,
          messages: session.messages.map((m) => ({
            id: m.id,
            role: m.role.toLowerCase() as "user" | "assistant",
            content: m.content,
            createdAt: m.createdAt.toISOString(),
          })),
        },
      });
    }

    if (input.action === "insights") {
      if (isGuestUser(req)) {
        return res.json({ success: true, data: demoInsights });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { skills: true, college: true, graduationYear: true },
      });

      try {
        const raw = (await callCareerCoach({
          action: "insights",
          target_role: input.targetRole,
          context: {
            branch: input.context?.branch,
            graduation_year: input.context?.graduationYear ?? user?.graduationYear,
            skills: input.context?.skills ?? user?.skills,
            college: input.context?.college ?? user?.college,
          },
        })) as Record<string, unknown>;
        return res.json({ success: true, data: normalizeInsights(raw) });
      } catch {
        return res.json({ success: true, data: demoInsights });
      }
    }

    const message = input.message?.trim();
    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required for chat" });
    }

    if (isGuestUser(req)) {
      const reply = getDemoChatReply(message);
      return res.json({
        success: true,
        data: {
          sessionId: input.sessionId ?? "demo-session",
          reply,
          message: {
            id: `demo-${Date.now()}`,
            role: "assistant" as const,
            content: reply,
            createdAt: new Date().toISOString(),
          },
        },
      });
    }

    let sessionId = input.sessionId;
    let history: { role: string; content: string }[] = [];

    if (sessionId) {
      const existing = await prisma.careerCoachSession.findFirst({
        where: { id: sessionId, userId },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
      });
      if (!existing) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }
      history = existing.messages.map((m) => ({
        role: m.role === "USER" ? "user" : "assistant",
        content: m.content,
      }));
    } else {
      const session = await prisma.careerCoachSession.create({
        data: {
          userId,
          targetRole: input.targetRole,
          title: `${input.targetRole} coaching`,
        },
      });
      sessionId = session.id;
    }

    await prisma.careerCoachMessage.create({
      data: { sessionId: sessionId!, role: "USER", content: message },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true, college: true, graduationYear: true },
    });

    let reply: string;
    try {
      const raw = (await callCareerCoach({
        action: "chat",
        message,
        target_role: input.targetRole,
        history,
        context: {
          branch: input.context?.branch,
          graduation_year: input.context?.graduationYear ?? user?.graduationYear,
          skills: input.context?.skills ?? user?.skills,
          college: input.context?.college ?? user?.college,
        },
      })) as { reply?: string };
      reply = raw.reply ?? getDemoChatReply(message);
    } catch {
      reply = getDemoChatReply(message);
    }

    const assistantMsg = await prisma.careerCoachMessage.create({
      data: { sessionId: sessionId!, role: "ASSISTANT", content: reply },
    });

    await prisma.careerCoachSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        sessionId,
        reply,
        message: {
          id: assistantMsg.id,
          role: "assistant" as const,
          content: reply,
          createdAt: assistantMsg.createdAt.toISOString(),
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

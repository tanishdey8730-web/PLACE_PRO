import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { callResumeBuilder } from "../services/aiClient.js";
import { computeLocalScores, normalizeAiScores } from "../services/resumeScoring.js";
import { exportResumeDocx, exportResumePdf } from "../services/resumeExport.js";
import { demoResumeContent, demoScores } from "../demo/resumeBuilder.js";
import { fromPrismaTemplate, toPrismaTemplate } from "../data/resumeBuilder/templates.js";
import type { ResumeContent, ResumeBuilderResponse } from "@placepro/shared";

const router = Router();

const personalSchema = z.object({
  fullName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  summary: z.string().optional(),
});

const contentSchema = z.object({
  personal: personalSchema,
  skills: z.array(z.string()).default([]),
  education: z
    .array(
      z.object({
        school: z.string(),
        degree: z.string(),
        year: z.string(),
        gpa: z.string().optional(),
      })
    )
    .default([]),
  experience: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        start: z.string(),
        end: z.string(),
        bullets: z.array(z.string()),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        tech: z.string(),
        bullets: z.array(z.string()),
        link: z.string().optional(),
      })
    )
    .default([]),
  internships: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        start: z.string(),
        end: z.string(),
        bullets: z.array(z.string()),
      })
    )
    .default([]),
  achievements: z.array(z.string()).default([]),
});

const bodySchema = z.object({
  action: z.enum(["build", "generate", "score", "export"]).default("build"),
  template: z.enum(["ats", "professional", "modern"]).default("ats"),
  title: z.string().optional(),
  targetRole: z.string().default("Software Engineer"),
  content: contentSchema.optional(),
  generateSection: z
    .enum(["projects", "internships", "achievements", "skills", "summary"])
    .optional(),
  context: z.record(z.unknown()).optional(),
  exportFormat: z.enum(["pdf", "docx"]).optional(),
});

async function scoreContent(
  content: ResumeContent,
  template: string,
  targetRole: string
): Promise<ReturnType<typeof normalizeAiScores>> {
  try {
    const raw = (await callResumeBuilder({
      action: "score",
      template,
      target_role: targetRole,
      content,
    })) as Record<string, unknown>;
    return normalizeAiScores(raw);
  } catch {
    return computeLocalScores(content, targetRole);
  }
}

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: [
          {
            id: "demo-resume",
            title: "My Resume",
            template: "ats",
            atsScore: demoScores.atsScore,
            qualityScore: demoScores.qualityScore,
            updatedAt: new Date().toISOString(),
          },
        ],
      });
    }

    const docs = await prisma.resumeBuilderDocument.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        template: true,
        atsScore: true,
        qualityScore: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: docs.map((d) => ({
        id: d.id,
        title: d.title,
        template: fromPrismaTemplate(d.template),
        atsScore: d.atsScore,
        qualityScore: d.qualityScore,
        updatedAt: d.updatedAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = bodySchema.parse(req.body);
    const content = (input.content ?? demoResumeContent) as ResumeContent;

    if (input.action === "export") {
      const format = input.exportFormat ?? "pdf";
      const buffer =
        format === "docx"
          ? await exportResumeDocx(content, input.template)
          : await exportResumePdf(content, input.template);
      const base64 = buffer.toString("base64");
      const fileName = `${content.personal.fullName || "resume"}.${format}`;
      return res.json({
        success: true,
        data: { format, fileName, base64, mimeType: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      });
    }

    if (input.action === "generate" && input.generateSection) {
      let generated: Record<string, unknown> = {};
      try {
        generated = (await callResumeBuilder({
          action: "generate",
          template: input.template,
          target_role: input.targetRole,
          generate_section: input.generateSection,
          content,
          context: input.context,
        })) as Record<string, unknown>;
      } catch {
        const section = input.generateSection;
        if (section === "skills") generated = { skills: demoResumeContent.skills };
        if (section === "achievements") generated = { achievements: demoResumeContent.achievements };
        if (section === "projects") generated = { projects: demoResumeContent.projects };
        if (section === "internships") generated = { internships: demoResumeContent.internships };
        if (section === "summary")
          generated = { personal: { summary: demoResumeContent.personal.summary } };
      }

      return res.json({
        success: true,
        data: {
          generated,
          section: input.generateSection,
        },
      });
    }

    if (input.action === "score" || input.action === "build") {
      const scores =
        isGuestUser(req) && input.action === "build"
          ? demoScores
          : await scoreContent(content, input.template, input.targetRole);

      if (input.action === "score") {
        return res.json({
          success: true,
          data: {
            title: input.title ?? "My Resume",
            template: input.template,
            content,
            scores,
          } satisfies ResumeBuilderResponse,
        });
      }

      if (isGuestUser(req)) {
        return res.json({
          success: true,
          data: {
            id: "demo-resume",
            title: input.title ?? "My Resume",
            template: input.template,
            content,
            scores,
          } satisfies ResumeBuilderResponse,
        });
      }

      const doc = await prisma.resumeBuilderDocument.create({
        data: {
          userId: req.user!.userId,
          title: input.title ?? "My Resume",
          template: toPrismaTemplate(input.template),
          content: content as unknown as Prisma.InputJsonValue,
          atsScore: scores.atsScore,
          qualityScore: scores.qualityScore,
        },
      });

      await prisma.studentProfile
        .update({
          where: { userId: req.user!.userId },
          data: { resumeAtsScore: scores.atsScore },
        })
        .catch(() => undefined);

      return res.status(201).json({
        success: true,
        data: {
          id: doc.id,
          title: doc.title,
          template: input.template,
          content,
          scores,
        } satisfies ResumeBuilderResponse,
      });
    }

    res.status(400).json({ success: false, error: "Invalid action" });
  } catch (e) {
    next(e);
  }
});

export default router;

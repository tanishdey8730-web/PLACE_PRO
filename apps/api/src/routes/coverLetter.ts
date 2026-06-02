import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { generateCoverLetter } from "../services/aiClient.js";
import { normalizeCoverLetterResponse } from "../services/coverLetterNormalize.js";
import { exportCoverLetterDocx, exportCoverLetterPdf } from "../services/coverLetterExport.js";
import { demoCoverLetterResult } from "../demo/coverLetter.js";
import { toPrismaCoverTemplate } from "../data/coverLetter/templates.js";
import type {
  CoverLetterContent,
  CoverLetterGenerateResult,
  CoverLetterTemplateId,
} from "@placepro/shared";

const router = Router();

const bodySchema = z.object({
  action: z.enum(["generate", "export"]).default("generate"),
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  resume: z.string().min(10),
  skills: z.array(z.string()).default([]),
  template: z.enum(["professional", "modern", "formal", "concise"]).default("professional"),
  documentType: z
    .enum(["cover_letter", "internship_application", "referral_request", "hr_follow_up", "all"])
    .default("all"),
  applicantName: z.string().default("Applicant"),
  exportFormat: z.enum(["pdf", "docx"]).optional(),
  exportDocument: z
    .enum(["cover_letter", "internship_application", "referral_request", "hr_follow_up"])
    .optional(),
  content: z
    .object({
      subject: z.string(),
      salutation: z.string(),
      body: z.string(),
      closing: z.string(),
      signature: z.string(),
    })
    .optional(),
});

const DOC_KEYS: Record<string, keyof CoverLetterGenerateResult["documents"]> = {
  cover_letter: "coverLetter",
  internship_application: "internshipApplication",
  referral_request: "referralRequest",
  hr_follow_up: "hrFollowUp",
};

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({ success: true, data: [demoCoverLetterResult] });
    }

    const rows = await prisma.coverLetterDocument.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        companyName: r.companyName,
        jobTitle: r.jobTitle,
        template: r.template,
        documents: r.documents,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = bodySchema.parse(req.body);

    if (input.action === "export") {
      const docKey = input.exportDocument ?? "cover_letter";
      const contentKey = DOC_KEYS[docKey];
      let letterContent: CoverLetterContent;

      if (input.content) {
        letterContent = input.content;
      } else if (isGuestUser(req)) {
        letterContent = demoCoverLetterResult.documents[contentKey];
      } else {
        const latest = await prisma.coverLetterDocument.findFirst({
          where: {
            userId: req.user!.userId,
            companyName: input.companyName,
          },
          orderBy: { updatedAt: "desc" },
        });
        const docs = latest?.documents as CoverLetterGenerateResult["documents"] | undefined;
        letterContent = docs?.[contentKey] ?? demoCoverLetterResult.documents[contentKey];
      }

      const format = input.exportFormat ?? "pdf";
      const meta = { companyName: input.companyName, jobTitle: input.jobTitle };
      const buffer =
        format === "docx"
          ? await exportCoverLetterDocx(letterContent, meta)
          : await exportCoverLetterPdf(letterContent, meta);

      const safeName = input.companyName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      return res.json({
        success: true,
        data: {
          format,
          fileName: `${docKey}_${safeName}.${format}`,
          base64: buffer.toString("base64"),
          mimeType:
            format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      });
    }

    const template = input.template as CoverLetterTemplateId;
    const fallback: CoverLetterGenerateResult = {
      ...demoCoverLetterResult,
      companyName: input.companyName,
      jobTitle: input.jobTitle,
      template,
    };

    let result: CoverLetterGenerateResult;

    if (isGuestUser(req)) {
      result = fallback;
    } else {
      try {
        const raw = (await generateCoverLetter({
          company_name: input.companyName,
          job_title: input.jobTitle,
          resume: input.resume,
          skills: input.skills,
          template: input.template,
          document_type: input.documentType,
          applicant_name: input.applicantName,
        })) as Record<string, unknown>;
        result = normalizeCoverLetterResponse(
          raw,
          {
            companyName: input.companyName,
            jobTitle: input.jobTitle,
            template,
            applicantName: input.applicantName,
          },
          fallback
        );
      } catch {
        result = fallback;
      }

      const record = await prisma.coverLetterDocument.create({
        data: {
          userId: req.user!.userId,
          companyName: input.companyName,
          jobTitle: input.jobTitle,
          template: toPrismaCoverTemplate(template),
          documents: result.documents as unknown as Prisma.InputJsonValue,
        },
      });
      result.id = record.id;
      result.createdAt = record.createdAt.toISOString();
    }

    if (input.documentType !== "all") {
      const key = DOC_KEYS[input.documentType];
      const single = result.documents[key];
      return res.status(201).json({
        success: true,
        data: {
          ...result,
          document: single,
          documentType: input.documentType,
        },
      });
    }

    res.status(201).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

export default router;

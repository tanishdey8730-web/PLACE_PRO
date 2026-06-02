import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { predictSalary } from "../services/aiClient.js";
import {
  computeLocalSalaryPrediction,
  normalizeAiSalaryPrediction,
} from "../services/salaryPredictorScoring.js";
import { demoSalaryPrediction } from "../demo/salaryPredictor.js";
import type {
  SalaryCompanyType,
  SalaryPredictorHistoryItem,
  SalaryPredictorInput,
  SalaryPredictorResult,
} from "@placepro/shared";

const router = Router();

const COMPANY_TYPES = [
  "PRODUCT",
  "SERVICE",
  "STARTUP",
  "FAANG",
  "MNC",
  "CONSULTING",
] as const;

const bodySchema = z.object({
  skills: z.array(z.string()).default([]),
  experienceYears: z.number().min(0).max(40),
  experience: z.string().optional(),
  location: z.string().min(1),
  companyType: z.enum(COMPANY_TYPES),
  role: z.string().optional(),
});

function parseExperienceYears(years: number, experience?: string): number {
  if (years > 0) return years;
  if (!experience) return 0;
  const lower = experience.toLowerCase();
  if (lower.includes("fresher") || lower.includes("0")) return 0;
  const match = lower.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function toInput(parsed: z.infer<typeof bodySchema>): SalaryPredictorInput {
  return {
    skills: parsed.skills,
    experienceYears: parseExperienceYears(parsed.experienceYears, parsed.experience),
    location: parsed.location,
    companyType: parsed.companyType as SalaryCompanyType,
    role: parsed.role,
  };
}

router.get("/history", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: [
          {
            id: "demo-salary",
            role: demoSalaryPrediction.inputs.role,
            location: demoSalaryPrediction.inputs.location,
            companyType: demoSalaryPrediction.inputs.companyType,
            medianLpa: demoSalaryPrediction.salaryRange.medianLpa,
            createdAt: new Date().toISOString(),
          },
        ] satisfies SalaryPredictorHistoryItem[],
      });
    }

    const rows = await prisma.salaryPrediction.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        role: true,
        location: true,
        companyType: true,
        medianLpa: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        role: r.role,
        location: r.location,
        companyType: r.companyType as SalaryCompanyType,
        medianLpa: r.medianLpa,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const parsed = bodySchema.parse(req.body);
    const input = toInput(parsed);

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          ...demoSalaryPrediction,
          inputs: { ...demoSalaryPrediction.inputs, ...input },
          id: "demo-salary",
          createdAt: new Date().toISOString(),
        },
      });
    }

    const local = computeLocalSalaryPrediction(input);
    let result: SalaryPredictorResult = local;

    try {
      const raw = (await predictSalary({
        skills: input.skills,
        experience_years: input.experienceYears,
        location: input.location,
        company_type: input.companyType,
        role: input.role ?? "Software Engineer",
      })) as Record<string, unknown>;
      result = normalizeAiSalaryPrediction(raw, input);
    } catch {
      result = local;
    }

    const record = await prisma.salaryPrediction.create({
      data: {
        userId: req.user!.userId,
        skills: input.skills,
        experienceYears: input.experienceYears,
        location: input.location,
        companyType: input.companyType,
        role: input.role,
        minLpa: result.salaryRange.minLpa,
        maxLpa: result.salaryRange.maxLpa,
        medianLpa: result.salaryRange.medianLpa,
        result: result as unknown as Prisma.InputJsonValue,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...result,
        id: record.id,
        createdAt: record.createdAt.toISOString(),
      } satisfies SalaryPredictorResult,
    });
  } catch (e) {
    next(e);
  }
});

export default router;

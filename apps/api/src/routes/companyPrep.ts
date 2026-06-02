import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import {
  COMPANY_SLUGS,
  getCompanyPrep,
  computePrepProgress,
} from "../data/companyPrep/index.js";
import {
  getGuestCompanyProgress,
  getGuestTrackerOverview,
  toggleGuestSection,
} from "../demo/companyPrep.js";

const router = Router();

function buildResponse(
  company: NonNullable<ReturnType<typeof getCompanyPrep>>,
  progress: { completedSections: string[]; progressPercent: number; readinessScore: number }
) {
  return {
    ...company,
    progress,
  };
}

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({ success: true, data: getGuestTrackerOverview() });
    }

    const userId = req.user!.userId;
    const records = await prisma.companyPrepProgress.findMany({
      where: { userId },
    });
    const bySlug = new Map(records.map((r) => [r.companySlug, r]));

    const data = COMPANY_SLUGS.map((slug) => {
      const company = getCompanyPrep(slug)!;
      const record = bySlug.get(slug);
      return {
        slug,
        name: company.name,
        logoColor: company.logoColor,
        tier: company.tier,
        difficulty: company.profile.difficulty,
        progressPercent: record?.progressPercent ?? 0,
        readinessScore: record?.readinessScore ?? 0,
      };
    });

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/:company", authenticate, async (req, res, next) => {
  try {
    const slug = String(req.params.company).toLowerCase();
    const company = getCompanyPrep(slug);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: `Company not found. Available: ${COMPANY_SLUGS.join(", ")}`,
      });
    }

    if (isGuestUser(req)) {
      const guestProgress = getGuestCompanyProgress(company.slug)!;
      return res.json({ success: true, data: buildResponse(company, guestProgress) });
    }

    const userId = req.user!.userId;
    let record = await prisma.companyPrepProgress.findUnique({
      where: { userId_companySlug: { userId, companySlug: company.slug } },
    });

    if (!record) {
      record = await prisma.companyPrepProgress.create({
        data: {
          userId,
          companySlug: company.slug,
          completedSections: [],
          progressPercent: 0,
          readinessScore: 0,
        },
      });
    }

    res.json({
      success: true,
      data: buildResponse(company, {
        completedSections: record.completedSections,
        progressPercent: record.progressPercent,
        readinessScore: record.readinessScore,
      }),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/:company/sections/:sectionId/complete", authenticate, async (req, res, next) => {
  try {
    const slug = String(req.params.company).toLowerCase();
    const sectionId = String(req.params.sectionId);
    const company = getCompanyPrep(slug);

    if (!company) {
      return res.status(404).json({ success: false, error: "Company not found" });
    }

    if (!company.prepChecklist.some((c) => c.id === sectionId)) {
      return res.status(400).json({ success: false, error: "Invalid checklist section" });
    }

    if (isGuestUser(req)) {
      toggleGuestSection(company.slug, sectionId);
      return res.json({
        success: true,
        data: buildResponse(company, getGuestCompanyProgress(company.slug)!),
      });
    }

    const userId = req.user!.userId;
    let record = await prisma.companyPrepProgress.findUnique({
      where: { userId_companySlug: { userId, companySlug: company.slug } },
    });

    const completed = new Set(record?.completedSections ?? []);
    completed.add(sectionId);
    const completedSections = [...completed];
    const { progressPercent, readinessScore } = computePrepProgress(
      company.prepChecklist,
      completedSections
    );

    record = await prisma.companyPrepProgress.upsert({
      where: { userId_companySlug: { userId, companySlug: company.slug } },
      create: {
        userId,
        companySlug: company.slug,
        completedSections,
        progressPercent,
        readinessScore,
      },
      update: {
        completedSections,
        progressPercent,
        readinessScore,
      },
    });

    res.json({
      success: true,
      data: buildResponse(company, {
        completedSections: record.completedSections,
        progressPercent: record.progressPercent,
        readinessScore: record.readinessScore,
      }),
    });
  } catch (e) {
    next(e);
  }
});

export default router;

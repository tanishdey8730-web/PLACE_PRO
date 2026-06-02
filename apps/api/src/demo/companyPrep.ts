import { COMPANY_SLUGS, getCompanyPrep, computePrepProgress } from "../data/companyPrep/index.js";

export const guestCompleted: Record<string, string[]> = {
  google: ["dsa-arrays", "dsa-trees", "apt-quant", "hr-behavioral"],
  amazon: ["dsa-arrays", "apt-quant"],
  tcs: ["apt-quant", "apt-logical", "hr-intro", "mock-aptitude"],
};

export function toggleGuestSection(slug: string, sectionId: string) {
  if (!guestCompleted[slug]) guestCompleted[slug] = [];
  const list = guestCompleted[slug];
  const idx = list.indexOf(sectionId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(sectionId);
}

export function getGuestCompanyProgress(slug: string) {
  const company = getCompanyPrep(slug);
  if (!company) return null;
  const completedSections = guestCompleted[slug] ?? [];
  const { progressPercent, readinessScore } = computePrepProgress(
    company.prepChecklist,
    completedSections
  );
  return { completedSections, progressPercent, readinessScore };
}

export function getGuestTrackerOverview() {
  return COMPANY_SLUGS.map((slug) => {
    const company = getCompanyPrep(slug)!;
    const progress = getGuestCompanyProgress(slug)!;
    return {
      slug,
      name: company.name,
      logoColor: company.logoColor,
      tier: company.tier,
      difficulty: company.profile.difficulty,
      progressPercent: progress.progressPercent,
      readinessScore: progress.readinessScore,
    };
  });
}

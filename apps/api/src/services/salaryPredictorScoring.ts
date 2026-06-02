import type {
  GrowthPotential,
  MarketInsight,
  SalaryCompanyType,
  SalaryPredictorInput,
  SalaryPredictorResult,
  SalaryRange,
} from "@placepro/shared";

function locationMultiplier(location: string): number {
  const loc = location.toLowerCase();
  if (/bangalore|bengaluru|mumbai|hyderabad|gurgaon|gurugram|noida/.test(loc)) return 1;
  if (/pune|chennai|delhi/.test(loc)) return 0.92;
  if (/remote|us|usa|europe|uk/.test(loc)) return 1.15;
  return 0.85;
}

function companyMultiplier(companyType: SalaryCompanyType): number {
  const map: Record<SalaryCompanyType, number> = {
    FAANG: 1.45,
    PRODUCT: 1.2,
    STARTUP: 1.05,
    MNC: 1.1,
    CONSULTING: 1.15,
    SERVICE: 0.75,
  };
  return map[companyType] ?? 1;
}

const HOT_SKILLS = [
  "aws",
  "kubernetes",
  "system design",
  "machine learning",
  "react",
  "python",
  "java",
  "golang",
  "typescript",
];

export function computeLocalSalaryPrediction(input: SalaryPredictorInput): SalaryPredictorResult {
  const hotCount = input.skills.filter((s) =>
    HOT_SKILLS.some((h) => s.toLowerCase().includes(h))
  ).length;

  const skillBonus = Math.min(8, input.skills.length * 0.4) + Math.min(4, hotCount * 0.6);
  let base = 3.5 + input.experienceYears * 1.8 + skillBonus;
  base *= locationMultiplier(input.location);
  base *= companyMultiplier(input.companyType);

  if (input.experienceYears < 1) {
    base = Math.max(3, Math.min(base, 12));
  }

  const medianLpa = Math.round(base * 10) / 10;
  const spread = Math.max(1.2, medianLpa * 0.18);
  const salaryRange: SalaryRange = {
    minLpa: Math.round(Math.max(2.5, medianLpa - spread) * 10) / 10,
    maxLpa: Math.round((medianLpa + spread * 1.2) * 10) / 10,
    medianLpa,
    currency: "INR",
    period: "annual",
  };

  let growthScore = Math.min(
    95,
    45 + input.experienceYears * 4 + input.skills.length * 2 + hotCount * 5
  );
  if (input.companyType === "FAANG") growthScore = Math.min(98, growthScore + 10);
  if (input.companyType === "SERVICE") growthScore = Math.max(35, growthScore - 15);

  const growthPotential: GrowthPotential = {
    score: Math.round(growthScore),
    outlook:
      growthScore >= 75
        ? "Strong upside with role switches and equity in high-growth companies."
        : growthScore >= 55
          ? "Moderate growth via promotions and targeted upskilling."
          : "Steady increments; prioritize high-demand skills for the next compensation jump.",
    factors: [
      `${input.experienceYears} year(s) of experience`,
      `Company type: ${input.companyType}`,
      `Location: ${input.location}`,
      hotCount >= 2
        ? "In-demand skills improve negotiation leverage"
        : "Add cloud, DSA, or system design depth to accelerate growth",
    ],
    fiveYearProjection: {
      minLpa: Math.round(medianLpa * 1.6 * 10) / 10,
      maxLpa: Math.round(salaryRange.maxLpa * 2.2 * 10) / 10,
    },
  };

  const marketInsights: MarketInsight[] = [
    {
      title: `${input.location} hiring trends`,
      description: `${input.role ?? "Software"} roles in ${input.location} remain active for candidates with ${input.skills.slice(0, 3).join(", ") || "core engineering"} skills.`,
      trend: ["FAANG", "PRODUCT", "STARTUP"].includes(input.companyType) ? "up" : "stable",
    },
    {
      title: `${input.companyType} pay bands`,
      description:
        input.companyType === "SERVICE"
          ? "IT services packages cluster around campus medians with faster hiring volume."
          : "Product and FAANG tiers offer higher fixed + variable components for strong DSA profiles.",
      trend: "stable",
    },
    {
      title: "Skill market premium",
      description: `Profiles listing ${input.skills.length} relevant skills typically command higher offers than baseline peers.`,
      trend: hotCount >= 2 ? "up" : "stable",
    },
  ];

  return {
    inputs: input,
    salaryRange,
    marketInsights,
    growthPotential,
  };
}

export function normalizeAiSalaryPrediction(
  raw: Record<string, unknown>,
  input: SalaryPredictorInput
): SalaryPredictorResult {
  const local = computeLocalSalaryPrediction(input);
  const rangeRaw = (raw.salary_range ?? raw.salaryRange) as Record<string, unknown> | undefined;

  const salaryRange: SalaryRange = rangeRaw
    ? {
        minLpa: Number(rangeRaw.min_lpa ?? rangeRaw.minLpa ?? local.salaryRange.minLpa),
        maxLpa: Number(rangeRaw.max_lpa ?? rangeRaw.maxLpa ?? local.salaryRange.maxLpa),
        medianLpa: Number(rangeRaw.median_lpa ?? rangeRaw.medianLpa ?? local.salaryRange.medianLpa),
        currency: String(rangeRaw.currency ?? "INR"),
        period: "annual",
      }
    : local.salaryRange;

  const insightsRaw =
    (raw.market_insights as Record<string, unknown>[] | undefined) ??
    (raw.marketInsights as Record<string, unknown>[] | undefined) ??
    [];

  const marketInsights: MarketInsight[] =
    insightsRaw.length > 0
      ? insightsRaw.map((i) => ({
          title: String(i.title ?? ""),
          description: String(i.description ?? ""),
          trend: (i.trend as MarketInsight["trend"]) ?? "stable",
        }))
      : local.marketInsights;

  const growthRaw = (raw.growth_potential ?? raw.growthPotential) as
    | Record<string, unknown>
    | undefined;
  const proj = growthRaw?.five_year_projection ?? growthRaw?.fiveYearProjection;

  const growthPotential: GrowthPotential = growthRaw
    ? {
        score: Number(growthRaw.score ?? local.growthPotential.score),
        outlook: String(growthRaw.outlook ?? local.growthPotential.outlook),
        factors: (growthRaw.factors ?? local.growthPotential.factors) as string[],
        fiveYearProjection: proj
          ? {
              minLpa: Number(
                (proj as Record<string, unknown>).min_lpa ??
                  (proj as Record<string, unknown>).minLpa
              ),
              maxLpa: Number(
                (proj as Record<string, unknown>).max_lpa ??
                  (proj as Record<string, unknown>).maxLpa
              ),
            }
          : local.growthPotential.fiveYearProjection,
      }
    : local.growthPotential;

  return {
    inputs: input,
    salaryRange,
    marketInsights,
    growthPotential,
  };
}

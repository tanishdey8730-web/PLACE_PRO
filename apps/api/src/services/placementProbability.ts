import type { PlacementProbabilityInput, PlacementProbabilityResult, CompanyProbability } from "@placepro/shared";

const COMPANIES: {
  name: string;
  slug: string;
  tier: "Product" | "Service";
  weights: { dsa: number; aptitude: number; cgpa: number; resume: number; projects: number; certs: number };
  difficulty: number;
}[] = [
  { name: "Google", slug: "google", tier: "Product", weights: { dsa: 0.4, aptitude: 0.15, cgpa: 0.1, resume: 0.2, projects: 0.1, certs: 0.05 }, difficulty: 0.92 },
  { name: "Amazon", slug: "amazon", tier: "Product", weights: { dsa: 0.35, aptitude: 0.15, cgpa: 0.1, resume: 0.2, projects: 0.12, certs: 0.08 }, difficulty: 0.88 },
  { name: "Microsoft", slug: "microsoft", tier: "Product", weights: { dsa: 0.32, aptitude: 0.15, cgpa: 0.12, resume: 0.2, projects: 0.12, certs: 0.09 }, difficulty: 0.82 },
  { name: "Meta", slug: "meta", tier: "Product", weights: { dsa: 0.38, aptitude: 0.12, cgpa: 0.1, resume: 0.2, projects: 0.12, certs: 0.08 }, difficulty: 0.9 },
  { name: "Adobe", slug: "adobe", tier: "Product", weights: { dsa: 0.3, aptitude: 0.15, cgpa: 0.12, resume: 0.22, projects: 0.13, certs: 0.08 }, difficulty: 0.75 },
  { name: "Atlassian", slug: "atlassian", tier: "Product", weights: { dsa: 0.3, aptitude: 0.14, cgpa: 0.12, resume: 0.22, projects: 0.14, certs: 0.08 }, difficulty: 0.72 },
  { name: "TCS", slug: "tcs", tier: "Service", weights: { dsa: 0.15, aptitude: 0.3, cgpa: 0.25, resume: 0.15, projects: 0.1, certs: 0.05 }, difficulty: 0.35 },
  { name: "Infosys", slug: "infosys", tier: "Service", weights: { dsa: 0.14, aptitude: 0.28, cgpa: 0.26, resume: 0.16, projects: 0.1, certs: 0.06 }, difficulty: 0.38 },
  { name: "Wipro", slug: "wipro", tier: "Service", weights: { dsa: 0.12, aptitude: 0.3, cgpa: 0.28, resume: 0.15, projects: 0.1, certs: 0.05 }, difficulty: 0.32 },
  { name: "Accenture", slug: "accenture", tier: "Service", weights: { dsa: 0.14, aptitude: 0.28, cgpa: 0.24, resume: 0.18, projects: 0.1, certs: 0.06 }, difficulty: 0.4 },
];

function clamp(n: number, min = 0, max = 100): number {
  return Math.round(Math.min(max, Math.max(min, n)) * 10) / 10;
}

function cgpaToScore(cgpa: number): number {
  if (cgpa <= 10) return clamp((cgpa / 10) * 100);
  return clamp(cgpa);
}

function projectScore(count: number): number {
  if (count >= 4) return 95;
  if (count >= 3) return 85;
  if (count >= 2) return 72;
  if (count >= 1) return 55;
  return 30;
}

function certScore(count: number): number {
  if (count >= 4) return 90;
  if (count >= 2) return 75;
  if (count >= 1) return 60;
  return 35;
}

function readinessLevel(p: number): PlacementProbabilityResult["readinessLevel"] {
  if (p >= 75) return "Strong";
  if (p >= 55) return "Good";
  if (p >= 35) return "Moderate";
  return "Low";
}

export function computePlacementProbability(input: PlacementProbabilityInput): PlacementProbabilityResult {
  const cgpaNorm = cgpaToScore(input.cgpa);
  const dsa = clamp(input.dsaScore);
  const aptitude = clamp(input.aptitudeScore);
  const resume = clamp(input.resumeScore);
  const projects = projectScore(input.projects);
  const certifications = certScore(input.certifications);

  const overallRaw =
    cgpaNorm * 0.12 +
    dsa * 0.32 +
    aptitude * 0.22 +
    resume * 0.22 +
    projects * 0.08 +
    certifications * 0.04;

  const companyProbabilities: CompanyProbability[] = COMPANIES.map((co) => {
    const w = co.weights;
    const fit =
      cgpaNorm * w.cgpa +
      dsa * w.dsa +
      aptitude * w.aptitude +
      resume * w.resume +
      projects * w.projects +
      certifications * w.certs;

    const adjusted = fit * (1 - co.difficulty * 0.45) + fit * 0.55;
    const probability = clamp(adjusted);
    return {
      company: co.name,
      slug: co.slug,
      probability,
      tier: co.tier,
    };
  }).sort((a, b) => b.probability - a.probability);

  const overallProbability = clamp(
    companyProbabilities.reduce((s, c) => s + c.probability, 0) / companyProbabilities.length
  );

  const suggestions: string[] = [];
  if (dsa < 70) suggestions.push("Raise DSA score to 75+ — focus on trees, graphs, and DP (critical for product companies).");
  if (aptitude < 65) suggestions.push("Practice 30+ aptitude mocks weekly to lift probability at TCS, Infosys, and Accenture.");
  if (resume < 75) suggestions.push("Improve resume ATS score with quantified bullets and role-specific keywords.");
  if (input.cgpa < 7.5 && input.cgpa <= 10) suggestions.push("Highlight projects and skills to offset CGPA below 7.5 for screening filters.");
  if (input.projects < 2) suggestions.push("Add at least 2 portfolio projects with measurable impact to boost product company odds.");
  if (input.certifications < 1) suggestions.push("Earn 1–2 certifications (AWS, Google Cloud, or domain-specific) for resume differentiation.");
  if (dsa >= 75 && aptitude >= 70) suggestions.push("You are competitive for service majors — parallel apply while targeting product firms.");
  if (suggestions.length === 0) {
    suggestions.push("Maintain mock interview cadence and apply company-specific prep from Company Prep module.");
  }

  return {
    overallProbability,
    readinessLevel: readinessLevel(overallProbability),
    companyProbabilities,
    improvementSuggestions: suggestions.slice(0, 6),
    scoreBreakdown: {
      cgpa: cgpaNorm,
      dsa,
      aptitude,
      resume,
      projects,
      certifications,
    },
  };
}

export function normalizeAiPlacementResult(
  raw: Record<string, unknown>,
  input: PlacementProbabilityInput,
  fallback: PlacementProbabilityResult
): PlacementProbabilityResult {
  const overall = Number(raw.overall_probability ?? raw.overallProbability ?? fallback.overallProbability);
  const companiesRaw = (raw.company_probabilities ?? raw.companyProbabilities) as
    | { company: string; probability: number; slug?: string; tier?: string }[]
    | undefined;

  let companyProbabilities = fallback.companyProbabilities;
  if (Array.isArray(companiesRaw) && companiesRaw.length > 0) {
    companyProbabilities = companiesRaw.map((c) => {
      const match = COMPANIES.find((x) => x.name.toLowerCase() === c.company?.toLowerCase());
      return {
        company: c.company,
        slug: c.slug ?? match?.slug ?? c.company.toLowerCase(),
        probability: clamp(Number(c.probability)),
        tier: (c.tier as "Product" | "Service") ?? match?.tier ?? "Product",
      };
    });
  }

  const suggestions =
    (raw.improvement_suggestions as string[]) ??
    (raw.improvementSuggestions as string[]) ??
    fallback.improvementSuggestions;

  return {
    overallProbability: clamp(overall),
    readinessLevel: readinessLevel(clamp(overall)),
    companyProbabilities,
    improvementSuggestions: suggestions,
    scoreBreakdown: fallback.scoreBreakdown,
  };
}

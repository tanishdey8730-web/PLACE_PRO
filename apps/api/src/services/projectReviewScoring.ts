import type {
  GitHubRepoContext,
} from "./githubRepo.js";
import type {
  ProjectReviewDimension,
  ProjectReviewDimensionFeedback,
  ProjectReviewReport,
  ProjectReviewScores,
} from "@placepro/shared";

function clamp(n: number): number {
  return Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
}

const DIMENSION_LABELS: Record<ProjectReviewDimension, string> = {
  codeQuality: "Code Quality",
  architecture: "Architecture",
  documentation: "Documentation",
  resumeWorthiness: "Resume Worthiness",
};

export function computeLocalProjectReview(
  ctx: GitHubRepoContext,
  repoUrl: string
): Omit<ProjectReviewReport, "id" | "createdAt"> {
  let codeQuality = 55;
  let architecture = 55;
  let documentation = 50;
  let resumeWorthiness = 50;

  if (ctx.hasTests) codeQuality += 15;
  if (ctx.hasCi) codeQuality += 10;
  if (ctx.license) codeQuality += 5;
  if (Object.keys(ctx.languages).length >= 2) architecture += 8;

  const srcDirs = ctx.rootFiles.some((f) =>
    /^(src|app|lib|packages|backend|frontend|server|client)\/?$/i.test(f)
  );
  if (srcDirs) architecture += 12;
  if (ctx.rootFiles.some((f) => /docker/i.test(f))) architecture += 8;

  const readmeLen = ctx.readme.trim().length;
  if (readmeLen > 500) documentation += 25;
  else if (readmeLen > 150) documentation += 12;
  if (ctx.description) documentation += 8;
  if (ctx.hasContributing) documentation += 10;
  if (ctx.readme.toLowerCase().includes("## install")) documentation += 5;
  if (ctx.readme.toLowerCase().includes("screenshot")) documentation += 5;

  if (ctx.stars >= 10) resumeWorthiness += 10;
  if (ctx.stars >= 50) resumeWorthiness += 8;
  if (readmeLen > 300 && ctx.description) resumeWorthiness += 15;
  if (ctx.topics.length >= 2) resumeWorthiness += 5;
  if (ctx.primaryLanguage) resumeWorthiness += 10;
  if (ctx.hasTests && ctx.hasCi) resumeWorthiness += 12;

  const scores: ProjectReviewScores = {
    codeQuality: clamp(codeQuality),
    architecture: clamp(architecture),
    documentation: clamp(documentation),
    resumeWorthiness: clamp(resumeWorthiness),
    overall: 0,
  };
  scores.overall = clamp(
    (scores.codeQuality + scores.architecture + scores.documentation + scores.resumeWorthiness) / 4
  );

  const dimensions: ProjectReviewDimension[] = [
    "codeQuality",
    "architecture",
    "documentation",
    "resumeWorthiness",
  ];

  const dimensionFeedback: ProjectReviewDimensionFeedback[] = dimensions.map((dimension) => ({
    dimension,
    score: scores[dimension],
    feedback: localDimensionFeedback(dimension, scores[dimension], ctx),
  }));

  const missingFeatures = buildMissingFeatures(ctx);
  const improvementSuggestions = buildSuggestions(ctx, scores, missingFeatures);

  return {
    repoUrl,
    repoFullName: ctx.fullName,
    description: ctx.description ?? undefined,
    primaryLanguage: ctx.primaryLanguage ?? undefined,
    stars: ctx.stars,
    scores,
    dimensionFeedback,
    missingFeatures,
    improvementSuggestions,
    summary: `Project ${ctx.fullName} scores ${scores.overall}/100 for placement readiness. ${
      scores.overall >= 75
        ? "Strong portfolio piece with room to polish presentation."
        : scores.overall >= 60
          ? "Solid foundation — address gaps below to stand out on resumes."
          : "Needs structural and documentation improvements before highlighting to recruiters."
    }`,
    strengths: buildStrengths(ctx, scores),
    techStack: Object.keys(ctx.languages).slice(0, 8),
  };
}

function localDimensionFeedback(
  dimension: ProjectReviewDimension,
  score: number,
  ctx: GitHubRepoContext
): string {
  const label = DIMENSION_LABELS[dimension];
  if (dimension === "codeQuality") {
    if (!ctx.hasTests)
      return `${label}: No clear test directory detected. Add unit/integration tests to demonstrate engineering rigor.`;
    if (!ctx.hasCi)
      return `${label}: Tests may exist but CI is not visible. Add GitHub Actions for automated checks on every PR.`;
    return `${label}: Basic quality signals present (${score}/100). Consider linting, type safety, and code coverage badges.`;
  }
  if (dimension === "architecture") {
    if (!ctx.rootFiles.some((f) => /^(src|app|lib)\/?$/i.test(f)))
      return `${label}: Flat or unclear structure. Organize into src/, services, and clear module boundaries.`;
    return `${label}: Repository layout suggests separation of concerns (${score}/100). Document architecture in README with a simple diagram.`;
  }
  if (dimension === "documentation") {
    if (ctx.readme.length < 150)
      return `${label}: README is missing or too short. Add setup, features, tech stack, and demo screenshots.`;
    return `${label}: README provides some context (${score}/100). Add API docs, env vars table, and deployment steps.`;
  }
  return `${label}: ${score}/100 — ensure the README highlights impact, your role, tech stack, and metrics recruiters care about.`;
}

function buildMissingFeatures(ctx: GitHubRepoContext): string[] {
  const missing: string[] = [];
  if (!ctx.readme.trim()) missing.push("README with project overview and setup instructions");
  if (!ctx.hasTests) missing.push("Automated tests (unit/integration)");
  if (!ctx.hasCi) missing.push("CI pipeline (GitHub Actions)");
  if (!ctx.hasDocker) missing.push("Containerization (Docker) for easy deployment demo");
  if (!ctx.hasEnvExample) missing.push(".env.example for configuration documentation");
  if (!ctx.license) missing.push("Open-source license (MIT/Apache-2.0)");
  if (!ctx.description) missing.push("GitHub repository description and topics/tags");
  if (!ctx.readme.toLowerCase().includes("demo") && !ctx.readme.toLowerCase().includes("screenshot"))
    missing.push("Live demo link or screenshots in README");
  if (!ctx.hasContributing && ctx.stars > 5)
    missing.push("CONTRIBUTING.md for collaboration readiness");
  return missing.slice(0, 8);
}

function buildSuggestions(
  ctx: GitHubRepoContext,
  scores: ProjectReviewScores,
  missing: string[]
): string[] {
  const suggestions: string[] = [];
  if (scores.documentation < 70)
    suggestions.push("Expand README: problem statement, architecture diagram, setup, and sample usage");
  if (scores.codeQuality < 70)
    suggestions.push("Add Jest/Pytest (or framework tests) plus a CI badge in README");
  if (scores.architecture < 70)
    suggestions.push("Refactor into layers (api / services / models) and document data flow");
  if (scores.resumeWorthiness < 75)
    suggestions.push(
      "Add a 'Resume bullet' section: tech stack, scale (users/requests), and measurable outcomes"
    );
  suggestions.push(...missing.map((m) => `Add: ${m}`));
  suggestions.push("Pin this repo on your GitHub profile if it represents your best work");
  return [...new Set(suggestions)].slice(0, 10);
}

function buildStrengths(ctx: GitHubRepoContext, scores: ProjectReviewScores): string[] {
  const strengths: string[] = [];
  if (ctx.primaryLanguage) strengths.push(`Primary stack: ${ctx.primaryLanguage}`);
  if (ctx.stars > 0) strengths.push(`${ctx.stars} GitHub stars — social proof for recruiters`);
  if (ctx.hasTests) strengths.push("Test suite detected");
  if (ctx.hasCi) strengths.push("CI/CD workflows present");
  if (scores.documentation >= 70) strengths.push("Documentation above average for student projects");
  if (strengths.length === 0) strengths.push("Public repository available for review");
  return strengths.slice(0, 5);
}

export function normalizeAiProjectReview(
  raw: Record<string, unknown>,
  local: Omit<ProjectReviewReport, "id" | "createdAt">
): Omit<ProjectReviewReport, "id" | "createdAt"> {
  const scoresRaw = raw.scores as Record<string, unknown> | undefined;
  const num = (k: string, fallback: number) => {
    const v = scoresRaw?.[k];
    return typeof v === "number" ? clamp(v) : fallback;
  };

  const scores: ProjectReviewScores = {
    codeQuality: num("code_quality", local.scores.codeQuality) || num("codeQuality", local.scores.codeQuality),
    architecture: num("architecture", local.scores.architecture),
    documentation: num("documentation", local.scores.documentation),
    resumeWorthiness:
      num("resume_worthiness", local.scores.resumeWorthiness) ||
      num("resumeWorthiness", local.scores.resumeWorthiness),
    overall: num("overall", local.scores.overall) || num("project_score", local.scores.overall),
  };

  if (!scoresRaw?.overall && !scoresRaw?.project_score) {
    scores.overall = clamp(
      (scores.codeQuality + scores.architecture + scores.documentation + scores.resumeWorthiness) / 4
    );
  }

  const dimMap: Record<string, ProjectReviewDimension> = {
    code_quality: "codeQuality",
    codeQuality: "codeQuality",
    architecture: "architecture",
    documentation: "documentation",
    resume_worthiness: "resumeWorthiness",
    resumeWorthiness: "resumeWorthiness",
  };

  const dimFb = raw.dimension_feedback as unknown[] | undefined;
  const dimensionFeedback: ProjectReviewDimensionFeedback[] = Array.isArray(dimFb)
    ? dimFb.map((item, i) => {
        const o = item as Record<string, unknown>;
        const dimension =
          dimMap[String(o.dimension ?? "")] ||
          local.dimensionFeedback[i]?.dimension ||
          "codeQuality";
        return {
          dimension,
          score: typeof o.score === "number" ? clamp(o.score) : local.dimensionFeedback[i]?.score ?? 65,
          feedback: String(o.feedback ?? local.dimensionFeedback[i]?.feedback ?? ""),
        };
      })
    : local.dimensionFeedback;

  const missingFeatures = Array.isArray(raw.missing_features)
    ? raw.missing_features.map(String)
    : Array.isArray(raw.missingFeatures)
      ? raw.missingFeatures.map(String)
      : local.missingFeatures;

  const improvementSuggestions = Array.isArray(raw.improvement_suggestions)
    ? raw.improvement_suggestions.map(String)
    : Array.isArray(raw.improvementSuggestions)
      ? raw.improvementSuggestions.map(String)
      : Array.isArray(raw.recommendations)
        ? raw.recommendations.map(String)
        : local.improvementSuggestions;

  return {
    ...local,
    scores,
    dimensionFeedback,
    missingFeatures,
    improvementSuggestions,
    summary: String(raw.summary ?? local.summary),
    strengths: Array.isArray(raw.strengths) ? raw.strengths.map(String) : local.strengths,
    techStack: Array.isArray(raw.tech_stack)
      ? raw.tech_stack.map(String)
      : Array.isArray(raw.techStack)
        ? raw.techStack.map(String)
        : local.techStack,
  };
}

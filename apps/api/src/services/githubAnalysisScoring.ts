import type { GitHubProfileContext } from "./githubProfile.js";
import type {
  GitHubAnalysisDimension,
  GitHubAnalysisDimensionFeedback,
  GitHubProfileAnalysisReport,
  GitHubAnalysisScores,
  SkillAnalysisItem,
} from "@placepro/shared";

function clamp(n: number): number {
  return Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
}

const LABELS: Record<GitHubAnalysisDimension, string> = {
  repositories: "Repositories",
  languages: "Languages",
  contributionActivity: "Contribution Activity",
  projectQuality: "Project Quality",
  openSourceActivity: "Open Source Activity",
};

export function computeLocalGitHubAnalysis(
  ctx: GitHubProfileContext
): Omit<GitHubProfileAnalysisReport, "id" | "createdAt"> {
  const repoCount = ctx.repos.length;
  let repositories = 50;
  if (repoCount >= 5) repositories += 15;
  if (repoCount >= 15) repositories += 15;
  if (repoCount >= 30) repositories += 10;
  if (ctx.reposWithDescription / Math.max(repoCount, 1) > 0.6) repositories += 10;

  const langCount = Object.keys(ctx.languageCounts).length;
  let languages = 45 + langCount * 12;
  if (langCount >= 4) languages += 10;

  let contributionActivity = 40;
  contributionActivity += Math.min(25, ctx.pushEvents30d * 2);
  contributionActivity += Math.min(15, ctx.recentPushCount * 2);
  contributionActivity += Math.min(10, ctx.prEvents30d * 3);

  let projectQuality = 50;
  if (ctx.totalStars >= 10) projectQuality += 15;
  if (ctx.totalStars >= 50) projectQuality += 10;
  if (ctx.reposWithDescription > repoCount * 0.5) projectQuality += 12;
  if (ctx.repos.some((r) => r.license)) projectQuality += 8;
  const avgStars = ctx.originalRepos > 0 ? ctx.totalStars / ctx.originalRepos : 0;
  if (avgStars >= 3) projectQuality += 10;

  let openSourceActivity = 45;
  openSourceActivity += Math.min(20, ctx.followers);
  openSourceActivity += Math.min(15, ctx.totalForks * 2);
  openSourceActivity += Math.min(15, ctx.prEvents30d * 4);
  if (ctx.originalRepos >= 3) openSourceActivity += 10;

  const scores: GitHubAnalysisScores = {
    repositories: clamp(repositories),
    languages: clamp(languages),
    contributionActivity: clamp(contributionActivity),
    projectQuality: clamp(projectQuality),
    openSourceActivity: clamp(openSourceActivity),
    overall: 0,
  };
  scores.overall = clamp(
    (scores.repositories +
      scores.languages +
      scores.contributionActivity +
      scores.projectQuality +
      scores.openSourceActivity) /
      5
  );

  const dimensions: GitHubAnalysisDimension[] = [
    "repositories",
    "languages",
    "contributionActivity",
    "projectQuality",
    "openSourceActivity",
  ];

  const dimensionFeedback: GitHubAnalysisDimensionFeedback[] = dimensions.map((dimension) => ({
    dimension,
    score: scores[dimension],
    feedback: dimensionFeedbackText(dimension, scores[dimension], ctx),
  }));

  const topLanguages = buildTopLanguages(ctx);
  const topRepositories = [...ctx.repos]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6)
    .map((r) => ({
      name: r.fullName,
      stars: r.stars,
      language: r.language,
      description: r.description,
    }));

  const skillAnalysis = buildSkillAnalysis(ctx);
  const improvementSuggestions = buildSuggestions(ctx, scores);

  return {
    username: ctx.username,
    profileUrl: ctx.profileUrl,
    name: ctx.name ?? undefined,
    bio: ctx.bio ?? undefined,
    avatarUrl: ctx.avatarUrl,
    publicRepos: ctx.publicRepos,
    followers: ctx.followers,
    following: ctx.following,
    developerScore: scores.overall,
    scores,
    dimensionFeedback,
    skillAnalysis,
    topLanguages,
    topRepositories,
    improvementSuggestions,
    summary: `GitHub profile @${ctx.username} earns a developer score of ${scores.overall}/100. ${
      scores.overall >= 75
        ? "Strong portfolio presence for campus and early-career hiring."
        : scores.overall >= 55
          ? "Solid base — focus on consistency, README quality, and pinned showcase projects."
          : "Build more original repos, document them well, and maintain regular contributions."
    }`,
    strengths: buildStrengths(ctx, scores),
  };
}

function dimensionFeedbackText(
  dimension: GitHubAnalysisDimension,
  score: number,
  ctx: GitHubProfileContext
): string {
  const label = LABELS[dimension];
  switch (dimension) {
    case "repositories":
      return `${label} (${score}/100): ${ctx.repos.length} repos fetched, ${ctx.originalRepos} original. ${
        ctx.reposWithDescription < ctx.repos.length / 2
          ? "Add descriptions and topics to every showcase project."
          : "Good variety — pin your best 3–6 repos on your profile."
      }`;
    case "languages":
      return `${label} (${score}/100): ${Object.keys(ctx.languageCounts).length} languages detected. ${
        Object.keys(ctx.languageCounts).length < 2
          ? "Diversify or go deep on one stack with multiple quality projects."
          : "Demonstrates polyglot exposure — align top languages with target job roles."
      }`;
    case "contributionActivity":
      return `${label} (${score}/100): ${ctx.pushEvents30d} pushes and ${ctx.recentPushCount} repo updates in the last 30 days. ${
        ctx.pushEvents30d < 5
          ? "Commit more regularly — green squares signal consistency to recruiters."
          : "Healthy activity pattern — keep weekly cadence on flagship projects."
      }`;
    case "projectQuality":
      return `${label} (${score}/100): ${ctx.totalStars} total stars across repos. ${
        ctx.totalStars < 5
          ? "Improve READMEs, add demos, and share projects for visibility."
          : "Some projects show traction — double down on documenting impact and architecture."
      }`;
    case "openSourceActivity":
      return `${label} (${score}/100): ${ctx.followers} followers, ${ctx.totalForks} forks on your work. ${
        ctx.prEvents30d === 0
          ? "Contribute to open source via PRs or issues to strengthen collaboration signals."
          : "Open source engagement present — highlight contributions on your resume."
      }`;
    default:
      return `${label}: ${score}/100`;
  }
}

function buildTopLanguages(ctx: GitHubProfileContext) {
  const total = Object.values(ctx.languageCounts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(ctx.languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([language, repoCount]) => ({
      language,
      repoCount,
      percentage: Math.round((repoCount / total) * 1000) / 10,
    }));
}

function buildSkillAnalysis(ctx: GitHubProfileContext): SkillAnalysisItem[] {
  const total = Object.values(ctx.languageCounts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(ctx.languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill, count]) => {
      const pct = (count / total) * 100;
      let level: SkillAnalysisItem["level"] = "beginner";
      if (pct >= 40 || count >= 8) level = "advanced";
      else if (pct >= 25 || count >= 4) level = "intermediate";
      else if (count >= 2) level = "intermediate";
      return {
        skill,
        level,
        percentage: Math.round(pct * 10) / 10,
        evidence: `${count} public ${count === 1 ? "repository" : "repositories"} using ${skill}`,
      };
    });
}

function buildSuggestions(ctx: GitHubProfileContext, scores: GitHubAnalysisScores): string[] {
  const suggestions: string[] = [];
  if (scores.repositories < 70)
    suggestions.push("Create 2–3 flagship original projects with full READMEs and live demos");
  if (scores.contributionActivity < 65)
    suggestions.push("Commit consistently (aim for weekly pushes on active repos)");
  if (scores.projectQuality < 70)
    suggestions.push("Add architecture diagrams, tests, and CI badges to top repos");
  if (scores.openSourceActivity < 65)
    suggestions.push("Submit PRs to open-source projects in your primary language");
  if (!ctx.bio) suggestions.push("Write a bio mentioning your stack and placement goals");
  if (ctx.followers < 10)
    suggestions.push("Share projects on LinkedIn/Twitter to grow profile visibility");
  suggestions.push("Pin your 3 best repositories on your GitHub profile");
  suggestions.push("Use topics/tags on every repo for discoverability");
  return [...new Set(suggestions)].slice(0, 10);
}

function buildStrengths(ctx: GitHubProfileContext, scores: GitHubAnalysisScores): string[] {
  const strengths: string[] = [];
  if (ctx.totalStars >= 10) strengths.push(`${ctx.totalStars} total stars across projects`);
  if (Object.keys(ctx.languageCounts).length >= 3)
    strengths.push(`Multi-language portfolio (${Object.keys(ctx.languageCounts).length} languages)`);
  if (ctx.pushEvents30d >= 10) strengths.push("Active contribution pattern in the last month");
  if (ctx.originalRepos >= 10) strengths.push(`${ctx.originalRepos} original repositories`);
  if (scores.projectQuality >= 70) strengths.push("Above-average project presentation");
  if (strengths.length === 0) strengths.push("Public GitHub profile available for recruiter review");
  return strengths.slice(0, 5);
}

export function normalizeAiGitHubAnalysis(
  raw: Record<string, unknown>,
  local: Omit<GitHubProfileAnalysisReport, "id" | "createdAt">
): Omit<GitHubProfileAnalysisReport, "id" | "createdAt"> {
  const scoresRaw = raw.scores as Record<string, unknown> | undefined;
  const num = (k: string, alt: string, fallback: number) => {
    const v = scoresRaw?.[k] ?? scoresRaw?.[alt];
    return typeof v === "number" ? clamp(v) : fallback;
  };

  const scores: GitHubAnalysisScores = {
    repositories: num("repositories", "repositories", local.scores.repositories),
    languages: num("languages", "languages", local.scores.languages),
    contributionActivity: num(
      "contribution_activity",
      "contributionActivity",
      local.scores.contributionActivity
    ),
    projectQuality: num("project_quality", "projectQuality", local.scores.projectQuality),
    openSourceActivity: num(
      "open_source_activity",
      "openSourceActivity",
      local.scores.openSourceActivity
    ),
    overall: num("overall", "developer_score", local.scores.overall),
  };

  if (!scoresRaw?.overall && !scoresRaw?.developer_score) {
    scores.overall = clamp(
      (scores.repositories +
        scores.languages +
        scores.contributionActivity +
        scores.projectQuality +
        scores.openSourceActivity) /
        5
    );
  }

  const dimMap: Record<string, GitHubAnalysisDimension> = {
    repositories: "repositories",
    languages: "languages",
    contribution_activity: "contributionActivity",
    contributionActivity: "contributionActivity",
    project_quality: "projectQuality",
    projectQuality: "projectQuality",
    open_source_activity: "openSourceActivity",
    openSourceActivity: "openSourceActivity",
  };

  const dimFb = raw.dimension_feedback as unknown[] | undefined;
  const dimensionFeedback: GitHubAnalysisDimensionFeedback[] = Array.isArray(dimFb)
    ? dimFb.map((item, i) => {
        const o = item as Record<string, unknown>;
        const dimension =
          dimMap[String(o.dimension ?? "")] ||
          local.dimensionFeedback[i]?.dimension ||
          "repositories";
        return {
          dimension,
          score: typeof o.score === "number" ? clamp(o.score) : local.dimensionFeedback[i]?.score ?? 65,
          feedback: String(o.feedback ?? local.dimensionFeedback[i]?.feedback ?? ""),
        };
      })
    : local.dimensionFeedback;

  const skillRaw = raw.skill_analysis ?? raw.skillAnalysis;
  const skillAnalysis: SkillAnalysisItem[] = Array.isArray(skillRaw)
    ? skillRaw.map((item) => {
        const o = item as Record<string, unknown>;
        return {
          skill: String(o.skill ?? ""),
          level: (["beginner", "intermediate", "advanced", "expert"].includes(String(o.level))
            ? o.level
            : "intermediate") as SkillAnalysisItem["level"],
          evidence: String(o.evidence ?? ""),
          percentage: typeof o.percentage === "number" ? o.percentage : undefined,
        };
      })
    : local.skillAnalysis;

  const improvementSuggestions = Array.isArray(raw.improvement_suggestions)
    ? raw.improvement_suggestions.map(String)
    : Array.isArray(raw.improvementSuggestions)
      ? raw.improvementSuggestions.map(String)
      : local.improvementSuggestions;

  const developerScore =
    typeof raw.developer_score === "number"
      ? clamp(raw.developer_score)
      : typeof raw.developerScore === "number"
        ? clamp(raw.developerScore)
        : scores.overall;

  return {
    ...local,
    developerScore,
    scores: { ...scores, overall: developerScore },
    dimensionFeedback,
    skillAnalysis,
    improvementSuggestions,
    summary: String(raw.summary ?? local.summary),
    strengths: Array.isArray(raw.strengths) ? raw.strengths.map(String) : local.strengths,
  };
}

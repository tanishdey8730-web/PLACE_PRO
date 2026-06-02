import type { JobMatchResult } from "@placepro/shared";

const SKILL_KEYWORDS = [
  "java",
  "python",
  "javascript",
  "typescript",
  "react",
  "node",
  "sql",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "git",
  "ci/cd",
  "rest",
  "api",
  "microservices",
  "system design",
  "machine learning",
  "data structures",
  "algorithms",
  "spring",
  "django",
  "flask",
  "mongodb",
  "postgresql",
  "redis",
  "kafka",
  "terraform",
  "agile",
  "scrum",
];

function extractTokens(text: string): Set<string> {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const skill of SKILL_KEYWORDS) {
    if (lower.includes(skill)) found.add(skill);
  }
  return found;
}

function clamp(n: number): number {
  return Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
}

export function computeLocalJobMatch(resume: string, jobDescription: string): JobMatchResult {
  const resumeSkills = extractTokens(resume);
  const jobSkills = extractTokens(jobDescription);

  const matched = [...jobSkills].filter((s) => resumeSkills.has(s));
  const missing = [...jobSkills].filter((s) => !resumeSkills.has(s));

  const overlapRatio = jobSkills.size > 0 ? matched.length / jobSkills.size : 0.5;
  const resumeCoverage = resumeSkills.size > 0 ? matched.length / resumeSkills.size : 0;

  let matchScore = clamp(overlapRatio * 70 + resumeCoverage * 20 + 10);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (matched.length > 0) {
    strengths.push(`Strong overlap in: ${matched.slice(0, 5).join(", ")}`);
  }
  if (resume.length > 500) {
    strengths.push("Resume provides sufficient detail for keyword matching");
  }
  if (/intern|project|experience/i.test(resume)) {
    strengths.push("Relevant experience or projects mentioned");
  }

  if (missing.length > 0) {
    weaknesses.push(`Job requires skills not clearly listed: ${missing.slice(0, 4).join(", ")}`);
  }
  if (resume.length < 200) {
    weaknesses.push("Resume text is short — add more role-specific keywords");
    matchScore = clamp(matchScore - 15);
  }
  if (!/metric|%|\d+\+|\d+k/i.test(resume)) {
    weaknesses.push("Limited quantified achievements in resume");
  }

  if (strengths.length === 0) {
    strengths.push("Foundation skills present — expand alignment with job description keywords");
  }

  const missingSkills = missing.map((s) =>
    s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  );

  const recommendations: string[] = [];
  if (missingSkills.length) {
    recommendations.push(`Add ${missingSkills.slice(0, 3).join(", ")} to skills and project bullets`);
  }
  recommendations.push("Mirror exact phrases from the job description in your summary");
  recommendations.push("Tailor top 3 resume bullets to match required responsibilities");

  return {
    matchScore,
    missingSkills: missingSkills.length ? missingSkills : ["Review job description for implicit requirements"],
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    matchedKeywords: matched.map((s) => s.toUpperCase()),
    recommendations: recommendations.slice(0, 4),
  };
}

export function normalizeAiJobMatch(raw: Record<string, unknown>, fallback: JobMatchResult): JobMatchResult {
  return {
    matchScore: clamp(Number(raw.match_score ?? raw.matchScore ?? fallback.matchScore)),
    missingSkills: (raw.missing_skills ?? raw.missingSkills ?? fallback.missingSkills) as string[],
    strengths: (raw.strengths ?? fallback.strengths) as string[],
    weaknesses: (raw.weaknesses ?? fallback.weaknesses) as string[],
    matchedKeywords: (raw.matched_keywords ?? raw.matchedKeywords ?? fallback.matchedKeywords) as string[],
    recommendations: (raw.recommendations ?? fallback.recommendations) as string[],
  };
}

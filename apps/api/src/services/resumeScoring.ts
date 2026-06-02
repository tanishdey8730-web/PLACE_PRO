import type { ResumeContent, ResumeBuilderScores } from "@placepro/shared";

export function computeLocalScores(content: ResumeContent, targetRole: string): ResumeBuilderScores {
  let score = 40;
  const feedback: string[] = [];

  const p = content.personal;
  if (p.fullName) score += 5;
  else feedback.push("Add your full name");
  if (p.email) score += 5;
  else feedback.push("Add a professional email");
  if (p.phone) score += 3;
  if (p.summary && p.summary.length > 50) score += 10;
  else feedback.push("Write a 2–3 line professional summary");
  if (p.github || p.linkedin) score += 5;

  if (content.skills.length >= 6) score += 10;
  else feedback.push("List at least 6 relevant skills");
  if (content.education.length) score += 8;
  if (content.projects.length) score += 12;
  else feedback.push("Add 1–2 strong projects with metrics");
  if (content.internships.length || content.experience.length) score += 10;

  const hasMetrics = [...content.projects, ...content.internships, ...content.experience].some(
    (item) => "bullets" in item && item.bullets.some((b) => /\d+%|\d+\+|\$\d|k\+/i.test(b))
  );
  if (hasMetrics) score += 8;
  else feedback.push("Quantify impact with numbers (%, users, latency)");

  const roleKeywords: Record<string, string[]> = {
    "software engineer": ["java", "python", "api", "git", "agile"],
    "data scientist": ["python", "machine learning", "sql", "pandas"],
  };
  const key = targetRole.toLowerCase();
  const keywords =
    Object.entries(roleKeywords).find(([k]) => key.includes(k))?.[1] ??
    roleKeywords["software engineer"];
  const skillText = content.skills.join(" ").toLowerCase();
  const matched = keywords.filter((k) => skillText.includes(k));
  score += Math.min(matched.length * 2, 10);

  const atsScore = Math.min(Math.round(score + 5), 95);
  const qualityScore = Math.min(Math.round(score), 92);

  return {
    atsScore,
    qualityScore,
    feedback: feedback.length
      ? feedback
      : ["Resume structure looks solid — tailor keywords for each application"],
    keywordSuggestions: keywords.filter((k) => !skillText.includes(k)).slice(0, 5),
  };
}

export function normalizeAiScores(raw: Record<string, unknown>): ResumeBuilderScores {
  return {
    atsScore: Number(raw.ats_score ?? raw.atsScore ?? 75),
    qualityScore: Number(raw.quality_score ?? raw.qualityScore ?? 70),
    feedback: (raw.feedback as string[]) ?? [],
    keywordSuggestions: (raw.keyword_suggestions as string[]) ?? (raw.keywordSuggestions as string[]) ?? [],
  };
}

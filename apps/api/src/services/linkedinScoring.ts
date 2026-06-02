import type { LinkedInAnalysisResult } from "@placepro/shared";

export function normalizeLinkedInAnalysis(
  raw: Record<string, unknown>,
  profileUrl: string
): LinkedInAnalysisResult {
  const section = (key: string) => {
    const s = (raw[key] ?? raw[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())]) as Record<string, unknown> | undefined;
    return {
      score: Number(s?.score ?? 0),
      feedback: String(s?.feedback ?? ""),
      suggestions: (s?.suggestions as string[]) ?? [],
    };
  };

  const skillsRaw = (raw.skills ?? {}) as Record<string, unknown>;
  const completenessRaw = (raw.completeness ?? {}) as Record<string, unknown>;
  const suggestionsRaw = (raw.suggestions ?? {}) as Record<string, unknown>;

  return {
    profileUrl,
    linkedinScore: Number(raw.linkedin_score ?? raw.linkedinScore ?? 0),
    headline: section("headline"),
    about: section("about"),
    skills: {
      score: Number(skillsRaw.score ?? 0),
      listed: (skillsRaw.listed as string[]) ?? [],
      missing: (skillsRaw.missing as string[]) ?? [],
      feedback: String(skillsRaw.feedback ?? ""),
    },
    missingKeywords: (raw.missing_keywords as string[]) ?? (raw.missingKeywords as string[]) ?? [],
    completeness: {
      score: Number(completenessRaw.score ?? 0),
      checklist: ((completenessRaw.checklist as { item: string; done: boolean }[]) ?? []).map(
        (c) => ({ item: c.item, done: Boolean(c.done) })
      ),
    },
    suggestions: {
      profile: (suggestionsRaw.profile as string[]) ?? [],
      visibility: (suggestionsRaw.visibility as string[]) ?? [],
      recruiterAppeal:
        (suggestionsRaw.recruiter_appeal as string[]) ??
        (suggestionsRaw.recruiterAppeal as string[]) ??
        [],
    },
    recommendations: (raw.recommendations as string[]) ?? [],
  };
}

export function isValidLinkedInUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.includes("linkedin.com");
  } catch {
    return false;
  }
}

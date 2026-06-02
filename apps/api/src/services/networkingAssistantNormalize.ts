import { randomBytes } from "crypto";
import type {
  LinkedInOutreachSuggestion,
  NetworkContactSuggestion,
  NetworkContactType,
  NetworkingAssistantResult,
  NetworkingRecommendation,
} from "@placepro/shared";

function id(prefix: string) {
  return `${prefix}-${randomBytes(4).toString("hex")}`;
}

function mapContact(
  raw: Record<string, unknown>,
  type: NetworkContactType
): NetworkContactSuggestion {
  return {
    id: id(type.toLowerCase().slice(0, 3)),
    type,
    name: String(raw.name ?? "Contact"),
    title: String(raw.title ?? ""),
    company: raw.company != null ? String(raw.company) : null,
    college: raw.college != null ? String(raw.college) : null,
    linkedinUrl:
      raw.linkedin_url != null
        ? String(raw.linkedin_url)
        : raw.linkedinUrl != null
          ? String(raw.linkedinUrl)
          : null,
    matchScore: Number(raw.match_score ?? raw.matchScore ?? 75),
    reason: String(raw.reason ?? ""),
    connectionTip: String(raw.connection_tip ?? raw.connectionTip ?? ""),
    isPlatformUser: Boolean(raw.is_platform_user ?? raw.isPlatformUser),
    platformUserId:
      raw.platform_user_id != null
        ? String(raw.platform_user_id)
        : raw.platformUserId != null
          ? String(raw.platformUserId)
          : undefined,
  };
}

export function normalizeNetworkingResult(
  raw: Record<string, unknown>,
  meta: {
    targetRole: string;
    targetCompanies: string[];
    id?: string;
    createdAt?: string;
  }
): NetworkingAssistantResult {
  const recruiters = (raw.recruiters as Record<string, unknown>[] | undefined) ?? [];
  const alumni = (raw.alumni as Record<string, unknown>[] | undefined) ?? [];
  const mentors = (raw.mentors as Record<string, unknown>[] | undefined) ?? [];
  const recs = (raw.recommendations as Record<string, unknown>[] | undefined) ?? [];
  const outreach =
    (raw.linkedin_outreach as Record<string, unknown>[] | undefined) ??
    (raw.linkedInOutreach as Record<string, unknown>[] | undefined) ??
    [];

  const recommendations: NetworkingRecommendation[] = recs.map((r) => ({
    id: id("nr"),
    priority: (r.priority as NetworkingRecommendation["priority"]) ?? "medium",
    category: String(r.category ?? "General"),
    title: String(r.title ?? ""),
    description: String(r.description ?? ""),
    actionSteps: (r.action_steps ?? r.actionSteps ?? []) as string[],
  }));

  const linkedInOutreach: LinkedInOutreachSuggestion[] = outreach.map((o) => ({
    id: id("lo"),
    targetType: String(o.target_type ?? o.targetType ?? "ALUMNI") as NetworkContactType,
    targetName: String(o.target_name ?? o.targetName ?? ""),
    targetTitle: String(o.target_title ?? o.targetTitle ?? ""),
    purpose: (o.purpose as LinkedInOutreachSuggestion["purpose"]) ?? "cold_outreach",
    subjectLine:
      o.subject_line != null
        ? String(o.subject_line)
        : o.subjectLine != null
          ? String(o.subjectLine)
          : null,
    message: String(o.message ?? ""),
    tips: (o.tips ?? []) as string[],
  }));

  return {
    id: meta.id,
    targetRole: meta.targetRole,
    targetCompanies: meta.targetCompanies,
    summary: String(raw.summary ?? ""),
    recruiters: recruiters.map((r) => mapContact(r, "RECRUITER")),
    alumni: alumni.map((r) => mapContact(r, "ALUMNI")),
    mentors: mentors.map((r) => mapContact(r, "MENTOR")),
    recommendations,
    linkedInOutreach,
    weeklyPlan: (raw.weekly_plan ?? raw.weeklyPlan ?? []) as string[],
    createdAt: meta.createdAt,
  };
}

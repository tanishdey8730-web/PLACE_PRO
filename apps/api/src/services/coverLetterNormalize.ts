import type { CoverLetterContent, CoverLetterGenerateResult, CoverLetterTemplateId } from "@placepro/shared";

function normalizeDoc(raw: Record<string, unknown> | undefined, fallback: CoverLetterContent): CoverLetterContent {
  if (!raw) return fallback;
  return {
    subject: String(raw.subject ?? fallback.subject),
    salutation: String(raw.salutation ?? fallback.salutation),
    body: String(raw.body ?? fallback.body),
    closing: String(raw.closing ?? fallback.closing),
    signature: String(raw.signature ?? fallback.signature),
  };
}

export function normalizeCoverLetterResponse(
  raw: Record<string, unknown>,
  input: {
    companyName: string;
    jobTitle: string;
    template: CoverLetterTemplateId;
    applicantName: string;
  },
  fallback: CoverLetterGenerateResult
): CoverLetterGenerateResult {
  const docs = (raw.documents ?? raw) as Record<string, unknown>;
  const fb = fallback.documents;

  const get = (snake: string, camel: string) =>
    (docs[snake] ?? docs[camel]) as Record<string, unknown> | undefined;

  return {
    companyName: input.companyName,
    jobTitle: input.jobTitle,
    template: input.template,
    documents: {
      coverLetter: normalizeDoc(get("cover_letter", "coverLetter"), fb.coverLetter),
      internshipApplication: normalizeDoc(
        get("internship_application", "internshipApplication"),
        fb.internshipApplication
      ),
      referralRequest: normalizeDoc(get("referral_request", "referralRequest"), fb.referralRequest),
      hrFollowUp: normalizeDoc(get("hr_follow_up", "hrFollowUp"), fb.hrFollowUp),
    },
  };
}

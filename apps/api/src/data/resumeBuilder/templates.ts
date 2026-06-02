import type { ResumeBuilderTemplateId } from "@placepro/shared";

export const RESUME_TEMPLATES: {
  id: ResumeBuilderTemplateId;
  name: string;
  description: string;
  features: string[];
}[] = [
  {
    id: "ats",
    name: "ATS-Friendly",
    description: "Single-column layout optimized for applicant tracking systems",
    features: ["Simple headings", "Keyword-rich", "No graphics", "Standard fonts"],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Classic corporate style for campus and experienced hires",
    features: ["Clear hierarchy", "Balanced whitespace", "Formal tone"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with accent sidebar for skills",
    features: ["Accent color bar", "Two-tone layout", "Visual hierarchy"],
  },
];

export function toPrismaTemplate(id: ResumeBuilderTemplateId): "ATS_FRIENDLY" | "PROFESSIONAL" | "MODERN" {
  const map = {
    ats: "ATS_FRIENDLY",
    professional: "PROFESSIONAL",
    modern: "MODERN",
  } as const;
  return map[id];
}

export function fromPrismaTemplate(t: string): ResumeBuilderTemplateId {
  const map: Record<string, ResumeBuilderTemplateId> = {
    ATS_FRIENDLY: "ats",
    PROFESSIONAL: "professional",
    MODERN: "modern",
  };
  return map[t] ?? "ats";
}

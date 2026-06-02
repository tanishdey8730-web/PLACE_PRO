import type { CoverLetterTemplateId } from "@placepro/shared";

export const COVER_LETTER_TEMPLATES: {
  id: CoverLetterTemplateId;
  name: string;
  description: string;
  tone: string;
}[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Balanced business tone for campus and entry-level roles",
    tone: "Clear, respectful, achievement-focused",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Approachable voice with strong opening hook",
    tone: "Confident, concise, slightly conversational",
  },
  {
    id: "formal",
    name: "Formal",
    description: "Traditional structure for corporate and finance roles",
    tone: "Highly formal, structured paragraphs",
  },
  {
    id: "concise",
    name: "Concise",
    description: "Short paragraphs optimized for quick recruiter scans",
    tone: "Direct, bullet-friendly, under 300 words",
  },
];

export function toPrismaCoverTemplate(id: CoverLetterTemplateId): "PROFESSIONAL" | "MODERN" | "FORMAL" | "CONCISE" {
  const map = {
    professional: "PROFESSIONAL",
    modern: "MODERN",
    formal: "FORMAL",
    concise: "CONCISE",
  } as const;
  return map[id];
}

export function fromPrismaCoverTemplate(t: string): CoverLetterTemplateId {
  const map: Record<string, CoverLetterTemplateId> = {
    PROFESSIONAL: "professional",
    MODERN: "modern",
    FORMAL: "formal",
    CONCISE: "concise",
  };
  return map[t] ?? "professional";
}

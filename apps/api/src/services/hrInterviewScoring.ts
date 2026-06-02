import type { HrInterviewAnswer, HrInterviewReport } from "@placepro/shared";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function clamp(n: number): number {
  return Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
}

export function computeLocalHrReport(
  answers: HrInterviewAnswer[],
  targetRole: string
): Omit<HrInterviewReport, "id" | "questions" | "completedAt"> {
  const totalWords = answers.reduce((s, a) => s + wordCount(a.answer), 0);
  const avgWords = answers.length ? totalWords / answers.length : 0;

  let communication = 65;
  let confidence = 65;
  let clarity = 65;
  let professionalism = 70;

  if (avgWords >= 40 && avgWords <= 120) {
    communication += 10;
    clarity += 12;
  } else if (avgWords < 20) {
    communication -= 15;
    clarity -= 10;
  } else if (avgWords > 150) {
    clarity -= 8;
    communication -= 5;
  }

  const hasMetrics = answers.some((a) => /\d+%|\d+\+|\d+ (years|months|people|users)/i.test(a.answer));
  if (hasMetrics) {
    confidence += 10;
    professionalism += 8;
  }

  const hasRole = answers.some((a) => new RegExp(targetRole.split(" ")[0], "i").test(a.answer));
  if (hasRole) professionalism += 5;

  communication = clamp(communication);
  confidence = clamp(confidence);
  clarity = clamp(clarity);
  professionalism = clamp(professionalism);
  const overall = clamp((communication + confidence + clarity + professionalism) / 4);

  const questionFeedback = answers.map((a) => {
    const wc = wordCount(a.answer);
    let score = overall;
    let feedback = "Adequate response — add a concrete example.";
    if (wc >= 30) {
      score = clamp(overall + 5);
      feedback = "Good depth; tighten opening and end with impact.";
    }
    if (wc < 15) {
      score = clamp(overall - 15);
      feedback = "Too brief — expand with STAR structure and one metric.";
    }
    if (a.questionId === "weaknesses" && !/learn|improv|work/i.test(a.answer)) {
      feedback = "Show how you are actively improving the weakness.";
    }
    return { questionId: a.questionId, score, feedback };
  });

  return {
    targetRole,
    answers,
    scores: { communication, confidence, clarity, professionalism, overall },
    questionFeedback,
    summary: `Overall HR readiness is ${overall >= 75 ? "strong" : overall >= 60 ? "moderate" : "developing"} for ${targetRole} interviews.`,
    strengths: [
      avgWords >= 25 ? "Answers provide reasonable detail" : "Willingness to engage with all questions",
      hasMetrics ? "Uses quantified examples" : "Professional tone in responses",
    ],
    improvements: [
      avgWords < 25 ? "Expand answers to 45–90 seconds each" : "Reduce repetition across answers",
      !hasMetrics ? "Add numbers (%, team size, impact) to at least 2 answers" : "Sharpen 'Tell me about yourself' hook",
      "Practice smoother transitions and fewer filler words",
    ],
    recommendations: [
      "Rehearse the 5 standard HR questions with a timer",
      "Record video mocks to assess body language and confidence",
      "Customize 'Why hire you' per company",
    ],
  };
}

export function normalizeAiHrReport(
  raw: Record<string, unknown>,
  answers: HrInterviewAnswer[],
  targetRole: string,
  fallback: ReturnType<typeof computeLocalHrReport>
): HrInterviewReport {
  const scoresRaw = (raw.scores ?? raw) as Record<string, unknown>;
  const overall = Number(
    scoresRaw.overall ?? raw.overall_score ?? raw.overallScore ?? fallback.scores.overall
  );

  return {
    targetRole,
    answers,
    scores: {
      communication: clamp(Number(scoresRaw.communication ?? fallback.scores.communication)),
      confidence: clamp(Number(scoresRaw.confidence ?? fallback.scores.confidence)),
      clarity: clamp(Number(scoresRaw.clarity ?? fallback.scores.clarity)),
      professionalism: clamp(Number(scoresRaw.professionalism ?? fallback.scores.professionalism)),
      overall: clamp(overall),
    },
    questionFeedback: (raw.question_feedback ?? raw.questionFeedback ?? fallback.questionFeedback) as HrInterviewReport["questionFeedback"],
    summary: String(raw.summary ?? fallback.summary),
    strengths: (raw.strengths ?? fallback.strengths) as string[],
    improvements: (raw.improvements ?? fallback.improvements) as string[],
    recommendations: (raw.recommendations ?? fallback.recommendations) as string[],
  };
}

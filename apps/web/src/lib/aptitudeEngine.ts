import {
  pickQuestions,
  scoreAnswers,
  toPublicQuestion,
  type AptitudeCategory,
  type QuestionBankItem,
} from "@/data/aptitudeQuestionBank";
import type { GeneratedTest, TestResult } from "@/components/assessment/test-runner";

export interface PlacementProfile {
  targetRole: string;
  codingLevel: string;
  monthsToPlacement: string;
  branch?: string;
}

const testStore = new Map<string, { questions: QuestionBankItem[]; profile?: PlacementProfile }>();

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function storeTest(
  questions: QuestionBankItem[],
  meta: { title: string; description?: string; durationMinutes: number; profile?: PlacementProfile }
): GeneratedTest {
  const id = newId();
  testStore.set(id, { questions, profile: meta.profile });
  return {
    id,
    title: meta.title,
    description: meta.description,
    durationMinutes: meta.durationMinutes,
    questionCount: questions.length,
    questions: questions.map(toPublicQuestion),
  };
}

export function generateAptitudeQuiz(category: AptitudeCategory, count = 10): GeneratedTest {
  const questions = pickQuestions({ category, count });
  const titles: Record<AptitudeCategory, string> = {
    QUANTITATIVE: "Quantitative Aptitude Quiz",
    LOGICAL: "Logical Reasoning Quiz",
    VERBAL: "Verbal Ability Quiz",
  };
  return storeTest(questions, {
    title: titles[category],
    description: `Timed ${questions.length}-question quiz`,
    durationMinutes: Math.ceil(questions.length * 1.5),
  });
}

export function generateAptitudeMock(category?: AptitudeCategory): GeneratedTest {
  const questions = category
    ? [...pickQuestions({ category, count: 12 }), ...pickQuestions({ category, count: 3, difficulty: "HARD" })]
    : [
        ...pickQuestions({ category: "QUANTITATIVE", count: 8 }),
        ...pickQuestions({ category: "LOGICAL", count: 7 }),
        ...pickQuestions({ category: "VERBAL", count: 5 }),
      ];
  return storeTest(questions, {
    title: category ? `${category} Mock Exam` : "Full Aptitude Mock Exam",
    description: "Company-style timed mock exam",
    durationMinutes: category ? 30 : 45,
  });
}

export function generateFullMock(): GeneratedTest {
  const questions = [
    ...pickQuestions({ category: "QUANTITATIVE", count: 10 }),
    ...pickQuestions({ category: "LOGICAL", count: 8 }),
    ...pickQuestions({ category: "VERBAL", count: 5 }),
    ...pickQuestions({ section: "CODING_MCQ", count: 2 }),
  ];
  return storeTest(questions, {
    title: "Campus Placement Full Mock",
    description: "45-minute full-length placement aptitude mock",
    durationMinutes: 45,
  });
}

export function generatePlacementTest(profile: PlacementProfile): GeneratedTest {
  const questions = [
    ...pickQuestions({ category: "QUANTITATIVE", count: 5 }),
    ...pickQuestions({ category: "LOGICAL", count: 4 }),
    ...pickQuestions({ category: "VERBAL", count: 3 }),
    ...pickQuestions({ section: "CODING_MCQ", count: 3 }),
  ];
  return storeTest(questions, {
    title: "Placement Readiness Assessment",
    description: "Personalized aptitude + coding fundamentals test",
    durationMinutes: 25,
    profile,
  });
}

function profileWeight(profile?: PlacementProfile): number {
  if (!profile) return 50;
  let w = 50;
  if (profile.codingLevel === "Advanced") w += 20;
  else if (profile.codingLevel === "Intermediate") w += 10;
  if (profile.monthsToPlacement === "12+") w += 15;
  else if (profile.monthsToPlacement === "6-12") w += 10;
  else if (profile.monthsToPlacement === "3-6") w += 5;
  return Math.min(95, w);
}

function deriveSkillLevel(
  testScore: number,
  profile?: PlacementProfile
): "BEGINNER" | "INTERMEDIATE" | "ADVANCED" {
  const coding = profile?.codingLevel ?? "Beginner";
  if (testScore >= 75 && (coding === "Advanced" || coding === "Intermediate")) return "ADVANCED";
  if (testScore >= 55 || coding === "Intermediate") return "INTERMEDIATE";
  return "BEGINNER";
}

export function scoreTest(
  testId: string,
  answers: Record<string, string>,
  timeTakenSeconds?: number
): TestResult {
  const entry = testStore.get(testId);
  const scored = scoreAnswers(answers);
  const profile = entry?.profile;
  const profileScore = profileWeight(profile);
  const placementReadiness = Math.round(scored.score * 0.7 + profileScore * 0.3);

  const skillLevel = deriveSkillLevel(scored.score, profile);
  const companies =
    skillLevel === "ADVANCED"
      ? ["Google", "Microsoft", "Amazon", "Meta"]
      : skillLevel === "INTERMEDIATE"
        ? ["Microsoft", "Amazon", "Flipkart", "Goldman Sachs"]
        : ["TCS", "Infosys", "Wipro", "Cognizant"];

  return {
    testId,
    score: scored.score,
    correct: scored.correct,
    total: scored.total,
    placementReadiness,
    aptitudeScore: scored.score,
    weakTopics: scored.weakTopics,
    categoryBreakdown: scored.categoryBreakdown,
    results: scored.results,
    recommendations: [
      scored.score < 60
        ? "Practice 45 min daily on weak aptitude topics."
        : "Take 2 timed mocks per week to maintain speed.",
      placementReadiness < 70
        ? "Complete the AI Roadmap for structured preparation."
        : "Add mock interviews and company-specific prep.",
    ],
    roadmapSuggestion: {
      branch: profile?.branch ?? "Computer Science",
      skillLevel,
      studyHoursPerDay: profile?.monthsToPlacement === "< 3" ? 5 : 4,
      targetCompanies: companies,
      skillGaps: scored.weakTopics.slice(0, 5),
      focusAreas:
        scored.score < 50
          ? ["Aptitude fundamentals", "Arrays & Strings"]
          : ["DSA patterns", "Mock interviews"],
    },
  };
}

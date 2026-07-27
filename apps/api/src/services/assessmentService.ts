import { randomUUID } from "crypto";
import {
  pickQuestions,
  scoreAnswers,
  toPublicQuestion,
  APTITUDE_QUESTION_BANK,
  type AptitudeCategory,
  type QuestionBankItem,
} from "../data/aptitudeQuestionBank.js";

export type TestType = "PLACEMENT_READINESS" | "APTITUDE_QUIZ" | "APTITUDE_MOCK" | "FULL_MOCK";

export interface GeneratedTest {
  id: string;
  type: TestType;
  title: string;
  description: string;
  category?: AptitudeCategory;
  durationMinutes: number;
  questionCount: number;
  questions: ReturnType<typeof toPublicQuestion>[];
  createdAt: string;
  profile?: PlacementProfile;
}

export interface PlacementProfile {
  targetRole: string;
  codingLevel: string;
  monthsToPlacement: string;
  branch?: string;
}

export interface TestResult {
  testId: string;
  type: TestType;
  score: number;
  correct: number;
  total: number;
  timeTakenSeconds?: number;
  placementReadiness?: number;
  aptitudeScore?: number;
  codingScore?: number;
  results: ReturnType<typeof scoreAnswers>["results"];
  weakTopics: string[];
  categoryBreakdown: ReturnType<typeof scoreAnswers>["categoryBreakdown"];
  recommendations: string[];
  roadmapSuggestion: {
    branch: string;
    skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    studyHoursPerDay: number;
    targetCompanies: string[];
    skillGaps: string[];
    focusAreas: string[];
  };
  completedAt: string;
}

const testStore = new Map<string, { questions: QuestionBankItem[]; meta: Omit<GeneratedTest, "questions"> }>();
const resultStore = new Map<string, TestResult>();

function profileWeight(profile?: PlacementProfile): number {
  if (!profile) return 50;
  let w = 50;
  if (profile.codingLevel === "Advanced") w += 20;
  else if (profile.codingLevel === "Intermediate") w += 10;
  if (profile.monthsToPlacement === "12+") w += 15;
  else if (profile.monthsToPlacement === "6-12") w += 10;
  else if (profile.monthsToPlacement === "3-6") w += 5;
  if (profile.targetRole === "Software Engineer") w += 5;
  return Math.min(95, w);
}

function deriveSkillLevel(testScore: number, profile?: PlacementProfile): "BEGINNER" | "INTERMEDIATE" | "ADVANCED" {
  const coding = profile?.codingLevel ?? "Beginner";
  if (testScore >= 75 && (coding === "Advanced" || coding === "Intermediate")) return "ADVANCED";
  if (testScore >= 55 || coding === "Intermediate") return "INTERMEDIATE";
  return "BEGINNER";
}

function buildRoadmapSuggestion(
  testScore: number,
  weakTopics: string[],
  profile?: PlacementProfile
): TestResult["roadmapSuggestion"] {
  const skillLevel = deriveSkillLevel(testScore, profile);
  const role = profile?.targetRole ?? "Software Engineer";
  const companies =
    skillLevel === "ADVANCED"
      ? ["Google", "Microsoft", "Amazon", "Meta"]
      : skillLevel === "INTERMEDIATE"
        ? ["Microsoft", "Amazon", "Flipkart", "Goldman Sachs"]
        : ["TCS", "Infosys", "Wipro", "Cognizant", "Capgemini"];

  const studyHours =
    profile?.monthsToPlacement === "< 3" ? 5 : profile?.monthsToPlacement === "3-6" ? 4 : 3;

  const skillGaps = [
    ...weakTopics.slice(0, 4),
    ...(testScore < 60 ? ["Dynamic Programming", "Time Complexity"] : []),
  ].slice(0, 5);

  return {
    branch: profile?.branch ?? "Computer Science",
    skillLevel,
    studyHoursPerDay: studyHours,
    targetCompanies: companies,
    skillGaps: [...new Set(skillGaps)],
    focusAreas:
      testScore < 50
        ? ["Aptitude fundamentals", "Arrays & Strings", "Resume basics"]
        : testScore < 75
          ? ["DSA patterns", "Mock interviews", "System design intro"]
          : ["Advanced DSA", "System design", "Company-specific prep"],
  };
}

export function generatePlacementTest(profile: PlacementProfile): GeneratedTest {
  const quant = pickQuestions({ category: "QUANTITATIVE", count: 5 });
  const logical = pickQuestions({ category: "LOGICAL", count: 4 });
  const verbal = pickQuestions({ category: "VERBAL", count: 3 });
  const coding = pickQuestions({ section: "CODING_MCQ", count: 3 });
  const questions = [...quant, ...logical, ...verbal, ...coding];
  return storeTest("PLACEMENT_READINESS", questions, {
    title: "Placement Readiness Assessment",
    description: "Comprehensive aptitude + coding fundamentals test for campus placement readiness.",
    durationMinutes: 25,
    profile,
  });
}

export function generateAptitudeQuiz(category: AptitudeCategory, count = 10): GeneratedTest {
  const questions = pickQuestions({ category, count });
  const titles: Record<AptitudeCategory, string> = {
    QUANTITATIVE: "Quantitative Aptitude Quiz",
    LOGICAL: "Logical Reasoning Quiz",
    VERBAL: "Verbal Ability Quiz",
  };
  return storeTest("APTITUDE_QUIZ", questions, {
    title: titles[category],
    description: `Timed ${count}-question quiz on ${category.toLowerCase().replace("_", " ")}.`,
    category,
    durationMinutes: Math.ceil(count * 1.5),
  });
}

export function generateAptitudeMock(category?: AptitudeCategory): GeneratedTest {
  const questions = category
    ? [
        ...pickQuestions({ category, count: 12 }),
        ...pickQuestions({ category, count: 3, difficulty: "HARD" }),
      ]
    : [
        ...pickQuestions({ category: "QUANTITATIVE", count: 8 }),
        ...pickQuestions({ category: "LOGICAL", count: 7 }),
        ...pickQuestions({ category: "VERBAL", count: 5 }),
      ];
  return storeTest("APTITUDE_MOCK", questions, {
    title: category ? `${category} Mock Exam` : "Full Aptitude Mock Exam",
    description: "Company-style timed mock with detailed scoring and analytics.",
    category,
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
  return storeTest("FULL_MOCK", questions, {
    title: "Campus Placement Full Mock",
    description: "45-minute full-length placement aptitude mock test.",
    durationMinutes: 45,
  });
}

function storeTest(
  type: TestType,
  questions: QuestionBankItem[],
  opts: {
    title: string;
    description: string;
    durationMinutes: number;
    category?: AptitudeCategory;
    profile?: PlacementProfile;
  }
): GeneratedTest {
  const id = randomUUID();
  const meta = {
    id,
    type,
    title: opts.title,
    description: opts.description,
    category: opts.category,
    durationMinutes: opts.durationMinutes,
    questionCount: questions.length,
    createdAt: new Date().toISOString(),
    profile: opts.profile,
  };
  testStore.set(id, { questions, meta });
  return { ...meta, questions: questions.map(toPublicQuestion) };
}

export function getTest(testId: string): GeneratedTest | null {
  const entry = testStore.get(testId);
  if (!entry) return null;
  return { ...entry.meta, questions: entry.questions.map(toPublicQuestion) };
}

export function submitTest(
  testId: string,
  answers: Record<string, string>,
  timeTakenSeconds?: number
): TestResult | null {
  const entry = testStore.get(testId);
  if (!entry) return null;

  const scored = scoreAnswers(answers);
  const profile = entry.meta.profile;
  const testWeight = 0.7;
  const profileScore = profileWeight(profile);
  const placementReadiness = Math.round(
    scored.score * testWeight + profileScore * (1 - testWeight)
  );

  const codingQuestions = scored.results.filter((r) =>
    entry.questions.find((q) => q.id === r.questionId)?.section === "CODING_MCQ"
  );
  const aptitudeQuestions = scored.results.filter((r) => {
    const q = entry.questions.find((x) => x.id === r.questionId);
    return q && q.section !== "CODING_MCQ";
  });

  const aptitudeScore = aptitudeQuestions.length
    ? Math.round(
        (aptitudeQuestions.filter((r) => r.correct).length / aptitudeQuestions.length) * 100
      )
    : scored.score;
  const codingScore = codingQuestions.length
    ? Math.round((codingQuestions.filter((r) => r.correct).length / codingQuestions.length) * 100)
    : profileScore;

  const recommendations = [
    scored.score < 60
      ? "Spend 45 min daily on aptitude — focus on your weak topics below."
      : "Maintain aptitude practice with 2 timed mocks per week.",
    codingScore < 60
      ? "Strengthen DSA fundamentals: arrays, strings, and time complexity."
      : "Solve 2 medium coding problems daily on PlacePro.",
    `Target role: ${profile?.targetRole ?? "Software Engineer"} — align prep with company patterns.`,
    placementReadiness < 70
      ? "Complete the AI Roadmap for a structured 6-month plan."
      : "You're on track — add mock interviews and company-specific prep.",
  ];

  const result: TestResult = {
    testId,
    type: entry.meta.type,
    score: scored.score,
    correct: scored.correct,
    total: scored.total,
    timeTakenSeconds,
    placementReadiness,
    aptitudeScore,
    codingScore,
    results: scored.results,
    weakTopics: scored.weakTopics,
    categoryBreakdown: scored.categoryBreakdown,
    recommendations,
    roadmapSuggestion: buildRoadmapSuggestion(scored.score, scored.weakTopics, profile),
    completedAt: new Date().toISOString(),
  };

  resultStore.set(testId, result);
  return result;
}

export function getResult(testId: string): TestResult | null {
  return resultStore.get(testId) ?? null;
}

export function listQuestionBank(category?: AptitudeCategory) {
  let pool = APTITUDE_QUESTION_BANK;
  if (category) pool = pool.filter((q) => q.category === category);
  return pool.map(toPublicQuestion);
}

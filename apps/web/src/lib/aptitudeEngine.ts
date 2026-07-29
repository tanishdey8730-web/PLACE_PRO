import {
  pickQuestions,
  scoreAnswers,
  toPublicQuestion,
  CATEGORY_LABELS,
  type AptitudeCategory,
  type QuestionBankItem,
  type TestDifficulty,
} from "@/data/aptitudeQuestionBank";
import {
  MOCKS_BY_ID,
  type MockBlueprintSlice,
  type MockDefinition,
} from "@/data/mockCatalog";
import type { GeneratedTest, TestResult } from "@/components/assessment/test-runner";

export interface PlacementProfile {
  targetRole: string;
  codingLevel: string;
  monthsToPlacement: string;
  branch?: string;
}

export interface CustomMockConfig {
  title?: string;
  numerical: number;
  logical: number;
  verbal: number;
  technical: number;
  difficulty?: TestDifficulty;
  durationMinutes?: number;
  subCategories?: Partial<Record<AptitudeCategory, string | undefined>>;
}

/** Describes how a test was built so an equivalent but fresh paper can be regenerated. */
type TestSpec =
  | { kind: "mock"; mockId: string }
  | { kind: "topic"; category: AptitudeCategory; subCategory?: string; count: number }
  | { kind: "custom"; config: CustomMockConfig }
  | { kind: "placement"; profile: PlacementProfile };

interface StoredTest {
  questions: QuestionBankItem[];
  spec: TestSpec;
  profile?: PlacementProfile;
}

const testStore = new Map<string, StoredTest>();

/** Question ids recently served per spec, so "Try New Mock" surfaces different questions. */
const recentlySeen = new Map<string, string[]>();
const RECENT_MEMORY = 40;

function specKey(spec: TestSpec): string {
  switch (spec.kind) {
    case "mock":
      return `mock:${spec.mockId}`;
    case "topic":
      return `topic:${spec.category}:${spec.subCategory ?? "all"}`;
    case "custom":
      return "custom";
    case "placement":
      return "placement";
  }
}

function rememberQuestions(spec: TestSpec, questions: QuestionBankItem[]) {
  const key = specKey(spec);
  const previous = recentlySeen.get(key) ?? [];
  const merged = [...questions.map((q) => q.id), ...previous].slice(0, RECENT_MEMORY);
  recentlySeen.set(key, merged);
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildFromBlueprint(blueprint: MockBlueprintSlice[], avoidIds: string[]): QuestionBankItem[] {
  const questions: QuestionBankItem[] = [];
  for (const slice of blueprint) {
    const picked = pickQuestions({
      category: slice.category,
      subCategory: slice.subCategory,
      section: slice.section,
      difficulty: slice.difficulty,
      count: slice.count,
      excludeIds: questions.map((q) => q.id),
      avoidIds,
    });
    questions.push(...picked);
  }
  return questions;
}

function storeTest(
  questions: QuestionBankItem[],
  meta: {
    title: string;
    description?: string;
    durationMinutes: number;
    spec: TestSpec;
    profile?: PlacementProfile;
  }
): GeneratedTest {
  const id = newId();
  testStore.set(id, { questions, spec: meta.spec, profile: meta.profile });
  rememberQuestions(meta.spec, questions);
  return {
    id,
    title: meta.title,
    description: meta.description,
    durationMinutes: meta.durationMinutes,
    questionCount: questions.length,
    questions: questions.map(toPublicQuestion),
  };
}

export function generateMock(mock: MockDefinition): GeneratedTest {
  const spec: TestSpec = { kind: "mock", mockId: mock.id };
  const questions = buildFromBlueprint(mock.blueprint, recentlySeen.get(specKey(spec)) ?? []);
  return storeTest(questions, {
    title: mock.title,
    description: mock.description,
    durationMinutes: mock.durationMinutes,
    spec,
  });
}

export function generateMockById(mockId: string): GeneratedTest {
  const mock = MOCKS_BY_ID.get(mockId);
  if (!mock) throw new Error(`Unknown mock: ${mockId}`);
  return generateMock(mock);
}

export function generateTopicQuiz(
  category: AptitudeCategory,
  subCategory?: string,
  count = 10
): GeneratedTest {
  const spec: TestSpec = { kind: "topic", category, subCategory, count };
  const questions = pickQuestions({
    category,
    subCategory,
    section: category === "QUANTITATIVE" ? null : undefined,
    count,
    avoidIds: recentlySeen.get(specKey(spec)) ?? [],
  });
  return storeTest(questions, {
    title: subCategory ? `${subCategory} Practice` : `${CATEGORY_LABELS[category]} Quiz`,
    description: `Timed ${questions.length}-question set`,
    durationMinutes: Math.max(5, Math.ceil(questions.length * 1.5)),
    spec,
  });
}

export function generateCustomMock(config: CustomMockConfig): GeneratedTest {
  const spec: TestSpec = { kind: "custom", config };
  const blueprint: MockBlueprintSlice[] = [];
  if (config.numerical > 0) {
    blueprint.push({
      category: "QUANTITATIVE",
      section: null,
      subCategory: config.subCategories?.QUANTITATIVE,
      difficulty: config.difficulty,
      count: config.numerical,
    });
  }
  if (config.logical > 0) {
    blueprint.push({
      category: "LOGICAL",
      subCategory: config.subCategories?.LOGICAL,
      difficulty: config.difficulty,
      count: config.logical,
    });
  }
  if (config.verbal > 0) {
    blueprint.push({
      category: "VERBAL",
      subCategory: config.subCategories?.VERBAL,
      difficulty: config.difficulty,
      count: config.verbal,
    });
  }
  if (config.technical > 0) {
    blueprint.push({
      section: "CODING_MCQ",
      difficulty: config.difficulty,
      count: config.technical,
    });
  }

  const questions = buildFromBlueprint(blueprint, recentlySeen.get(specKey(spec)) ?? []);
  const total = questions.length;
  return storeTest(questions, {
    title: config.title || "Custom Mock Test",
    description: `${total} questions built from your selection`,
    durationMinutes: config.durationMinutes ?? Math.max(5, Math.ceil(total * 1.5)),
    spec,
  });
}

export function generatePlacementTest(profile: PlacementProfile): GeneratedTest {
  const spec: TestSpec = { kind: "placement", profile };
  const hard = profile.codingLevel === "Advanced";
  const questions = buildFromBlueprint(
    [
      { category: "QUANTITATIVE", section: null, count: 5, difficulty: hard ? "HARD" : undefined },
      { category: "LOGICAL", count: 4, difficulty: hard ? "HARD" : undefined },
      { category: "VERBAL", count: 3 },
      { section: "CODING_MCQ", count: 3 },
    ],
    recentlySeen.get(specKey(spec)) ?? []
  );
  return storeTest(questions, {
    title: "Placement Readiness Assessment",
    description: "Personalized aptitude and coding fundamentals test",
    durationMinutes: 25,
    spec,
    profile,
  });
}

/** Rebuilds an equivalent paper with a fresh set of questions. */
export function regenerateTest(testId: string): GeneratedTest | null {
  const entry = testStore.get(testId);
  if (!entry) return null;
  switch (entry.spec.kind) {
    case "mock":
      return generateMockById(entry.spec.mockId);
    case "topic":
      return generateTopicQuiz(entry.spec.category, entry.spec.subCategory, entry.spec.count);
    case "custom":
      return generateCustomMock(entry.spec.config);
    case "placement":
      return generatePlacementTest(entry.spec.profile);
  }
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

  const recommendations = [
    scored.score < 60
      ? "Practice 45 minutes daily on your weakest aptitude topics."
      : "Take two timed mocks per week to maintain speed and accuracy.",
    placementReadiness < 70
      ? "Follow the AI Roadmap for a structured preparation plan."
      : "Add mock interviews and company-specific preparation.",
  ];
  if (scored.weakTopics.length) {
    recommendations.push(
      `Start with these topics: ${scored.weakTopics.slice(0, 3).join(", ")}.`
    );
  }
  if (timeTakenSeconds != null && scored.total > 0) {
    const perQuestion = Math.round(timeTakenSeconds / scored.total);
    recommendations.push(
      perQuestion > 90
        ? `You averaged ${perQuestion}s per question — try a Speed Sprint to build pace.`
        : `Good pace at ${perQuestion}s per question. Keep practising under timed conditions.`
    );
  }

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
    recommendations,
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

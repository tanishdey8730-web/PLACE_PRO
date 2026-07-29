import { QUANTITATIVE_QUESTIONS, QUANTITATIVE_TOPICS } from "./questions/quantitative";
import { LOGICAL_QUESTIONS, LOGICAL_TOPICS } from "./questions/logical";
import { VERBAL_QUESTIONS, VERBAL_TOPICS } from "./questions/verbal";
import { CODING_MCQ_QUESTIONS, CODING_MCQ_TOPICS } from "./questions/codingMcq";
import type { AptitudeCategory, QuestionBankItem, TestDifficulty } from "./questions/types";

export type { AptitudeCategory, QuestionBankItem, TestDifficulty, QuestionSection } from "./questions/types";

export const APTITUDE_QUESTION_BANK: QuestionBankItem[] = [
  ...QUANTITATIVE_QUESTIONS,
  ...LOGICAL_QUESTIONS,
  ...VERBAL_QUESTIONS,
  ...CODING_MCQ_QUESTIONS,
];

const QUESTIONS_BY_ID = new Map(APTITUDE_QUESTION_BANK.map((q) => [q.id, q]));

export const CATEGORY_TOPICS: Record<AptitudeCategory, readonly string[]> = {
  QUANTITATIVE: QUANTITATIVE_TOPICS,
  LOGICAL: LOGICAL_TOPICS,
  VERBAL: VERBAL_TOPICS,
};

export const CODING_TOPICS = CODING_MCQ_TOPICS;

export const CATEGORY_LABELS: Record<AptitudeCategory, string> = {
  QUANTITATIVE: "Numerical Ability",
  LOGICAL: "Logical Ability",
  VERBAL: "Verbal Ability",
};

export function countQuestions(filters: {
  category?: AptitudeCategory;
  subCategory?: string;
  section?: string | null;
  difficulty?: TestDifficulty;
} = {}): number {
  return filterPool(filters).length;
}

function filterPool(filters: {
  category?: AptitudeCategory;
  subCategory?: string;
  section?: string | null;
  difficulty?: TestDifficulty;
  excludeIds?: string[];
}): QuestionBankItem[] {
  let pool = APTITUDE_QUESTION_BANK;
  if (filters.category) pool = pool.filter((q) => q.category === filters.category);
  if (filters.subCategory) pool = pool.filter((q) => q.subCategory === filters.subCategory);
  if (filters.section === null) pool = pool.filter((q) => !q.section);
  else if (filters.section) pool = pool.filter((q) => q.section === filters.section);
  if (filters.difficulty) pool = pool.filter((q) => q.difficulty === filters.difficulty);
  if (filters.excludeIds?.length) {
    const excluded = new Set(filters.excludeIds);
    pool = pool.filter((q) => !excluded.has(q.id));
  }
  return pool;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks questions matching the filters. When the filtered pool is smaller than the
 * requested count, the selection is topped up by progressively relaxing difficulty,
 * sub-topic and finally the "recently seen" preference, so a generated paper always
 * reaches the promised question count.
 *
 * `excludeIds` is a hard exclusion (used to avoid duplicates inside one paper) while
 * `avoidIds` is a soft preference (questions the learner has just seen).
 */
export function pickQuestions(filters: {
  category?: AptitudeCategory;
  subCategory?: string;
  section?: string | null;
  difficulty?: TestDifficulty;
  count: number;
  excludeIds?: string[];
  avoidIds?: string[];
}): QuestionBankItem[] {
  const chosen: QuestionBankItem[] = [];
  const used = new Set(filters.excludeIds ?? []);
  const avoided = filters.avoidIds ?? [];

  const widen = (base: typeof filters) => [
    { ...base },
    { ...base, difficulty: undefined },
    { ...base, difficulty: undefined, subCategory: undefined },
    { ...base, difficulty: undefined, subCategory: undefined, section: undefined },
  ];

  const passes = [
    ...widen({ ...filters, excludeIds: [...used, ...avoided] }),
    ...widen(filters),
  ];

  for (const pass of passes) {
    if (chosen.length >= filters.count) break;
    const pool = shuffle(
      filterPool({ ...pass, excludeIds: [...new Set([...used, ...(pass.excludeIds ?? [])])] })
    );
    for (const q of pool) {
      if (chosen.length >= filters.count) break;
      chosen.push(q);
      used.add(q.id);
    }
  }

  return chosen;
}

export function toPublicQuestion(q: QuestionBankItem) {
  return {
    id: q.id,
    category: q.category,
    subCategory: q.subCategory,
    section: q.section,
    question: q.question,
    options: shuffle(q.options),
    difficulty: q.difficulty,
  };
}

export function scoreAnswers(answers: Record<string, string>): {
  score: number;
  correct: number;
  total: number;
  results: {
    questionId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    subCategory: string;
    category: string;
  }[];
  weakTopics: string[];
  categoryBreakdown: Record<string, { correct: number; total: number; percent: number }>;
} {
  const results = Object.entries(answers).map(([questionId, userAnswer]) => {
    const q = QUESTIONS_BY_ID.get(questionId);
    if (!q) {
      return {
        questionId,
        correct: false,
        userAnswer,
        correctAnswer: "",
        explanation: "",
        subCategory: "Unknown",
        category: "UNKNOWN",
      };
    }
    return {
      questionId,
      correct: userAnswer === q.correctAnswer,
      userAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      subCategory: q.subCategory,
      category: q.section === "CODING_MCQ" ? "TECHNICAL" : q.category,
    };
  });

  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const score = total ? Math.round((correct / total) * 1000) / 10 : 0;

  const categoryBreakdown: Record<string, { correct: number; total: number; percent: number }> = {};
  for (const r of results) {
    if (!categoryBreakdown[r.category]) {
      categoryBreakdown[r.category] = { correct: 0, total: 0, percent: 0 };
    }
    categoryBreakdown[r.category].total++;
    if (r.correct) categoryBreakdown[r.category].correct++;
  }
  for (const cat of Object.keys(categoryBreakdown)) {
    const b = categoryBreakdown[cat];
    b.percent = b.total ? Math.round((b.correct / b.total) * 100) : 0;
  }

  const weakTopics = [
    ...new Set(results.filter((r) => !r.correct && r.subCategory).map((r) => r.subCategory)),
  ];

  return { score, correct, total, results, weakTopics, categoryBreakdown };
}

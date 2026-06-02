import { randomBytes } from "crypto";
import type { DailyChallengeItem, DailyChallengeType } from "@placepro/shared";
import type { UserChallengeContext as Ctx } from "./dailyChallengeContext.js";

type StoredChallenge = DailyChallengeItem & { correctAnswer?: string };

function cid(): string {
  return randomBytes(6).toString("hex");
}

const DSA_TEMPLATES: Record<
  string,
  { title: string; prompt: string; difficulty: string; hints: string[] }
> = {
  Arrays: {
    title: "Subarray with Target Sum",
    difficulty: "MEDIUM",
    prompt:
      "Given an array of non-negative integers and a target sum, determine if there exists a contiguous subarray that sums to the target. Optimize beyond O(n²).",
    hints: ["Use prefix sums or sliding window", "Handle zeros carefully"],
  },
  "Linked List": {
    title: "Detect Cycle in Linked List",
    difficulty: "EASY",
    prompt:
      "Given the head of a linked list, return true if the list has a cycle. Solve in O(n) time and O(1) space.",
    hints: ["Floyd's tortoise and hare", "Track visited nodes with two pointers"],
  },
  Graphs: {
    title: "Number of Islands",
    difficulty: "MEDIUM",
    prompt:
      "Given a 2D grid of '1' (land) and '0' (water), count the number of islands. An island is surrounded by water.",
    hints: ["DFS or BFS from each unvisited land cell", "Mark visited cells"],
  },
  "Dynamic Programming": {
    title: "House Robber",
    difficulty: "MEDIUM",
    prompt:
      "You are a robber planning to rob houses along a street. Adjacent houses have security systems. Maximize money without alerting police.",
    hints: ["dp[i] = max(dp[i-1], nums[i] + dp[i-2])", "Can optimize space to O(1)"],
  },
  Trees: {
    title: "Maximum Depth of Binary Tree",
    difficulty: "EASY",
    prompt: "Given the root of a binary tree, return its maximum depth.",
    hints: ["Recursive: 1 + max(left, right)", "Iterative BFS level order"],
  },
  Strings: {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM",
    prompt: "Given a string s, find the length of the longest substring without duplicate characters.",
    hints: ["Sliding window with hash map", "Shrink window when duplicate found"],
  },
};

const APTITUDE_TEMPLATES = [
  {
    topic: "Quantitative Aptitude",
    question: "A train 120m long passes a pole in 8 seconds. Find its speed in km/h.",
    options: ["54", "45", "60", "72"],
    correctAnswer: "54",
    difficulty: "MEDIUM",
  },
  {
    topic: "Logical Reasoning",
    question: "If all bloops are razzies and all razzies are lazzies, which must be true?",
    options: [
      "All bloops are lazzies",
      "All lazzies are bloops",
      "Some lazzies are not razzies",
      "No bloops are lazzies",
    ],
    correctAnswer: "All bloops are lazzies",
    difficulty: "EASY",
  },
  {
    topic: "Data Interpretation",
    question:
      "Sales rose 20% in Q1 and fell 10% in Q2. Net change over both quarters on base 100 is closest to:",
    options: ["8% increase", "10% increase", "8% decrease", "12% increase"],
    correctAnswer: "8% increase",
    difficulty: "MEDIUM",
  },
];

const INTERVIEW_TEMPLATES = [
  {
    topic: "Technical",
    question:
      "Explain the difference between process and thread. When would you prefer multithreading over multiprocessing?",
    difficulty: "MEDIUM",
  },
  {
    topic: "HR",
    question:
      "Tell me about a time you failed on a project. What did you learn and how did you recover?",
    difficulty: "EASY",
  },
  {
    topic: "DSA Discussion",
    question:
      "How would you design a URL shortener? Cover API, storage, and scaling for 1M users.",
    difficulty: "HARD",
  },
];

function pickTopic(weakTopics: string[], index: number): string {
  return weakTopics[index % weakTopics.length] ?? "General";
}

export function generateLocalDailyChallenges(ctx: Ctx): {
  challenges: StoredChallenge[];
  answerKey: Record<string, string>;
  summary: string;
} {
  const challenges: StoredChallenge[] = [];
  const answerKey: Record<string, string> = {};

  const dsaTopics = ctx.weakTopics.filter((t) =>
    /array|linked|graph|tree|dp|dynamic|string|stack|queue/i.test(t)
  );
  const dsaPool = dsaTopics.length ? dsaTopics : ["Arrays", "Dynamic Programming", "Graphs"];

  for (let i = 0; i < 2; i++) {
    const topic = pickTopic(dsaPool, i);
    const key = Object.keys(DSA_TEMPLATES).find((k) =>
      topic.toLowerCase().includes(k.toLowerCase().split(" ")[0]!)
    );
    const tmpl = DSA_TEMPLATES[key ?? "Arrays"]!;
    const id = cid();
    challenges.push({
      id,
      type: "dsa",
      topic,
      difficulty: tmpl.difficulty,
      title: tmpl.title,
      prompt: tmpl.prompt,
      hints: tmpl.hints,
      estimatedMinutes: 25,
      codingSlug: i === 0 ? "two-sum" : undefined,
      completed: false,
    });
  }

  for (let i = 0; i < 2; i++) {
    const tmpl = APTITUDE_TEMPLATES[i % APTITUDE_TEMPLATES.length]!;
    const id = cid();
    answerKey[id] = tmpl.correctAnswer;
    challenges.push({
      id,
      type: "aptitude",
      topic: tmpl.topic,
      difficulty: tmpl.difficulty,
      title: `Aptitude: ${tmpl.topic}`,
      prompt: tmpl.question,
      options: tmpl.options,
      hints: ["Eliminate extreme options first", "Write given values clearly"],
      estimatedMinutes: 3,
      correctAnswer: tmpl.correctAnswer,
      completed: false,
    });
  }

  for (let i = 0; i < 2; i++) {
    const tmpl = INTERVIEW_TEMPLATES[i % INTERVIEW_TEMPLATES.length]!;
    const id = cid();
    challenges.push({
      id,
      type: "interview",
      topic: tmpl.topic,
      difficulty: tmpl.difficulty,
      title: `Interview: ${tmpl.topic}`,
      prompt: tmpl.question,
      hints: ["Use STAR for behavioral", "Structure technical answers"],
      estimatedMinutes: 8,
      completed: false,
    });
  }

  const summary = `Today's pack targets ${ctx.weakTopics.slice(0, 3).join(", ")} for your ${ctx.placementGoalLabel} goal. Complete all ${challenges.length} challenges to maximize placement readiness.`;

  return { challenges, answerKey, summary };
}

export function normalizeAiDailyChallenges(
  raw: Record<string, unknown>,
  ctx: Ctx
): { challenges: StoredChallenge[]; answerKey: Record<string, string>; summary: string } {
  const list = (raw.challenges ?? raw.items) as unknown[];
  if (!Array.isArray(list) || list.length === 0) {
    return generateLocalDailyChallenges(ctx);
  }

  const challenges: StoredChallenge[] = [];
  const answerKey: Record<string, string> = {};

  for (const item of list.slice(0, 8)) {
    const o = item as Record<string, unknown>;
    const type = String(o.type ?? "dsa").toLowerCase() as DailyChallengeType;
    if (!["dsa", "aptitude", "interview"].includes(type)) continue;

    const id = String(o.id ?? cid());
    const correct = o.correct_answer ?? o.correctAnswer;
    if (correct) answerKey[id] = String(correct);

    challenges.push({
      id,
      type,
      topic: String(o.topic ?? "General"),
      difficulty: String(o.difficulty ?? "MEDIUM"),
      title: String(o.title ?? "Daily Challenge"),
      prompt: String(o.prompt ?? o.question ?? ""),
      options: Array.isArray(o.options) ? o.options.map(String) : undefined,
      hints: Array.isArray(o.hints) ? o.hints.map(String) : undefined,
      estimatedMinutes: typeof o.estimated_minutes === "number" ? o.estimated_minutes : 10,
      codingSlug: o.coding_slug ? String(o.coding_slug) : undefined,
      correctAnswer: correct ? String(correct) : undefined,
      completed: false,
    });
  }

  if (challenges.length < 4) {
    return generateLocalDailyChallenges(ctx);
  }

  return {
    challenges,
    answerKey,
    summary: String(raw.summary ?? `Personalized challenges for ${ctx.placementGoalLabel}.`),
  };
}

export function stripAnswersForClient(
  challenges: DailyChallengeItem[]
): DailyChallengeItem[] {
  return challenges.map((c) => {
    const { ...rest } = c as DailyChallengeItem & { correctAnswer?: string };
    return rest;
  });
}

export type { StoredChallenge };

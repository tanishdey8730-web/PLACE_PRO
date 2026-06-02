import { prisma } from "@placepro/database";
import type { DailyChallengeProgressSnapshot, PlacementGoal } from "@placepro/shared";
import { PLACEMENT_GOALS } from "@placepro/shared";
import { dashboardStats } from "../demo/responses.js";

export interface UserChallengeContext {
  placementGoal: PlacementGoal;
  placementGoalLabel: string;
  weakTopics: string[];
  progress: DailyChallengeProgressSnapshot;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export { todayDateString };

export function placementGoalLabel(goal: PlacementGoal): string {
  return PLACEMENT_GOALS.find((g) => g.id === goal)?.label ?? "General placement prep";
}

export async function buildUserChallengeContext(
  userId: string,
  isGuest: boolean,
  overrideGoal?: PlacementGoal,
  overrideWeak?: string[]
): Promise<UserChallengeContext> {
  if (isGuest) {
    const goal = overrideGoal ?? "product_company";
    return {
      placementGoal: goal,
      placementGoalLabel: placementGoalLabel(goal),
      weakTopics: overrideWeak ?? dashboardStats.skillGaps,
      progress: {
        codingScore: dashboardStats.codingScore,
        aptitudeScore: dashboardStats.aptitudeScore,
        interviewScore: dashboardStats.interviewScore,
        placementReadiness: dashboardStats.placementReadiness,
        dailyStreak: dashboardStats.dailyStreak,
        recentSolvedCategories: ["ARRAYS"],
        weakCategories: dashboardStats.skillGaps,
      },
    };
  }

  const [profile, streak, roadmap, submissions, aptitudeAttempts] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.placementRoadmap.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.submission.findMany({
      where: { userId },
      take: 40,
      orderBy: { createdAt: "desc" },
      include: { problem: { select: { category: true, difficulty: true, title: true } } },
    }),
    prisma.aptitudeAttempt.findMany({
      where: { userId },
      take: 20,
      orderBy: { completedAt: "desc" },
    }),
  ]);

  const categoryFails = new Map<string, number>();
  const categoryAttempts = new Map<string, number>();
  const solvedCategories = new Set<string>();

  for (const sub of submissions) {
    const cat = sub.problem.category;
    categoryAttempts.set(cat, (categoryAttempts.get(cat) ?? 0) + 1);
    if (sub.status === "ACCEPTED") {
      solvedCategories.add(cat);
    } else {
      categoryFails.set(cat, (categoryFails.get(cat) ?? 0) + 1);
    }
  }

  const weakFromCoding = [...categoryFails.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat]) => cat.replace(/_/g, " "));

  const codingScore = profile?.codingScore ?? 0;
  const aptitudeScore = profile?.aptitudeScore ?? 0;
  const interviewScore = profile?.interviewScore ?? 0;

  const weakTopics: string[] = [...(overrideWeak ?? [])];

  if (weakFromCoding.length) weakTopics.push(...weakFromCoding);
  if (codingScore < 60) weakTopics.push("Dynamic Programming", "Graphs");
  if (aptitudeScore < 65) weakTopics.push("Quantitative Aptitude", "Logical Reasoning");
  if (interviewScore < 60) weakTopics.push("HR Interview", "Technical Communication");

  const uniqueWeak = [...new Set(weakTopics.map((t) => t.trim()).filter(Boolean))].slice(0, 6);
  if (uniqueWeak.length === 0) {
    uniqueWeak.push("Arrays", "Linked List", "Aptitude", "Interview Prep");
  }

  let placementGoal: PlacementGoal = overrideGoal ?? "general";
  if (!overrideGoal && roadmap?.targetCompanies?.length) {
    const companies = roadmap.targetCompanies.join(" ").toLowerCase();
    if (/google|meta|amazon|microsoft|apple|netflix/.test(companies)) {
      placementGoal = "faang";
    } else if (/infosys|tcs|wipro|cognizant|accenture/.test(companies)) {
      placementGoal = "service_company";
    } else {
      placementGoal = "product_company";
    }
  }

  const placementReadiness = Math.round((codingScore + aptitudeScore + interviewScore) / 3);

  const progress: DailyChallengeProgressSnapshot = {
    codingScore,
    aptitudeScore,
    interviewScore,
    placementReadiness,
    dailyStreak: streak?.currentStreak ?? 0,
    recentSolvedCategories: [...solvedCategories].slice(0, 5),
    weakCategories: uniqueWeak,
  };

  return {
    placementGoal,
    placementGoalLabel: placementGoalLabel(placementGoal),
    weakTopics: uniqueWeak,
    progress,
  };
}

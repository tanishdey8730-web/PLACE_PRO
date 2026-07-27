import { prisma } from "@placepro/database";
import type { AnalyticsDashboard } from "@placepro/shared";

export async function buildAnalyticsDashboard(userId: string): Promise<AnalyticsDashboard> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  const streak = await prisma.streak.findUnique({ where: { userId } });

  const [accepted, attempted, totalProblems, aptitudeAttempts, mockInterviews, resumeRows] =
    await Promise.all([
      prisma.submission.count({ where: { userId, status: "ACCEPTED" } }),
      prisma.submission.count({
        where: { userId, status: { not: "ACCEPTED" } },
      }),
      prisma.codingProblem.count({ where: { isPublished: true } }),
      prisma.aptitudeAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { score: true },
      }),
      prisma.mockInterview.findMany({
        where: { userId },
        select: { technicalScore: true, communication: true },
      }),
      prisma.resume.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { atsScore: true },
      }),
    ]);

  const todo = Math.max(0, totalProblems - accepted - attempted);
  const placementReadiness = profile?.placementReadiness ?? 0;
  const codingScore = profile?.codingScore ?? Math.min(100, accepted * 2);
  const aptitudeScore =
    profile?.aptitudeScore ??
    (aptitudeAttempts.length
      ? Math.round(
          aptitudeAttempts.reduce((s, a) => s + (a.score ?? 0), 0) / aptitudeAttempts.length
        )
      : 0);
  const interviewScore =
    profile?.interviewScore ??
    (mockInterviews.length
      ? Math.round(
          mockInterviews.reduce(
            (s, m) => s + ((m.technicalScore ?? 0) + (m.communication ?? 0)) / 2,
            0
          ) / mockInterviews.length
        )
      : 0);
  const resumeScore = profile?.resumeAtsScore ?? resumeRows[0]?.atsScore ?? 0;

  const skillRadar = [
    { subject: "Arrays", score: Math.min(100, codingScore + 10) },
    { subject: "Strings", score: Math.min(100, codingScore) },
    { subject: "Trees", score: Math.min(100, codingScore - 15) },
    { subject: "Graphs", score: Math.min(100, codingScore - 25) },
    { subject: "DP", score: Math.min(100, codingScore - 30) },
    { subject: "Aptitude", score: aptitudeScore },
  ];

  const weeks = 5;
  const readinessTrend = Array.from({ length: weeks }, (_, i) => ({
    week: `W${i + 1}`,
    score: Math.min(100, Math.round(placementReadiness * ((i + 1) / weeks))),
  }));

  const activityDays = streak?.longestStreak ?? 7;
  const activityHeatmap = Array.from({ length: 28 }, (_, i) => ({
    day: `D${i + 1}`,
    count: i < activityDays ? (i % 4) + 1 : 0,
  }));

  const interviewSuccessRate =
    mockInterviews.length > 0
      ? Math.round(
          (mockInterviews.filter(
            (m) => ((m.technicalScore ?? 0) + (m.communication ?? 0)) / 2 >= 70
          ).length /
            mockInterviews.length) *
            100
        )
      : 0;

  return {
    placementReadiness,
    codingScore,
    aptitudeScore,
    interviewScore,
    resumeScore,
    skillRadar,
    problemStatus: [
      { name: "Solved", value: accepted, color: "#3b82f6" },
      { name: "Attempted", value: attempted, color: "#8b5cf6" },
      { name: "Todo", value: todo, color: "#374151" },
    ],
    readinessTrend,
    activityHeatmap,
    interviewSuccessRate,
    skillGrowth: [
      { skill: "DSA", delta: Math.min(20, accepted) },
      { skill: "Aptitude", delta: Math.min(15, aptitudeScore / 5) },
      { skill: "Interviews", delta: Math.min(12, interviewScore / 6) },
    ],
  };
}

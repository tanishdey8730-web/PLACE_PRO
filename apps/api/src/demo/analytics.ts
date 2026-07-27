import type { AnalyticsDashboard } from "@placepro/shared";

export const demoAnalyticsDashboard: AnalyticsDashboard = {
  placementReadiness: 72,
  codingScore: 68,
  aptitudeScore: 75,
  interviewScore: 62,
  resumeScore: 78,
  skillRadar: [
    { subject: "Arrays", score: 85 },
    { subject: "Strings", score: 78 },
    { subject: "Trees", score: 55 },
    { subject: "Graphs", score: 45 },
    { subject: "DP", score: 40 },
    { subject: "Aptitude", score: 75 },
  ],
  problemStatus: [
    { name: "Solved", value: 45, color: "#3b82f6" },
    { name: "Attempted", value: 30, color: "#8b5cf6" },
    { name: "Todo", value: 125, color: "#374151" },
  ],
  readinessTrend: [
    { week: "W1", score: 40 },
    { week: "W2", score: 52 },
    { week: "W3", score: 58 },
    { week: "W4", score: 65 },
    { week: "W5", score: 72 },
  ],
  activityHeatmap: Array.from({ length: 28 }, (_, i) => ({
    day: `D${i + 1}`,
    count: [0, 1, 2, 3, 2, 1, 0][i % 7],
  })),
  interviewSuccessRate: 58,
  skillGrowth: [
    { skill: "DSA", delta: 12 },
    { skill: "Aptitude", delta: 8 },
    { skill: "System Design", delta: 5 },
  ],
};

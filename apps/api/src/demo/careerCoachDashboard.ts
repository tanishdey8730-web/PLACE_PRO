import type { CareerCoachDashboard } from "@placepro/shared";

export const demoCareerCoachDashboard: CareerCoachDashboard = {
  careerScore: 74,
  placementProbability: 68,
  industryReadinessScore: 71,
  skillRadar: [
    { subject: "DSA", score: 72 },
    { subject: "Projects", score: 80 },
    { subject: "Aptitude", score: 68 },
    { subject: "Communication", score: 65 },
    { subject: "Resume", score: 78 },
    { subject: "System Design", score: 45 },
  ],
  growthGraph: [
    { week: "W1", score: 48 },
    { week: "W2", score: 55 },
    { week: "W3", score: 61 },
    { week: "W4", score: 68 },
    { week: "W5", score: 74 },
  ],
  weeklyProgress: [
    { week: "W1", tasksCompleted: 12, hoursSpent: 18 },
    { week: "W2", tasksCompleted: 15, hoursSpent: 22 },
    { week: "W3", tasksCompleted: 14, hoursSpent: 20 },
    { week: "W4", tasksCompleted: 18, hoursSpent: 24 },
  ],
  strengths: ["Strong project portfolio", "Consistent DSA practice", "Good resume ATS score"],
  weaknesses: ["System design depth", "Graph algorithms", "Mock interview confidence"],
  missingSkills: ["Kubernetes", "System Design", "Advanced DP"],
  recommendedRoles: ["Backend Engineer", "Full Stack Developer", "SDE-1"],
  salaryRange: { minLpa: 10, maxLpa: 18, medianLpa: 13.5 },
  learningRecommendations: [
    "Complete 40 medium LeetCode problems in 30 days",
    "Build one distributed systems capstone project",
    "Weekly aptitude mock tests",
  ],
  improvementSuggestions: [
    "Schedule 2 mock interviews per week",
    "Add quantified metrics to resume bullets",
    "Focus on graph + DP patterns for product companies",
  ],
  roadmaps: {
    days30: [
      {
        week: "Week 1–2",
        focus: "DSA foundations + resume polish",
        tasks: ["Arrays/strings daily", "Update resume keywords", "2 aptitude mocks"],
        milestones: ["50 easy problems", "Resume score 80+"],
      },
      {
        week: "Week 3–4",
        focus: "Medium problems + company research",
        tasks: ["Trees/graphs intro", "Company prep Google/Amazon", "1 mock interview"],
        milestones: ["20 medium problems", "Complete 1 company checklist"],
      },
    ],
    days60: [
      {
        week: "Month 1",
        focus: "Core DSA + aptitude",
        tasks: ["Daily coding", "Aptitude drills", "Project documentation"],
        milestones: ["100 problems solved"],
      },
      {
        week: "Month 2",
        focus: "System design basics + mocks",
        tasks: ["SD fundamentals", "Weekly mocks", "Apply to 10 companies"],
        milestones: ["2 mock interviews", "Placement tracker active"],
      },
    ],
    days90: [
      {
        week: "Month 1",
        focus: "Skill building",
        tasks: ["DSA track", "Aptitude", "Resume v2"],
        milestones: ["Readiness 60+"],
      },
      {
        week: "Month 2",
        focus: "Interview readiness",
        tasks: ["Company-specific prep", "HR mocks", "Networking outreach"],
        milestones: ["5 OA attempts"],
      },
      {
        week: "Month 3",
        focus: "Placement drives",
        tasks: ["Daily applications", "Follow-ups", "Offer negotiation prep"],
        milestones: ["Readiness 75+", "2+ interview pipelines"],
      },
    ],
  },
};

export const demoRoadmapPlan = {
  summary:
    "Demo placement roadmap — explore DSA, aptitude, system design, and interview prep on a 6-month timeline.",
  timeline_months: 6,
  adaptive_tips: [
    "Complete daily tasks consistently to unlock adaptive plan adjustments.",
    "Focus extra hours on your weakest category each week.",
  ],
  categories: {
    DSA: { priority: "high", weekly_hours: 12, focus_topics: ["Arrays", "Trees", "DP"] },
    APTITUDE: { priority: "high", weekly_hours: 6, focus_topics: ["Quant", "Logical"] },
    SYSTEM_DESIGN: { priority: "medium", weekly_hours: 4, focus_topics: ["Scalability", "Caching"] },
    CORE_SUBJECTS: { priority: "medium", weekly_hours: 5, focus_topics: ["OS", "DBMS"] },
    PROJECTS: { priority: "medium", weekly_hours: 4, focus_topics: ["Portfolio app"] },
    RESUME_BUILDING: { priority: "medium", weekly_hours: 2, focus_topics: ["ATS", "Metrics"] },
  },
  monthly_goals: [
    { month: 1, title: "DSA foundations", categories: ["DSA", "APTITUDE"], targets: ["40 easy problems"] },
    { month: 2, title: "Core subjects", categories: ["CORE_SUBJECTS", "DSA"], targets: ["OS/DBMS revision"] },
  ],
  weekly_milestones: [
    { week: 1, title: "Arrays & Strings", categories: ["DSA"], hours: 21, deliverable: "10 problems solved" },
    { week: 2, title: "Trees & Graphs", categories: ["DSA"], hours: 21, deliverable: "8 medium problems" },
  ],
  daily_tasks: [
    {
      id: "day-1",
      day: 1,
      category: "DSA",
      title: "Arrays — two-pointer patterns",
      duration_minutes: 90,
      description: "Solve 2 easy + 1 medium array problems.",
    },
    {
      id: "day-2",
      day: 2,
      category: "APTITUDE",
      title: "Quantitative aptitude drill",
      duration_minutes: 60,
      description: "20 questions timed — review mistakes.",
    },
    {
      id: "day-3",
      day: 3,
      category: "CORE_SUBJECTS",
      title: "OS — processes & threads",
      duration_minutes: 60,
      description: "Read notes + 10 conceptual MCQs.",
    },
  ],
  target_companies: ["Google", "Microsoft", "Amazon"],
  skill_gaps: ["Dynamic Programming", "System Design"],
};

export const demoRoadmapRecord = {
  id: "demo-roadmap",
  userId: "demo-guest",
  branch: "Computer Science",
  graduationYear: 2026,
  skillLevel: "INTERMEDIATE",
  targetCompanies: ["Google", "Microsoft", "Amazon"],
  studyHoursPerDay: 3,
  plan: demoRoadmapPlan,
  progressPercent: 33.3,
  adaptiveNotes: null as string | null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completedTasks: [] as { taskKey: string; category: string | null; completedAt: string }[],
};

demoRoadmapRecord.completedTasks.push({
  taskKey: "day-1",
  category: "DSA",
  completedAt: new Date().toISOString(),
});

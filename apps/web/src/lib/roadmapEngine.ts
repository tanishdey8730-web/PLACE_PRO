import type {
  PlacementRoadmapPlan,
  PlacementRoadmapRecord,
  RoadmapCategory,
  RoadmapGenerateInput,
  RoadmapSkillLevel,
} from "@placepro/shared";

const STORAGE_KEY = "placepro_roadmap";

const DAILY_TEMPLATES: {
  category: RoadmapCategory;
  title: string;
  description: string;
  duration: number;
}[] = [
  { category: "DSA", title: "Arrays & two-pointer patterns", description: "Solve 2 easy + 1 medium array problems.", duration: 90 },
  { category: "APTITUDE", title: "Quantitative aptitude drill", description: "20 timed questions — review mistakes.", duration: 60 },
  { category: "CORE_SUBJECTS", title: "OS — processes & threads", description: "Read notes + 10 conceptual MCQs.", duration: 60 },
  { category: "DSA", title: "Strings & hashing", description: "Solve 3 string problems on LeetCode/PlacePro.", duration: 75 },
  { category: "APTITUDE", title: "Logical reasoning set", description: "15 puzzles and seating arrangement questions.", duration: 45 },
  { category: "DSA", title: "Linked lists & stacks", description: "Reverse list, valid parentheses, min stack.", duration: 90 },
  { category: "RESUME_BUILDING", title: "Resume ATS optimization", description: "Add metrics, keywords, and run ATS analyzer.", duration: 45 },
  { category: "DSA", title: "Trees — BFS & DFS", description: "Level order, max depth, path sum problems.", duration: 90 },
  { category: "APTITUDE", title: "Verbal ability practice", description: "Reading comprehension + grammar MCQs.", duration: 40 },
  { category: "CORE_SUBJECTS", title: "DBMS — normalization & SQL", description: "Revise 1NF-3NF, write 5 SQL queries.", duration: 60 },
  { category: "DSA", title: "Binary search patterns", description: "Search in rotated array, lower bound variants.", duration: 75 },
  { category: "PROJECTS", title: "Portfolio project sprint", description: "Add one feature with README and deployment.", duration: 120 },
  { category: "DSA", title: "Graphs — BFS/DFS", description: "Number of islands, shortest path basics.", duration: 90 },
  { category: "APTITUDE", title: "Full aptitude mock (30 min)", description: "Timed mock on PlacePro aptitude module.", duration: 30 },
  { category: "SYSTEM_DESIGN", title: "System design fundamentals", description: "URL shortener case study + scalability notes.", duration: 75 },
  { category: "DSA", title: "Dynamic programming intro", description: "Fibonacci, climbing stairs, coin change.", duration: 90 },
  { category: "CORE_SUBJECTS", title: "Computer networks", description: "TCP vs UDP, HTTP, DNS revision.", duration: 50 },
  { category: "DSA", title: "Greedy algorithms", description: "Activity selection, interval scheduling.", duration: 75 },
  { category: "RESUME_BUILDING", title: "LinkedIn profile update", description: "Headline, summary, project links.", duration: 40 },
  { category: "DSA", title: "Mock coding contest", description: "Join weekly PlacePro coding contest.", duration: 120 },
  { category: "APTITUDE", title: "Company-specific aptitude", description: "Practice TCS/Infosys pattern questions.", duration: 60 },
];

function skillGapsFor(level: RoadmapSkillLevel): string[] {
  if (level === "BEGINNER") return ["Arrays & Strings", "Aptitude speed", "Resume basics", "Time complexity"];
  if (level === "INTERMEDIATE") return ["Dynamic Programming", "System Design", "Graph algorithms"];
  return ["Advanced DP", "Distributed systems", "Leadership stories"];
}

function timelineMonths(level: RoadmapSkillLevel, hours: number): number {
  if (level === "BEGINNER") return hours >= 4 ? 8 : 10;
  if (level === "INTERMEDIATE") return hours >= 4 ? 6 : 8;
  return hours >= 4 ? 4 : 6;
}

function buildDailyTasks(hoursPerDay: number): PlacementRoadmapPlan["daily_tasks"] {
  const count = Math.min(21, DAILY_TEMPLATES.length);
  return DAILY_TEMPLATES.slice(0, count).map((t, i) => ({
    id: `day-${i + 1}`,
    day: i + 1,
    category: t.category,
    title: t.title,
    duration_minutes: Math.round(t.duration * (hoursPerDay / 3)),
    description: t.description,
  }));
}

function buildPlan(input: RoadmapGenerateInput): PlacementRoadmapPlan {
  const months = timelineMonths(input.skillLevel, input.studyHoursPerDay);
  const companies = input.targetCompanies.length
    ? input.targetCompanies
    : ["Google", "Microsoft", "Amazon"];

  const dsaHours =
    input.skillLevel === "BEGINNER" ? 10 : input.skillLevel === "INTERMEDIATE" ? 12 : 14;

  return {
    summary: `Personalized ${months}-month placement roadmap for ${input.branch} (${input.skillLevel.toLowerCase()}). Targeting ${companies.slice(0, 3).join(", ")} with ${input.studyHoursPerDay}h daily study.`,
    timeline_months: months,
    adaptive_tips: [
      `With ${input.studyHoursPerDay}h/day, prioritize DSA in the first ${Math.ceil(months / 2)} months.`,
      "Complete aptitude mocks weekly — most campus rounds eliminate 60%+ in aptitude.",
      input.skillLevel === "BEGINNER"
        ? "Focus on easy/medium coding before attempting hard problems."
        : "Add system design and mock interviews from month 3 onward.",
      "Track progress on PlacePro dashboard and adjust weak topics each week.",
    ],
    categories: {
      DSA: {
        priority: "high",
        weekly_hours: dsaHours,
        focus_topics: ["Arrays", "Trees", "Graphs", "Dynamic Programming"],
      },
      APTITUDE: {
        priority: "high",
        weekly_hours: 6,
        focus_topics: ["Quant", "Logical", "Verbal"],
      },
      SYSTEM_DESIGN: {
        priority: input.skillLevel === "ADVANCED" ? "high" : "medium",
        weekly_hours: input.skillLevel === "BEGINNER" ? 2 : 4,
        focus_topics: ["Scalability", "Caching", "Load balancing"],
      },
      CORE_SUBJECTS: {
        priority: "medium",
        weekly_hours: 5,
        focus_topics: ["OS", "DBMS", "Networks"],
      },
      PROJECTS: {
        priority: "medium",
        weekly_hours: 4,
        focus_topics: ["Full-stack app", "Deployment", "GitHub README"],
      },
      RESUME_BUILDING: {
        priority: "medium",
        weekly_hours: 2,
        focus_topics: ["ATS score", "Metrics", "Keywords"],
      },
    },
    monthly_goals: [
      { month: 1, title: "DSA foundations", categories: ["DSA", "APTITUDE"] as RoadmapCategory[], targets: ["40 easy problems", "2 aptitude mocks"] },
      { month: 2, title: "Trees, graphs & core CS", categories: ["DSA", "CORE_SUBJECTS"] as RoadmapCategory[], targets: ["20 medium problems", "OS/DBMS notes"] },
      { month: 3, title: "DP & projects", categories: ["DSA", "PROJECTS"] as RoadmapCategory[], targets: ["15 DP problems", "1 deployed project"] },
      { month: 4, title: "System design & mocks", categories: ["SYSTEM_DESIGN", "DSA"] as RoadmapCategory[], targets: ["3 SD case studies", "2 mock interviews"] },
      { month: 5, title: "Company prep", categories: ["APTITUDE", "RESUME_BUILDING"] as RoadmapCategory[], targets: ["Company-specific tests", "Resume 85+ ATS"] },
      { month: 6, title: "Final revision", categories: ["DSA", "APTITUDE"] as RoadmapCategory[], targets: ["Revision sheet", "Daily timed mocks"] },
    ].slice(0, months),
    weekly_milestones: [
      { week: 1, title: "Arrays & Strings", categories: ["DSA"] as RoadmapCategory[], hours: 21, deliverable: "10 problems solved" },
      { week: 2, title: "Linked Lists & Stacks", categories: ["DSA"] as RoadmapCategory[], hours: 21, deliverable: "8 medium problems" },
      { week: 3, title: "Trees & Graphs", categories: ["DSA"] as RoadmapCategory[], hours: 24, deliverable: "BFS/DFS mastery" },
      { week: 4, title: "Aptitude intensive", categories: ["APTITUDE"] as RoadmapCategory[], hours: 18, deliverable: "3 full mocks 70%+" },
      { week: 5, title: "Dynamic Programming", categories: ["DSA"] as RoadmapCategory[], hours: 24, deliverable: "10 DP patterns" },
      { week: 6, title: "Core subjects", categories: ["CORE_SUBJECTS"] as RoadmapCategory[], hours: 15, deliverable: "OS + DBMS revision" },
      { week: 7, title: "System design basics", categories: ["SYSTEM_DESIGN"] as RoadmapCategory[], hours: 12, deliverable: "2 case studies" },
      { week: 8, title: "Project sprint", categories: ["PROJECTS"] as RoadmapCategory[], hours: 20, deliverable: "Portfolio project live" },
    ],
    daily_tasks: buildDailyTasks(input.studyHoursPerDay),
    target_companies: companies,
    skill_gaps: skillGapsFor(input.skillLevel),
  };
}

function computeProgress(record: PlacementRoadmapRecord): number {
  const total = record.plan.daily_tasks.length;
  if (!total) return 0;
  const done = record.completedTasks.length;
  return Math.round((done / total) * 1000) / 10;
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `roadmap-${Date.now()}`;
}

export function saveRoadmap(record: PlacementRoadmapRecord): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function loadStoredRoadmap(): PlacementRoadmapRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlacementRoadmapRecord;
  } catch {
    return null;
  }
}

export function generateRoadmap(input: RoadmapGenerateInput): PlacementRoadmapRecord {
  const plan = buildPlan(input);
  const record: PlacementRoadmapRecord = {
    id: newId(),
    userId: "demo-guest",
    branch: input.branch,
    graduationYear: input.graduationYear,
    skillLevel: input.skillLevel,
    targetCompanies: input.targetCompanies,
    studyHoursPerDay: input.studyHoursPerDay,
    plan,
    progressPercent: 0,
    adaptiveNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedTasks: [],
  };
  saveRoadmap(record);
  return record;
}

export function completeTask(
  record: PlacementRoadmapRecord,
  taskKey: string,
  category?: RoadmapCategory
): PlacementRoadmapRecord {
  const exists = record.completedTasks.some((t) => t.taskKey === taskKey);
  const completedTasks = exists
    ? record.completedTasks
    : [
        ...record.completedTasks,
        { taskKey, category: category ?? null, completedAt: new Date().toISOString() },
      ];

  const updated: PlacementRoadmapRecord = {
    ...record,
    completedTasks,
    updatedAt: new Date().toISOString(),
    progressPercent: 0,
  };
  updated.progressPercent = computeProgress(updated);
  saveRoadmap(updated);
  return updated;
}

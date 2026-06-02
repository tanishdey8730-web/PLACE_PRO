import type { CareerCoachInsights, CareerCoachMessage } from "@placepro/shared";

export const demoInsights: CareerCoachInsights = {
  careerGuidance:
    "You are on track for software engineering placements. Balance deep DSA practice with one polished full-stack project and weekly mock interviews to maximize offer quality.",
  skillRecommendations: [
    "Advanced DSA (graphs, DP, greedy)",
    "System design fundamentals",
    "SQL and database modeling",
    "Behavioral interview (STAR format)",
  ],
  technologyRecommendations: [
    "Java or C++ for coding rounds",
    "React + Node.js for portfolio projects",
    "PostgreSQL, Redis basics",
    "Docker & CI/CD introduction",
  ],
  learningPath: [
    { phase: "Weeks 1–4", focus: "Arrays, strings, linked lists, stacks", hoursPerWeek: 14 },
    { phase: "Weeks 5–8", focus: "Trees, graphs, BFS/DFS", hoursPerWeek: 16 },
    { phase: "Weeks 9–12", focus: "DP patterns + aptitude intensive", hoursPerWeek: 18 },
    { phase: "Weeks 13+", focus: "Mocks, system design, company prep", hoursPerWeek: 20 },
  ],
  placementStrategy: [
    "Register for TCS/Infosys drives early while prepping for product companies",
    "Use Placement Probability to prioritize companies",
    "Customize resume per company tier",
    "Reach out to 3 alumni per target company on LinkedIn",
  ],
  currentSkillsAssessed: ["Java", "Python", "React", "DSA", "Git"],
};

const demoReplies: Record<string, string> = {
  default:
    "I'm your AI Career Coach. I can help with career guidance, skill gaps, technology choices, learning paths, and placement strategy. What would you like to focus on today?",
  skill:
    "Based on a Software Engineer track, prioritize: (1) DSA to 75+ score, (2) one deployment-ready project, (3) aptitude 70+. Allocate 2 hours daily coding, 45 min aptitude, 30 min resume/LinkedIn.",
  placement:
    "Use a 3-tier application strategy: Tier A (dream product), Tier B (achievable product), Tier C (service backup). Apply to Tier C in month 1, Tier B in month 2–3, Tier A when mocks score 7+/10.",
};

export function getDemoChatReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("skill")) return demoReplies.skill;
  if (lower.includes("placement") || lower.includes("company")) return demoReplies.placement;
  return demoReplies.default;
}

export const demoSessionMessages: CareerCoachMessage[] = [
  {
    id: "demo-1",
    role: "assistant",
    content: demoReplies.default,
    createdAt: new Date().toISOString(),
  },
];

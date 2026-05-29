export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  C: 50,
  CPP: 54,
  JAVA: 62,
  PYTHON: 71,
  JAVASCRIPT: 63,
};

export const XP_REWARDS = {
  PROBLEM_SOLVED_EASY: 10,
  PROBLEM_SOLVED_MEDIUM: 25,
  PROBLEM_SOLVED_HARD: 50,
  APTITUDE_QUIZ: 15,
  DAILY_STREAK: 5,
  MOCK_INTERVIEW: 30,
  COURSE_LESSON: 10,
  CONTEST_PARTICIPATION: 20,
} as const;

export const BADGE_SLUGS = {
  DSA_MASTER: "dsa-master",
  APTITUDE_CHAMPION: "aptitude-champion",
  INTERVIEW_EXPERT: "interview-expert",
  RESUME_PRO: "resume-pro",
} as const;

export const CODING_CATEGORIES = [
  "ARRAYS",
  "STRINGS",
  "LINKED_LIST",
  "STACK",
  "QUEUE",
  "TREES",
  "GRAPHS",
  "DYNAMIC_PROGRAMMING",
  "GREEDY",
] as const;

export const COURSE_CATEGORIES = [
  "DSA",
  "OOP",
  "DBMS",
  "OPERATING_SYSTEMS",
  "COMPUTER_NETWORKS",
  "SYSTEM_DESIGN",
  "CLOUD_COMPUTING",
  "CYBERSECURITY",
] as const;

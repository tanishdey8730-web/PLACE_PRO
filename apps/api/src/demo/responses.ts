export const dashboardStats = {
  placementReadiness: 72,
  codingScore: 68,
  aptitudeScore: 75,
  interviewScore: 60,
  resumeAtsScore: 78,
  totalXp: 1250,
  level: 5,
  dailyStreak: 7,
  recentActivity: [
    { status: "ACCEPTED", problem: { title: "Two Sum", slug: "two-sum" } },
    { status: "WRONG_ANSWER", problem: { title: "Reverse Linked List", slug: "reverse-linked-list" } },
  ],
  upcomingTests: [{ id: "1", title: "Weekly Coding Challenge #1", startTime: new Date().toISOString() }],
  practiceRecommendations: [
    { id: "1", slug: "two-sum", title: "Two Sum", difficulty: "EASY", acceptance: 48.5 },
    { id: "2", slug: "reverse-linked-list", title: "Reverse Linked List", difficulty: "EASY", acceptance: 62 },
  ],
  aiInsights: [
    "Focus on Dynamic Programming — your weakest topic.",
    "Complete 2 mock interviews this week to boost readiness.",
    "Your resume ATS score can improve with more action verbs.",
  ],
  skillGaps: ["Graphs", "Dynamic Programming", "System Design"],
};

export const codingProblems = {
  items: [
    { id: "1", slug: "two-sum", title: "Two Sum", difficulty: "EASY", category: "ARRAYS", acceptance: 48.5, companies: ["Google", "Amazon"], tags: ["array"] },
    { id: "2", slug: "reverse-linked-list", title: "Reverse Linked List", difficulty: "EASY", category: "LINKED_LIST", acceptance: 62, companies: ["Meta"], tags: ["linked-list"] },
  ],
  total: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

export const twoSumProblem = {
  id: "1",
  slug: "two-sum",
  title: "Two Sum",
  description:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution.",
  difficulty: "EASY",
  category: "ARRAYS",
  companies: ["Google", "Amazon", "Microsoft"],
  tags: ["array", "hash-table"],
  starterCode: {
    PYTHON: "def two_sum(nums, target):\n    pass\n",
    JAVASCRIPT: "function twoSum(nums, target) {\n  \n}\n",
    JAVA: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}\n",
  },
  editorial: "Use a hash map to store complements. Time O(n), Space O(n).",
  testCases: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", isHidden: false, order: 0 }],
  discussions: [],
};

export const reverseListProblem = {
  id: "2",
  slug: "reverse-linked-list",
  title: "Reverse Linked List",
  description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
  difficulty: "EASY",
  category: "LINKED_LIST",
  companies: ["Meta", "Amazon"],
  tags: ["linked-list"],
  starterCode: { PYTHON: "def reverse_list(head):\n    pass\n" },
  editorial: "Iterate with prev/current pointers.",
  testCases: [{ input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", isHidden: false, order: 0 }],
  discussions: [],
};

export const guestUser = {
  id: "demo-guest",
  email: "guest@placepro.ai",
  name: "Guest User",
  role: "STUDENT",
  avatar: null,
  college: "PlacePro Demo",
  profile: {
    placementReadiness: 72,
    codingScore: 68,
    aptitudeScore: 75,
    interviewScore: 60,
    resumeAtsScore: 78,
    totalXp: 1250,
    level: 5,
  },
  streak: { currentStreak: 7, longestStreak: 14 },
  badges: [],
  xpLogs: [],
};

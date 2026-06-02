import type { CompanyPrepContent } from "./types.js";
import { buildProductChecklist, buildServiceChecklist } from "./checklist.js";

const productRounds = (extra?: string): CompanyPrepContent["interviewRounds"] => [
  {
    order: 1,
    name: "Online Assessment",
    duration: "60–90 min",
    focus: "DSA + aptitude coding",
    tips: ["Practice timed MCQs", "Use C++ or Java for speed", "Read constraints carefully"],
  },
  {
    order: 2,
    name: "Technical Phone Screen",
    duration: "45–60 min",
    focus: "1–2 medium DSA problems",
    tips: ["Think aloud", "Start with brute force then optimize", "Ask clarifying questions"],
  },
  {
    order: 3,
    name: "Onsite / Virtual Loop",
    duration: "4–6 hours",
    focus: "DSA, system design, behavioral",
    tips: ["Prepare 5 STAR stories", "Draw diagrams for system design", "Stay consistent across rounds"],
  },
  ...(extra
    ? [
        {
          order: 4,
          name: extra,
          duration: "45 min",
          focus: "Role-specific depth",
          tips: ["Review team tech stack", "Prepare questions for interviewer"],
        },
      ]
    : []),
];

const serviceRounds: CompanyPrepContent["interviewRounds"] = [
  {
    order: 1,
    name: "Aptitude Test",
    duration: "60–75 min",
    focus: "Quant, logical, verbal",
    tips: ["Skip hard questions first", "Practice previous year papers", "Manage time per section"],
  },
  {
    order: 2,
    name: "Technical / Coding",
    duration: "30–45 min",
    focus: "Basic programming & CS fundamentals",
    tips: ["Revise arrays, strings, loops", "Know output-based C/Java questions"],
  },
  {
    order: 3,
    name: "HR Interview",
    duration: "20–30 min",
    focus: "Communication, relocation, salary",
    tips: ["Be confident and clear", "Know company values", "Prepare why this company"],
  },
  {
    order: 4,
    name: "Group Discussion (optional)",
    duration: "15–20 min",
    focus: "Current affairs & teamwork",
    tips: ["Listen before speaking", "Support points with facts", "Don't dominate"],
  },
];

const faangDsa: CompanyPrepContent["dsaQuestions"] = [
  { title: "Two Sum", difficulty: "Easy", topics: ["Hash Map"], frequency: "Very High", leetcodeSlug: "two-sum" },
  { title: "Valid Parentheses", difficulty: "Easy", topics: ["Stack"], frequency: "Very High", leetcodeSlug: "valid-parentheses" },
  { title: "Merge Intervals", difficulty: "Medium", topics: ["Sorting"], frequency: "Very High", leetcodeSlug: "merge-intervals" },
  { title: "LRU Cache", difficulty: "Medium", topics: ["Design", "Hash Map"], frequency: "Very High", leetcodeSlug: "lru-cache" },
  { title: "Number of Islands", difficulty: "Medium", topics: ["DFS", "BFS"], frequency: "High", leetcodeSlug: "number-of-islands" },
  { title: "Word Break", difficulty: "Medium", topics: ["DP"], frequency: "High", leetcodeSlug: "word-break" },
  { title: "Median of Two Sorted Arrays", difficulty: "Hard", topics: ["Binary Search"], frequency: "High" },
  { title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", topics: ["Tree", "BFS"], frequency: "Medium" },
];

const serviceDsa: CompanyPrepContent["dsaQuestions"] = [
  { title: "Reverse a String", difficulty: "Easy", topics: ["Two Pointers"], frequency: "Very High" },
  { title: "Find Missing Number", difficulty: "Easy", topics: ["Math"], frequency: "High" },
  { title: "Bubble Sort / Selection Sort", difficulty: "Easy", topics: ["Sorting"], frequency: "High" },
  { title: "Fibonacci Series", difficulty: "Easy", topics: ["DP"], frequency: "High" },
  { title: "Palindrome Check", difficulty: "Easy", topics: ["Strings"], frequency: "Very High" },
  { title: "Anagram Check", difficulty: "Easy", topics: ["Hash Map"], frequency: "Medium" },
];

const productAptitude: CompanyPrepContent["aptitudePatterns"] = [
  {
    type: "Quantitative",
    description: "Probability, combinatorics, and speed math",
    topics: ["Probability", "Permutations", "Number theory"],
    tips: ["Practice mental math", "Eliminate options early"],
  },
  {
    type: "Logical Reasoning",
    description: "Pattern recognition and deduction",
    topics: ["Sequences", "Syllogisms", "Coding-decoding"],
    tips: ["Draw tables for logic puzzles"],
  },
  {
    type: "Technical MCQs",
    description: "CS fundamentals in MCQ format",
    topics: ["OS", "DBMS", "Networks", "OOP"],
    tips: ["Revise GATE-level CS topics"],
  },
];

const serviceAptitude: CompanyPrepContent["aptitudePatterns"] = [
  {
    type: "Quantitative",
    description: "Time & work, percentages, profit-loss, ratios",
    topics: ["Time & Work", "Percentages", "Averages", "SI/CI"],
    tips: ["Memorize common formulas", "Use approximation"],
  },
  {
    type: "Logical Reasoning",
    description: "Blood relations, seating arrangement, puzzles",
    topics: ["Blood Relations", "Direction", "Ranking"],
    tips: ["Practice 10 sets daily"],
  },
  {
    type: "Verbal Ability",
    description: "Reading comprehension, synonyms, sentence correction",
    topics: ["RC", "Para jumbles", "Grammar"],
    tips: ["Read editorial daily for RC speed"],
  },
];

const productSd: CompanyPrepContent["systemDesignQuestions"] = [
  {
    title: "Design URL Shortener",
    difficulty: "Medium",
    description: "Shorten URLs, handle redirects, analytics",
    keyConcepts: ["Hashing", "Cache", "DB sharding"],
  },
  {
    title: "Design News Feed",
    difficulty: "Hard",
    description: "Fan-out on write vs read, ranking, pagination",
    keyConcepts: ["Message queues", "CDN", "Caching"],
  },
  {
    title: "Design Rate Limiter",
    difficulty: "Medium",
    description: "Token bucket vs sliding window at scale",
    keyConcepts: ["Redis", "Distributed locks"],
  },
];

const productHr = [
  "Tell me about yourself.",
  "Describe a time you disagreed with a teammate. How did you resolve it?",
  "Tell me about a project you're most proud of.",
  "Why do you want to join us?",
  "Describe a failure and what you learned.",
  "Where do you see yourself in 5 years?",
];

const serviceHr = [
  "Tell me about yourself.",
  "Why do you want to join our company?",
  "Are you willing to relocate?",
  "What are your strengths and weaknesses?",
  "Why should we hire you?",
  "Do you have any questions for us?",
];

export const COMPANY_PREP_DATA: Record<string, CompanyPrepContent> = {
  google: {
    slug: "google",
    name: "Google",
    logoColor: "#4285F4",
    tier: "Product",
    profile: {
      description:
        "Google hires for strong algorithmic thinking, scalability mindset, and Googleyness (collaboration, ambiguity tolerance).",
      industry: "Technology",
      headquarters: "Mountain View, CA",
      avgPackageLpa: "45–80 LPA (India)",
      difficulty: "Very High",
      hiringTimeline: "2–4 months",
      employeeCount: "180,000+",
      focusAreas: ["Algorithms", "System Design", "Behavioral (Googleyness)"],
    },
    interviewRounds: productRounds("Hiring Committee Review"),
    dsaQuestions: [
      ...faangDsa,
      { title: "Trapping Rain Water", difficulty: "Hard", topics: ["Two Pointers"], frequency: "High" },
      { title: "Course Schedule", difficulty: "Medium", topics: ["Topological Sort"], frequency: "High" },
    ],
    aptitudePatterns: productAptitude,
    hrQuestions: productHr,
    systemDesignQuestions: [
      ...productSd,
      { title: "Design Google Search Autocomplete", difficulty: "Hard", description: "Trie, ranking, latency", keyConcepts: ["Trie", "Caching", "Load balancing"] },
    ],
    experiences: [
      { role: "SDE Intern", year: "2024", rounds: "OA → 2 Technical → HC", outcome: "Selected", summary: "Focus on medium-hard graphs and clear communication.", tips: "Practice Google Kickstart problems." },
      { role: "SDE-1", year: "2023", rounds: "Phone → 5 onsite rounds", outcome: "Selected", summary: "System design on distributed cache was key.", tips: "Prepare 8–10 STAR stories." },
      { role: "SDE-1", year: "2024", rounds: "OA → Onsite loop", outcome: "Rejected", summary: "Failed one hard DP round; others went well.", tips: "Don't neglect DP patterns." },
    ],
    prepChecklist: buildProductChecklist("Google"),
  },

  amazon: {
    slug: "amazon",
    name: "Amazon",
    logoColor: "#FF9900",
    tier: "Product",
    profile: {
      description:
        "Amazon emphasizes Leadership Principles (LPs) in every round alongside solid DSA and OOD.",
      industry: "E-commerce / Cloud",
      headquarters: "Seattle, WA",
      avgPackageLpa: "40–70 LPA (India)",
      difficulty: "Very High",
      hiringTimeline: "1–3 months",
      focusAreas: ["Leadership Principles", "DSA", "System Design", "OOD"],
    },
    interviewRounds: [
      ...productRounds().slice(0, 3),
      {
        order: 4,
        name: "Bar Raiser",
        duration: "60 min",
        focus: "LP deep dive + technical",
        tips: ["Use STAR for every LP", "Prepare 'Customer Obsession' and 'Bias for Action' stories"],
      },
    ],
    dsaQuestions: [
      ...faangDsa,
      { title: "Copy List with Random Pointer", difficulty: "Medium", topics: ["Linked List"], frequency: "High" },
      { title: "Reorder Data in Log Files", difficulty: "Medium", topics: ["Sorting"], frequency: "High" },
      { title: "Maximum Subarray", difficulty: "Medium", topics: ["DP", "Kadane"], frequency: "Very High" },
    ],
    aptitudePatterns: productAptitude,
    hrQuestions: [
      ...productHr,
      "Tell me about a time you dove deep into a problem.",
      "Describe when you had to deliver results with incomplete data.",
      "Tell me about a time you disagreed with your manager.",
    ],
    systemDesignQuestions: [
      ...productSd,
      { title: "Design Amazon Order System", difficulty: "Hard", description: "Inventory, payments, notifications", keyConcepts: ["SQS", "DynamoDB", "Idempotency"] },
    ],
    experiences: [
      { role: "SDE-1", year: "2024", rounds: "OA → 4 LP+Tech loops", outcome: "Selected", summary: "LP preparation was 50% of success.", tips: "Write STAR stories for all 16 LPs." },
      { role: "SDE Intern", year: "2023", rounds: "OA → 2 rounds", outcome: "Selected", summary: "OA had debugging section — practice carefully." },
    ],
    prepChecklist: buildProductChecklist("Amazon"),
  },

  microsoft: {
    slug: "microsoft",
    name: "Microsoft",
    logoColor: "#00A4EF",
    tier: "Product",
    profile: {
      description:
        "Microsoft focuses on practical coding, problem-solving, and cultural fit with slightly more approachable difficulty than Google/Meta.",
      industry: "Technology",
      headquarters: "Redmond, WA",
      avgPackageLpa: "38–65 LPA (India)",
      difficulty: "High",
      hiringTimeline: "1–2 months",
      focusAreas: ["DSA", "System Design", "Behavioral"],
    },
    interviewRounds: productRounds(),
    dsaQuestions: [
      ...faangDsa,
      { title: "Reverse Linked List", difficulty: "Easy", topics: ["Linked List"], frequency: "Very High" },
      { title: "Binary Tree Level Order Traversal", difficulty: "Medium", topics: ["BFS"], frequency: "High" },
    ],
    aptitudePatterns: productAptitude,
    hrQuestions: productHr,
    systemDesignQuestions: productSd,
    experiences: [
      { role: "SDE", year: "2024", rounds: "OA → 3–4 rounds", outcome: "Selected", summary: "Emphasis on clean code and edge cases." },
      { role: "SDE Intern", year: "2023", rounds: "Coding + AA", outcome: "Selected", summary: "Internship conversion after strong project work." },
    ],
    prepChecklist: buildProductChecklist("Microsoft"),
  },

  meta: {
    slug: "meta",
    name: "Meta",
    logoColor: "#0668E1",
    tier: "Product",
    profile: {
      description:
        "Meta (Facebook) interviews are fast-paced with 2 coding rounds per onsite, strong emphasis on medium-hard DSA under time pressure.",
      industry: "Social Media / Technology",
      headquarters: "Menlo Park, CA",
      avgPackageLpa: "50–85 LPA (India)",
      difficulty: "Very High",
      hiringTimeline: "2–3 months",
      focusAreas: ["Fast coding", "Graphs", "DP", "System Design"],
    },
    interviewRounds: productRounds(),
    dsaQuestions: [
      ...faangDsa,
      { title: "Valid Palindrome II", difficulty: "Easy", topics: ["Two Pointers"], frequency: "High" },
      { title: "Binary Tree Right Side View", difficulty: "Medium", topics: ["BFS"], frequency: "High" },
      { title: "Subarray Sum Equals K", difficulty: "Medium", topics: ["Prefix Sum"], frequency: "Very High" },
    ],
    aptitudePatterns: productAptitude,
    hrQuestions: productHr,
    systemDesignQuestions: [
      ...productSd,
      { title: "Design Facebook Messenger", difficulty: "Hard", description: "Real-time messaging at scale", keyConcepts: ["WebSockets", "Sharding", "Consistency"] },
    ],
    experiences: [
      { role: "E3 SWE", year: "2024", rounds: "Recruiter → OA → Onsite", outcome: "Selected", summary: "Two medium problems in 35 min each — speed matters." },
      { role: "Intern", year: "2023", rounds: "OA → 1 technical", outcome: "Rejected", summary: "Ran out of time on graph problem.", tips: "Practice Meta tagged LeetCode." },
    ],
    prepChecklist: buildProductChecklist("Meta"),
  },

  adobe: {
    slug: "adobe",
    name: "Adobe",
    logoColor: "#FF0000",
    tier: "Product",
    profile: {
      description:
        "Adobe hires for product engineering with focus on DSA, CS fundamentals, and creative problem-solving for multimedia/creative tools teams.",
      industry: "Software / Creative",
      headquarters: "San Jose, CA",
      avgPackageLpa: "28–45 LPA (India)",
      difficulty: "High",
      hiringTimeline: "1–2 months",
      focusAreas: ["DSA", "OOP", "CS Fundamentals", "Puzzles"],
    },
    interviewRounds: [
      { order: 1, name: "Online Test", duration: "90 min", focus: "DSA + MCQs", tips: ["Practice Adobe previous papers"] },
      { order: 2, name: "Technical Round 1", duration: "60 min", focus: "Coding + projects", tips: ["Explain project architecture"] },
      { order: 3, name: "Technical Round 2", duration: "60 min", focus: "DSA + puzzles", tips: ["Know OOP design patterns"] },
      { order: 4, name: "HR / Director", duration: "30 min", focus: "Fit & motivation", tips: ["Know Adobe products"] },
    ],
    dsaQuestions: [
      { title: "Rotate Array", difficulty: "Medium", topics: ["Array"], frequency: "Very High" },
      { title: "Longest Substring Without Repeating", difficulty: "Medium", topics: ["Sliding Window"], frequency: "High" },
      { title: "Detect Cycle in Linked List", difficulty: "Easy", topics: ["Linked List"], frequency: "Very High" },
      ...faangDsa.slice(0, 4),
    ],
    aptitudePatterns: productAptitude,
    hrQuestions: productHr,
    systemDesignQuestions: [
      { title: "Design Image Editor Undo/Redo", difficulty: "Medium", description: "Command pattern, stack", keyConcepts: ["Stack", "Memento pattern"] },
      ...productSd.slice(0, 2),
    ],
    experiences: [
      { role: "MTS", year: "2024", rounds: "OT → 2 Tech → HR", outcome: "Selected", summary: "Puzzle round had brain teasers — stay calm." },
    ],
    prepChecklist: buildProductChecklist("Adobe"),
  },

  atlassian: {
    slug: "atlassian",
    name: "Atlassian",
    logoColor: "#0052CC",
    tier: "Product",
    profile: {
      description:
        "Atlassian values teamwork, values alignment, and practical engineering for Jira, Confluence, and Bitbucket teams.",
      industry: "Software / Collaboration",
      headquarters: "Sydney, Australia",
      avgPackageLpa: "35–55 LPA (India)",
      difficulty: "High",
      hiringTimeline: "1–2 months",
      focusAreas: ["DSA", "Values interview", "System thinking"],
    },
    interviewRounds: [
      { order: 1, name: "Recruiter Screen", duration: "30 min", focus: "Background & motivation", tips: ["Research company values"] },
      { order: 2, name: "Coding Interview", duration: "60 min", focus: "DSA pair programming", tips: ["Collaborate with interviewer"] },
      { order: 3, name: "Coding Interview 2", duration: "60 min", focus: "DSA + debugging", tips: ["Test edge cases aloud"] },
      { order: 4, name: "Values Interview", duration: "45 min", focus: "Teamwork & values", tips: ["Prepare collaboration stories"] },
    ],
    dsaQuestions: [
      ...faangDsa.slice(0, 6),
      { title: "Implement Trie", difficulty: "Medium", topics: ["Trie"], frequency: "High" },
      { title: "Meeting Rooms II", difficulty: "Medium", topics: ["Heap"], frequency: "High" },
    ],
    aptitudePatterns: productAptitude,
    hrQuestions: [
      ...productHr,
      "Tell me about a time you improved team collaboration.",
      "How do you handle technical debt?",
    ],
    systemDesignQuestions: [
      { title: "Design Jira Issue Tracker", difficulty: "Hard", description: "Workflows, permissions, search", keyConcepts: ["Event sourcing", "Elasticsearch"] },
      ...productSd,
    ],
    experiences: [
      { role: "Software Engineer", year: "2024", rounds: "2 coding + values", outcome: "Selected", summary: "Pair programming style — communicate constantly." },
    ],
    prepChecklist: buildProductChecklist("Atlassian"),
  },

  tcs: {
    slug: "tcs",
    name: "TCS",
    logoColor: "#001F8F",
    tier: "Service",
    profile: {
      description:
        "TCS NQT and campus hiring focus on aptitude, basic programming, and communication. Mass recruitment with standardized pattern.",
      industry: "IT Services",
      headquarters: "Mumbai, India",
      avgPackageLpa: "3.5–7 LPA (Ninja) / 9+ LPA (Digital)",
      difficulty: "Moderate",
      hiringTimeline: "2–6 weeks",
      focusAreas: ["Aptitude", "Basic coding", "English", "HR"],
    },
    interviewRounds: serviceRounds,
    dsaQuestions: serviceDsa,
    aptitudePatterns: serviceAptitude,
    hrQuestions: serviceHr,
    systemDesignQuestions: [],
    experiences: [
      { role: "Ninja Profile", year: "2024", rounds: "NQT → Interview", outcome: "Selected", summary: "NQT score above 80% helped get Digital interview.", tips: "Focus on NQT aptitude first." },
      { role: "Digital", year: "2023", rounds: "NQT → Advanced coding → HR", outcome: "Selected", summary: "Digital role needs stronger coding than Ninja." },
    ],
    prepChecklist: buildServiceChecklist("TCS"),
  },

  infosys: {
    slug: "infosys",
    name: "Infosys",
    logoColor: "#007CC3",
    tier: "Service",
    profile: {
      description:
        "Infosys hiring via InfyTQ and campus drives tests aptitude, pseudocode, and HR fit for Systems Engineer role.",
      industry: "IT Services",
      headquarters: "Bangalore, India",
      avgPackageLpa: "3.6–8 LPA (SP/Digital Specialist)",
      difficulty: "Moderate",
      hiringTimeline: "2–4 weeks",
      focusAreas: ["InfyTQ", "Aptitude", "Pseudocode", "HR"],
    },
    interviewRounds: [
      { order: 1, name: "InfyTQ / Online Test", duration: "120 min", focus: "Aptitude + pseudocode + puzzles", tips: ["Practice InfyTQ previous sets"] },
      { order: 2, name: "Technical Interview", duration: "30 min", focus: "Projects + basic coding", tips: ["Know your resume projects deeply"] },
      { order: 3, name: "HR Interview", duration: "20 min", focus: "Communication & fit", tips: ["Prepare Infosys values"] },
    ],
    dsaQuestions: serviceDsa,
    aptitudePatterns: serviceAptitude,
    hrQuestions: serviceHr,
    systemDesignQuestions: [],
    experiences: [
      { role: "Systems Engineer", year: "2024", rounds: "InfyTQ → HR", outcome: "Selected", summary: "Pseudocode section — practice without IDE." },
      { role: "Power Programmer", year: "2023", rounds: "InfyTQ Advanced", outcome: "Rejected", summary: "Needed higher coding score for Power Programmer track." },
    ],
    prepChecklist: buildServiceChecklist("Infosys"),
  },

  wipro: {
    slug: "wipro",
    name: "Wipro",
    logoColor: "#341C53",
    tier: "Service",
    profile: {
      description:
        "Wipro campus hiring includes aptitude, essay writing, technical, and HR with emphasis on communication and flexibility.",
      industry: "IT Services",
      headquarters: "Bangalore, India",
      avgPackageLpa: "3.5–6.5 LPA",
      difficulty: "Moderate",
      hiringTimeline: "2–4 weeks",
      focusAreas: ["Aptitude", "Essay", "Basic technical", "HR"],
    },
    interviewRounds: [
      ...serviceRounds.slice(0, 2),
      { order: 3, name: "Essay Writing", duration: "20 min", focus: "Written communication", tips: ["Structure: intro, body, conclusion"] },
      serviceRounds[2],
    ],
    dsaQuestions: serviceDsa,
    aptitudePatterns: serviceAptitude,
    hrQuestions: serviceHr,
    systemDesignQuestions: [],
    experiences: [
      { role: "Project Engineer", year: "2024", rounds: "Aptitude → Tech → HR", outcome: "Selected", summary: "Essay on technology topic — practice 250 words in 20 min." },
    ],
    prepChecklist: buildServiceChecklist("Wipro"),
  },

  accenture: {
    slug: "accenture",
    name: "Accenture",
    logoColor: "#A100FF",
    tier: "Service",
    profile: {
      description:
        "Accenture uses cognitive assessment (aptitude + logical), coding, and communication rounds for associate software engineer roles.",
      industry: "Consulting / IT Services",
      headquarters: "Dublin, Ireland",
      avgPackageLpa: "4.5–8 LPA (India campus)",
      difficulty: "Moderate",
      hiringTimeline: "2–4 weeks",
      focusAreas: ["Cognitive assessment", "Coding", "Communication"],
    },
    interviewRounds: [
      { order: 1, name: "Cognitive Assessment", duration: "90 min", focus: "Aptitude, logical, verbal", tips: ["Accenture-specific mock tests"] },
      { order: 2, name: "Coding", duration: "45 min", focus: "2 easy-medium problems", tips: ["Focus on correctness over speed"] },
      { order: 3, name: "Communication Assessment", duration: "30 min", focus: "English fluency", tips: ["Speak clearly on familiar topics"] },
      { order: 4, name: "HR Interview", duration: "20 min", focus: "Fit & expectations", tips: ["Know Accenture services"] },
    ],
    dsaQuestions: [
      ...serviceDsa,
      { title: "Find Duplicate Number", difficulty: "Easy", topics: ["Array"], frequency: "Medium" },
    ],
    aptitudePatterns: serviceAptitude,
    hrQuestions: [
      ...serviceHr,
      "Are you comfortable with rotational training?",
      "How do you adapt to new technologies?",
    ],
    systemDesignQuestions: [],
    experiences: [
      { role: "Associate Software Engineer", year: "2024", rounds: "Cognitive → Coding → Comm → HR", outcome: "Selected", summary: "Communication round recorded — practice speaking on camera." },
    ],
    prepChecklist: buildServiceChecklist("Accenture"),
  },
};

export const COMPANY_SLUGS = Object.keys(COMPANY_PREP_DATA);

export function normalizeCompanySlug(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, "-");
}

export function getCompanyPrep(slug: string): CompanyPrepContent | null {
  const key = normalizeCompanySlug(slug);
  const aliases: Record<string, string> = {
    "tcs-nqt": "tcs",
    facebook: "meta",
    fb: "meta",
  };
  const resolved = aliases[key] ?? key;
  return COMPANY_PREP_DATA[resolved] ?? null;
}

export function computePrepProgress(
  checklist: CompanyPrepContent["prepChecklist"],
  completedSections: string[]
): { progressPercent: number; readinessScore: number } {
  const total = checklist.length;
  if (total === 0) return { progressPercent: 0, readinessScore: 0 };
  const done = completedSections.filter((id) => checklist.some((c) => c.id === id)).length;
  const progressPercent = Math.round((done / total) * 1000) / 10;

  const weights: Record<string, number> = {
    DSA: 0.3,
    APTITUDE: 0.2,
    SYSTEM_DESIGN: 0.2,
    HR: 0.1,
    CORE: 0.1,
    GENERAL: 0.1,
  };
  const byCategory: Record<string, { done: number; total: number }> = {};
  for (const item of checklist) {
    if (!byCategory[item.category]) byCategory[item.category] = { done: 0, total: 0 };
    byCategory[item.category].total++;
    if (completedSections.includes(item.id)) byCategory[item.category].done++;
  }
  let readinessScore = 0;
  for (const [cat, w] of Object.entries(weights)) {
    const stat = byCategory[cat];
    if (stat && stat.total > 0) {
      readinessScore += (stat.done / stat.total) * w * 100;
    }
  }
  readinessScore = Math.round(readinessScore * 10) / 10;

  return { progressPercent, readinessScore };
}

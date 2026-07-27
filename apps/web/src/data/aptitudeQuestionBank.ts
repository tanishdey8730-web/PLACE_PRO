export type AptitudeCategory = "QUANTITATIVE" | "LOGICAL" | "VERBAL";
export type TestDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface QuestionBankItem {
  id: string;
  category: AptitudeCategory;
  subCategory: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: TestDifficulty;
  section?: "CODING_MCQ" | "DSA";
}

export const APTITUDE_QUESTION_BANK: QuestionBankItem[] = [
  {
    id: "quant-001",
    category: "QUANTITATIVE",
    subCategory: "Percentage",
    question: "If 20% of a number is 40, what is 50% of that number?",
    options: ["80", "100", "120", "160"],
    correctAnswer: "100",
    explanation: "Number = 40/0.2 = 200. 50% of 200 = 100.",
    difficulty: "EASY",
  },
  {
    id: "quant-002",
    category: "QUANTITATIVE",
    subCategory: "Profit & Loss",
    question: "A shopkeeper buys an article for ₹400 and sells it for ₹500. What is the profit percentage?",
    options: ["20%", "25%", "30%", "15%"],
    correctAnswer: "25%",
    explanation: "Profit = 100. Profit% = (100/400)×100 = 25%.",
    difficulty: "EASY",
  },
  {
    id: "quant-003",
    category: "QUANTITATIVE",
    subCategory: "Time & Work",
    question: "A can complete a work in 10 days and B in 15 days. In how many days will they finish together?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "6",
    explanation: "Combined rate = 1/10 + 1/15 = 1/6. Time = 6 days.",
    difficulty: "MEDIUM",
  },
  {
    id: "quant-004",
    category: "QUANTITATIVE",
    subCategory: "Probability",
    question: "What is the probability of getting exactly one head when tossing two fair coins?",
    options: ["1/4", "1/2", "3/4", "1/3"],
    correctAnswer: "1/2",
    explanation: "Outcomes: HH, HT, TH, TT. Exactly one head: HT, TH → 2/4 = 1/2.",
    difficulty: "MEDIUM",
  },
  {
    id: "quant-005",
    category: "QUANTITATIVE",
    subCategory: "Ratio & Proportion",
    question: "The ratio of boys to girls in a class is 3:2. If there are 30 students, how many are girls?",
    options: ["10", "12", "15", "18"],
    correctAnswer: "12",
    explanation: "Girls = 2/5 × 30 = 12.",
    difficulty: "EASY",
  },
  {
    id: "quant-006",
    category: "QUANTITATIVE",
    subCategory: "Permutation & Combination",
    question: "In how many ways can 3 students be selected from 5 students?",
    options: ["10", "15", "20", "60"],
    correctAnswer: "10",
    explanation: "C(5,3) = 5!/(3!×2!) = 10.",
    difficulty: "MEDIUM",
  },
  {
    id: "quant-007",
    category: "QUANTITATIVE",
    subCategory: "Time & Work",
    question: "Pipe A fills a tank in 12 hours and Pipe B in 18 hours. How long to fill together?",
    options: ["6.2 hrs", "7.2 hrs", "8 hrs", "9 hrs"],
    correctAnswer: "7.2 hrs",
    explanation: "1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 hours.",
    difficulty: "HARD",
  },
  {
    id: "quant-008",
    category: "QUANTITATIVE",
    subCategory: "Percentage",
    question: "A number is increased by 20% and then decreased by 20%. Net change is:",
    options: ["No change", "4% decrease", "4% increase", "2% decrease"],
    correctAnswer: "4% decrease",
    explanation: "1.2 × 0.8 = 0.96 → 4% decrease.",
    difficulty: "MEDIUM",
  },
  {
    id: "logical-001",
    category: "LOGICAL",
    subCategory: "Puzzles",
    question: "All roses are flowers. Some flowers fade quickly. Which conclusion is valid?",
    options: [
      "All roses fade quickly",
      "Some roses may fade quickly",
      "No roses fade quickly",
      "All flowers are roses",
    ],
    correctAnswer: "Some roses may fade quickly",
    explanation: "Roses are a subset of flowers; some flowers fade — roses may be among them.",
    difficulty: "MEDIUM",
  },
  {
    id: "logical-002",
    category: "LOGICAL",
    subCategory: "Blood Relations",
    question: "Pointing to a man, Ravi said, 'He is the son of my grandfather's only son.' Who is the man?",
    options: ["Ravi's brother", "Ravi's father", "Ravi himself", "Ravi's uncle"],
    correctAnswer: "Ravi himself",
    explanation: "Grandfather's only son is Ravi's father. The man is the son of Ravi's father → Ravi.",
    difficulty: "MEDIUM",
  },
  {
    id: "logical-003",
    category: "LOGICAL",
    subCategory: "Seating Arrangement",
    question: "Five friends A, B, C, D, E sit in a row. A is not at either end. B is to the immediate right of A. Who can be at the leftmost seat?",
    options: ["A", "B", "C", "D or E"],
    correctAnswer: "D or E",
    explanation: "A needs a neighbor B on right; leftmost cannot be A or B.",
    difficulty: "HARD",
  },
  {
    id: "logical-004",
    category: "LOGICAL",
    subCategory: "Coding-Decoding",
    question: "If CODING is written as DPEJOH, how is PLACED written?",
    options: ["QMBDFE", "QMBDFF", "QMBEFE", "QNBCFE"],
    correctAnswer: "QMBDFE",
    explanation: "Each letter +1: P→Q, L→M, A→B, C→D, E→F, D→E.",
    difficulty: "EASY",
  },
  {
    id: "logical-005",
    category: "LOGICAL",
    subCategory: "Puzzles",
    question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies.",
    options: ["True", "False", "Cannot determine", "Sometimes false"],
    correctAnswer: "True",
    explanation: "Transitive property: Bloops ⊂ Razzies ⊂ Lazzies.",
    difficulty: "EASY",
  },
  {
    id: "logical-006",
    category: "LOGICAL",
    subCategory: "Seating Arrangement",
    question: "Six people sit around a circular table. How many distinct arrangements?",
    options: ["120", "720", "24", "360"],
    correctAnswer: "120",
    explanation: "Circular permutations: (6-1)! = 5! = 120.",
    difficulty: "MEDIUM",
  },
  {
    id: "verbal-001",
    category: "VERBAL",
    subCategory: "Grammar",
    question: "Choose the correct sentence:",
    options: [
      "Neither of the students have submitted.",
      "Neither of the students has submitted.",
      "Neither of the student has submitted.",
      "Neither students has submitted.",
    ],
    correctAnswer: "Neither of the students has submitted.",
    explanation: "'Neither' takes singular verb 'has'.",
    difficulty: "EASY",
  },
  {
    id: "verbal-002",
    category: "VERBAL",
    subCategory: "Vocabulary",
    question: "Choose the synonym of 'UBIQUITOUS':",
    options: ["Rare", "Omnipresent", "Hidden", "Temporary"],
    correctAnswer: "Omnipresent",
    explanation: "Ubiquitous means present everywhere.",
    difficulty: "MEDIUM",
  },
  {
    id: "verbal-003",
    category: "VERBAL",
    subCategory: "Reading Comprehension",
    question: "The passage implies that consistent practice improves retention. Which supports this?",
    options: [
      "One-time study is enough",
      "Spaced repetition strengthens memory",
      "Talent alone determines success",
      "Practice has no effect",
    ],
    correctAnswer: "Spaced repetition strengthens memory",
    explanation: "Spaced repetition is a form of consistent practice that improves retention.",
    difficulty: "EASY",
  },
  {
    id: "verbal-004",
    category: "VERBAL",
    subCategory: "Grammar",
    question: "Identify the error: 'She is more smarter than her brother.'",
    options: ["She", "more smarter", "than", "brother"],
    correctAnswer: "more smarter",
    explanation: "Use either 'smarter' or 'more smart', not 'more smarter'.",
    difficulty: "EASY",
  },
  {
    id: "verbal-005",
    category: "VERBAL",
    subCategory: "Vocabulary",
    question: "Antonym of 'BENEvolent':",
    options: ["Kind", "Malevolent", "Generous", "Charitable"],
    correctAnswer: "Malevolent",
    explanation: "Benevolent = kind; malevolent = wishing harm.",
    difficulty: "MEDIUM",
  },
  {
    id: "coding-mcq-001",
    category: "QUANTITATIVE",
    section: "CODING_MCQ",
    subCategory: "Time Complexity",
    question: "What is the time complexity of binary search on a sorted array of n elements?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correctAnswer: "O(log n)",
    explanation: "Binary search halves the search space each step → O(log n).",
    difficulty: "EASY",
  },
  {
    id: "coding-mcq-002",
    category: "QUANTITATIVE",
    section: "CODING_MCQ",
    subCategory: "Data Structures",
    question: "Which data structure is best for implementing BFS on a graph?",
    options: ["Stack", "Queue", "Heap", "Hash Map only"],
    correctAnswer: "Queue",
    explanation: "BFS uses a queue for level-order traversal.",
    difficulty: "EASY",
  },
  {
    id: "coding-mcq-003",
    category: "QUANTITATIVE",
    section: "CODING_MCQ",
    subCategory: "DSA",
    question: "What is the worst-case time complexity of Quick Sort?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    correctAnswer: "O(n²)",
    explanation: "Worst case occurs with poor pivot choices (already sorted).",
    difficulty: "MEDIUM",
  },
  {
    id: "coding-mcq-004",
    category: "QUANTITATIVE",
    section: "CODING_MCQ",
    subCategory: "DSA",
    question: "Which traversal gives sorted order in a Binary Search Tree?",
    options: ["Preorder", "Inorder", "Postorder", "Level order"],
    correctAnswer: "Inorder",
    explanation: "Inorder traversal of BST visits nodes in ascending order.",
    difficulty: "MEDIUM",
  },
  {
    id: "coding-mcq-005",
    category: "QUANTITATIVE",
    section: "CODING_MCQ",
    subCategory: "DBMS",
    question: "Which SQL clause filters rows before grouping?",
    options: ["HAVING", "WHERE", "ORDER BY", "GROUP BY"],
    correctAnswer: "WHERE",
    explanation: "WHERE filters before aggregation; HAVING filters after GROUP BY.",
    difficulty: "EASY",
  },
];

export function pickQuestions(filters: {
  category?: AptitudeCategory;
  section?: string;
  difficulty?: TestDifficulty;
  count: number;
  excludeIds?: string[];
}): QuestionBankItem[] {
  let pool = [...APTITUDE_QUESTION_BANK];
  if (filters.category) pool = pool.filter((q) => q.category === filters.category);
  if (filters.section) pool = pool.filter((q) => q.section === filters.section);
  if (filters.difficulty) pool = pool.filter((q) => q.difficulty === filters.difficulty);
  if (filters.excludeIds?.length) {
    pool = pool.filter((q) => !filters.excludeIds!.includes(q.id));
  }
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(filters.count, shuffled.length));
}

export function toPublicQuestion(q: QuestionBankItem) {
  return {
    id: q.id,
    category: q.category,
    subCategory: q.subCategory,
    section: q.section,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
  };
}

export function scoreAnswers(
  answers: Record<string, string>
): {
  score: number;
  correct: number;
  total: number;
  results: {
    questionId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    subCategory: string;
    category: string;
  }[];
  weakTopics: string[];
  categoryBreakdown: Record<string, { correct: number; total: number; percent: number }>;
} {
  const results = Object.entries(answers).map(([questionId, userAnswer]) => {
    const q = APTITUDE_QUESTION_BANK.find((x) => x.id === questionId);
    if (!q) {
      return {
        questionId,
        correct: false,
        userAnswer,
        correctAnswer: "",
        explanation: "",
        subCategory: "Unknown",
        category: "UNKNOWN",
      };
    }
    const correct = userAnswer === q.correctAnswer;
    return {
      questionId,
      correct,
      userAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      subCategory: q.subCategory,
      category: q.category,
    };
  });

  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const score = total ? Math.round((correct / total) * 1000) / 10 : 0;

  const categoryBreakdown: Record<string, { correct: number; total: number; percent: number }> = {};
  for (const r of results) {
    if (!categoryBreakdown[r.category]) {
      categoryBreakdown[r.category] = { correct: 0, total: 0, percent: 0 };
    }
    categoryBreakdown[r.category].total++;
    if (r.correct) categoryBreakdown[r.category].correct++;
  }
  for (const cat of Object.keys(categoryBreakdown)) {
    const b = categoryBreakdown[cat];
    b.percent = b.total ? Math.round((b.correct / b.total) * 100) : 0;
  }

  const weakTopics = [
    ...new Set(
      results
        .filter((r) => !r.correct && r.subCategory)
        .map((r) => r.subCategory)
    ),
  ];

  return { score, correct, total, results, weakTopics, categoryBreakdown };
}

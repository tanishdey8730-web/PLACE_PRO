import { PrismaClient, Difficulty, CodingCategory, AptitudeCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@placepro.ai" },
    update: {},
    create: {
      email: "admin@placepro.ai",
      name: "PlacePro Admin",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
      profile: { create: {} },
      streak: { create: {} },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@placepro.ai" },
    update: {},
    create: {
      email: "student@placepro.ai",
      name: "Demo Student",
      passwordHash,
      role: "STUDENT",
      emailVerified: new Date(),
      college: "Demo University",
      graduationYear: 2026,
      profile: {
        create: {
          placementReadiness: 72,
          codingScore: 68,
          aptitudeScore: 75,
          interviewScore: 60,
          resumeAtsScore: 78,
          totalXp: 1250,
          level: 5,
        },
      },
      streak: { create: { currentStreak: 7, longestStreak: 14 } },
    },
  });

  const badges = [
    { slug: "dsa-master", name: "DSA Master", description: "Solve 100 coding problems", icon: "code", xpRequired: 5000 },
    { slug: "aptitude-champion", name: "Aptitude Champion", description: "Score 90%+ on 10 aptitude tests", icon: "brain", xpRequired: 3000 },
    { slug: "interview-expert", name: "Interview Expert", description: "Complete 5 mock interviews", icon: "mic", xpRequired: 2000 },
    { slug: "resume-pro", name: "Resume Pro", description: "Achieve 85+ ATS score", icon: "file-text", xpRequired: 1000 },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }

  const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Adobe", "Goldman Sachs"];
  for (const name of companies) {
    await prisma.company.upsert({
      where: { name },
      update: {},
      create: { name, logo: `/logos/${name.toLowerCase().replace(/\s/g, "-")}.svg` },
    });
  }

  const problem = await prisma.codingProblem.upsert({
    where: { slug: "two-sum" },
    update: {},
    create: {
      slug: "two-sum",
      title: "Two Sum",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution.`,
      difficulty: Difficulty.EASY,
      category: CodingCategory.ARRAYS,
      companies: ["Google", "Amazon", "Microsoft"],
      tags: ["array", "hash-table"],
      starterCode: {
        PYTHON: "def two_sum(nums, target):\n    pass\n",
        JAVASCRIPT: "function twoSum(nums, target) {\n  \n}\n",
        JAVA: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}\n",
      },
      editorial: "Use a hash map to store complements. Time O(n), Space O(n).",
      acceptance: 48.5,
      testCases: {
        create: [
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", isHidden: false, order: 0 },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]", isHidden: true, order: 1 },
        ],
      },
    },
  });

  await prisma.codingProblem.upsert({
    where: { slug: "reverse-linked-list" },
    update: {},
    create: {
      slug: "reverse-linked-list",
      title: "Reverse Linked List",
      description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
      difficulty: Difficulty.EASY,
      category: CodingCategory.LINKED_LIST,
      companies: ["Meta", "Amazon"],
      starterCode: { PYTHON: "def reverse_list(head):\n    pass\n" },
      testCases: { create: [{ input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", isHidden: false, order: 0 }] },
    },
  });

  await prisma.aptitudeQuestion.createMany({
    data: [
      {
        category: AptitudeCategory.QUANTITATIVE,
        subCategory: "Percentage",
        question: "If 20% of a number is 40, what is 50% of that number?",
        options: ["80", "100", "120", "160"],
        correctAnswer: "100",
        explanation: "Number = 40/0.2 = 200. 50% = 100.",
        difficulty: Difficulty.EASY,
      },
      {
        category: AptitudeCategory.LOGICAL,
        subCategory: "Puzzles",
        question: "All roses are flowers. Some flowers fade quickly. Which conclusion is valid?",
        options: [
          "All roses fade quickly",
          "Some roses may fade quickly",
          "No roses fade quickly",
          "All flowers are roses",
        ],
        correctAnswer: "Some roses may fade quickly",
        difficulty: Difficulty.MEDIUM,
      },
    ],
    skipDuplicates: true,
  });

  const google = await prisma.company.findUnique({ where: { name: "Google" } });
  if (google) {
    await prisma.job.upsert({
      where: { id: "seed-job-google-swe" },
      update: {},
      create: {
        id: "seed-job-google-swe",
        companyId: google.id,
        title: "Software Engineer Intern",
        description: "Join Google as a Software Engineering intern. Work on scalable systems.",
        type: "INTERNSHIP",
        location: "Bangalore, India",
        salaryMin: 80000,
        salaryMax: 120000,
        skills: ["Python", "Java", "Algorithms", "System Design"],
        experience: "0-1 years",
      },
    });
  }

  const courses = [
    { slug: "dsa-fundamentals", title: "DSA Fundamentals", category: "DSA", duration: 40 },
    { slug: "system-design", title: "System Design", category: "SYSTEM_DESIGN", duration: 30 },
    { slug: "dbms", title: "Database Management", category: "DBMS", duration: 20 },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        title: c.title,
        description: `Comprehensive ${c.title} course for placement preparation.`,
        category: c.category,
        duration: c.duration,
        level: Difficulty.MEDIUM,
        lessons: {
          create: [
            { title: "Introduction", content: "Welcome to the course.", order: 1, duration: 15 },
            { title: "Core Concepts", content: "Deep dive into fundamentals.", order: 2, duration: 30 },
          ],
        },
      },
    });
  }

  await prisma.contest.create({
    data: {
      title: "Weekly Coding Challenge #1",
      description: "Solve 5 problems in 2 hours. Top 10 win certificates.",
      type: "CODING",
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      problemIds: [problem.id],
      rewards: { certificates: true, xp: 100 },
    },
  });

  console.log("Seed complete:", { admin: admin.email, student: student.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Code2,
  Brain,
  FileText,
  Mic,
  BookOpen,
  Trophy,
  Briefcase,
  Users,
  MessageSquare,
  Radio,
  Network,
  FolderGit2,
  Github,
  BarChart3,
  Bot,
  Map,
  Building2,
  Mail,
  Target,
  Percent,
  Sparkles,
  CalendarCheck,
  Handshake,
  Kanban,
  UsersRound,
  IndianRupee,
  Swords,
  ClipboardList,
} from "lucide-react";

export type FeatureCategory =
  | "Practice"
  | "AI Tools"
  | "Career"
  | "Jobs"
  | "Community";

export interface DashboardFeature {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: FeatureCategory;
  color: string;
}

export const DASHBOARD_FEATURES: DashboardFeature[] = [
  { href: "/dashboard/coding", label: "Coding Practice", description: "DSA problems with Monaco editor & Judge0", icon: Code2, category: "Practice", color: "from-purple-500 to-pink-500" },
  { href: "/dashboard/aptitude", label: "Aptitude", description: "Quant, logical & verbal quizzes", icon: Brain, category: "Practice", color: "from-violet-500 to-purple-500" },
  { href: "/dashboard/contests", label: "Contests", description: "Weekly challenges & leaderboards", icon: Trophy, category: "Practice", color: "from-amber-500 to-orange-500" },
  { href: "/dashboard/coding-battles", label: "Coding Battles", description: "1v1 & multiplayer live battles", icon: Swords, category: "Practice", color: "from-red-500 to-rose-500" },
  { href: "/dashboard/collab", label: "Live Collab", description: "Real-time pair programming rooms", icon: Radio, category: "Practice", color: "from-cyan-500 to-blue-500" },
  { href: "/dashboard/system-design", label: "System Design", description: "AI-scored design interviews", icon: Network, category: "Practice", color: "from-indigo-500 to-blue-500" },
  { href: "/dashboard/learning", label: "Learning", description: "Courses on DSA, OS, DBMS & more", icon: BookOpen, category: "Practice", color: "from-emerald-500 to-teal-500" },
  { href: "/dashboard/daily-challenges", label: "Daily Challenges", description: "AI-generated daily practice set", icon: CalendarCheck, category: "Practice", color: "from-lime-500 to-green-500" },

  { href: "/dashboard/career/chat", label: "AI Career Coach", description: "Live chat for skills & placement strategy", icon: Bot, category: "AI Tools", color: "from-blue-500 to-cyan-500" },
  { href: "/dashboard/career/dashboard", label: "Career Dashboard", description: "Scores, roadmaps & skill radar", icon: BarChart3, category: "AI Tools", color: "from-blue-600 to-indigo-500" },
  { href: "/dashboard/interviews/technical", label: "Technical Interview", description: "DSA & system design mock rounds", icon: Mic, category: "AI Tools", color: "from-amber-500 to-yellow-500" },
  { href: "/dashboard/hr-interview", label: "HR Interview", description: "Behavioral questions with AI report", icon: MessageSquare, category: "AI Tools", color: "from-pink-500 to-rose-500" },
  { href: "/dashboard/interviews/behavioral", label: "Behavioral Interview", description: "STAR method & situational prep", icon: Mic, category: "AI Tools", color: "from-orange-500 to-amber-500" },
  { href: "/dashboard/resume-builder", label: "Resume Builder", description: "ATS templates & AI content", icon: Sparkles, category: "AI Tools", color: "from-emerald-500 to-green-500" },
  { href: "/dashboard/resume", label: "Resume Analyzer", description: "Upload & ATS score your resume", icon: FileText, category: "AI Tools", color: "from-teal-500 to-cyan-500" },
  { href: "/dashboard/cover-letter", label: "Cover Letter", description: "AI cover letters with PDF export", icon: Mail, category: "AI Tools", color: "from-sky-500 to-blue-500" },
  { href: "/dashboard/job-match", label: "Job Match", description: "Resume vs job description scoring", icon: Percent, category: "AI Tools", color: "from-violet-500 to-purple-500" },
  { href: "/dashboard/salary-predictor", label: "Salary Predictor", description: "AI salary range & market insights", icon: IndianRupee, category: "AI Tools", color: "from-green-500 to-emerald-500" },
  { href: "/dashboard/placement-probability", label: "Placement %", description: "Company-wise probability scores", icon: Target, category: "AI Tools", color: "from-red-500 to-orange-500" },
  { href: "/dashboard/networking", label: "Networking AI", description: "Recruiter & alumni outreach tips", icon: UsersRound, category: "AI Tools", color: "from-indigo-500 to-violet-500" },
  { href: "/dashboard/project-review", label: "Project Review", description: "GitHub repo AI analysis", icon: FolderGit2, category: "AI Tools", color: "from-slate-500 to-zinc-500" },
  { href: "/dashboard/github-analysis", label: "GitHub Analyzer", description: "Profile strength & improvements", icon: Github, category: "AI Tools", color: "from-gray-600 to-gray-800" },

  { href: "/dashboard/roadmap", label: "AI Roadmap", description: "Personalized placement learning path", icon: Map, category: "Career", color: "from-blue-500 to-purple-500" },
  { href: "/dashboard/company-prep", label: "Company Prep", description: "Google, Amazon, TCS & 14 companies", icon: Building2, category: "Career", color: "from-blue-600 to-blue-400" },
  { href: "/dashboard/placement-tracker", label: "Placement Tracker", description: "Kanban board for applications", icon: Kanban, category: "Career", color: "from-purple-600 to-pink-500" },
  { href: "/dashboard/analytics", label: "Analytics", description: "Progress charts & skill growth", icon: BarChart3, category: "Career", color: "from-cyan-500 to-blue-500" },
  { href: "/dashboard/assessment", label: "Placement Assessment", description: "Free readiness quiz", icon: ClipboardList, category: "Career", color: "from-fuchsia-500 to-purple-500" },

  { href: "/dashboard/jobs", label: "Jobs", description: "Browse & apply to openings", icon: Briefcase, category: "Jobs", color: "from-blue-500 to-indigo-500" },
  { href: "/dashboard/mentors", label: "Mentors", description: "Book 1:1 mentor sessions", icon: Users, category: "Jobs", color: "from-violet-500 to-purple-500" },
  { href: "/dashboard/referrals", label: "Referrals", description: "Referral marketplace", icon: Handshake, category: "Jobs", color: "from-emerald-500 to-teal-500" },
  { href: "/recruiter", label: "Recruiter Hub", description: "Recruiter portal & analytics", icon: Briefcase, category: "Jobs", color: "from-slate-600 to-slate-800" },

  { href: "/dashboard/community", label: "Community", description: "Discussions & peer learning", icon: MessageSquare, category: "Community", color: "from-blue-400 to-cyan-400" },
  { href: "/dashboard/interview-experiences", label: "Interview Experiences", description: "Share & read interview stories", icon: MessageSquare, category: "Community", color: "from-orange-400 to-red-400" },
];

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  "Practice",
  "AI Tools",
  "Career",
  "Jobs",
  "Community",
];

export const SCORE_LINKS = [
  { label: "Placement Ready", href: "/dashboard/analytics" },
  { label: "Coding", href: "/dashboard/coding" },
  { label: "Aptitude", href: "/dashboard/aptitude" },
  { label: "Interview", href: "/dashboard/interviews" },
  { label: "Resume ATS", href: "/dashboard/resume" },
] as const;

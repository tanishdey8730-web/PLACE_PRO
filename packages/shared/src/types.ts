export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  placementReadiness: number;
  codingScore: number;
  aptitudeScore: number;
  interviewScore: number;
  resumeAtsScore: number;
  dailyStreak: number;
  totalXp: number;
  level: number;
}

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  resumeStrength: string;
  missingSkills: string[];
  formattingIssues: string[];
  keywordSuggestions: string[];
  improvements: string[];
}

export interface InterviewFeedback {
  communication: number;
  confidence: number;
  technicalAccuracy: number;
  speechClarity: number;
  bodyLanguage?: string;
  suggestions: string[];
}

export type RoadmapSkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type RoadmapCategory =
  | "DSA"
  | "APTITUDE"
  | "SYSTEM_DESIGN"
  | "CORE_SUBJECTS"
  | "PROJECTS"
  | "RESUME_BUILDING";

export interface RoadmapDailyTask {
  id: string;
  day: number;
  category: RoadmapCategory;
  title: string;
  duration_minutes: number;
  description: string;
}

export interface RoadmapWeeklyMilestone {
  week: number;
  title: string;
  categories: RoadmapCategory[];
  hours: number;
  deliverable: string;
}

export interface RoadmapMonthlyGoal {
  month: number;
  title: string;
  categories: RoadmapCategory[];
  targets: string[];
}

export interface RoadmapCategoryPlan {
  priority: "high" | "medium" | "low";
  weekly_hours: number;
  focus_topics: string[];
}

export interface PlacementRoadmapPlan {
  summary: string;
  timeline_months: number;
  adaptive_tips: string[];
  categories: Record<RoadmapCategory, RoadmapCategoryPlan>;
  monthly_goals: RoadmapMonthlyGoal[];
  weekly_milestones: RoadmapWeeklyMilestone[];
  daily_tasks: RoadmapDailyTask[];
  target_companies: string[];
  skill_gaps: string[];
}

export interface RoadmapGenerateInput {
  branch: string;
  graduationYear: number;
  skillLevel: RoadmapSkillLevel;
  targetCompanies: string[];
  studyHoursPerDay: number;
}

export interface PlacementRoadmapRecord {
  id: string;
  userId: string;
  branch: string;
  graduationYear: number;
  skillLevel: RoadmapSkillLevel;
  targetCompanies: string[];
  studyHoursPerDay: number;
  plan: PlacementRoadmapPlan;
  progressPercent: number;
  adaptiveNotes: string | null;
  createdAt: string;
  updatedAt: string;
  completedTasks: { taskKey: string; category: RoadmapCategory | null; completedAt: string }[];
}

export interface CompanyPrepTrackerItem {
  slug: string;
  name: string;
  logoColor: string;
  tier: "Product" | "Service";
  difficulty: string;
  progressPercent: number;
  readinessScore: number;
}

export interface CompanyPrepContent {
  slug: string;
  name: string;
  logoColor: string;
  tier: "Product" | "Service";
  profile: {
    description: string;
    industry: string;
    headquarters: string;
    avgPackageLpa: string;
    difficulty: string;
    hiringTimeline: string;
    employeeCount?: string;
    focusAreas: string[];
  };
  interviewRounds: {
    order: number;
    name: string;
    duration: string;
    focus: string;
    tips: string[];
  }[];
  dsaQuestions: {
    title: string;
    difficulty: string;
    topics: string[];
    frequency: string;
    leetcodeSlug?: string;
  }[];
  aptitudePatterns: {
    type: string;
    description: string;
    topics: string[];
    tips: string[];
  }[];
  hrQuestions: string[];
  systemDesignQuestions: {
    title: string;
    difficulty: string;
    description: string;
    keyConcepts: string[];
  }[];
  experiences: {
    role: string;
    year: string;
    rounds: string;
    outcome: string;
    summary: string;
    tips?: string;
  }[];
  prepChecklist: {
    id: string;
    label: string;
    category: string;
  }[];
  progress: {
    completedSections: string[];
    progressPercent: number;
    readinessScore: number;
  };
}

export type ResumeBuilderTemplateId = "ats" | "professional" | "modern";

export type ResumeGenerateSection =
  | "projects"
  | "internships"
  | "achievements"
  | "skills"
  | "summary";

export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  summary?: string;
}

export interface ResumeEducation {
  school: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface ResumeExperienceItem {
  company: string;
  role: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface ResumeProjectItem {
  name: string;
  tech: string;
  bullets: string[];
  link?: string;
}

export interface ResumeInternshipItem {
  company: string;
  role: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface ResumeContent {
  personal: ResumePersonalInfo;
  skills: string[];
  education: ResumeEducation[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  internships: ResumeInternshipItem[];
  achievements: string[];
}

export interface ResumeBuilderScores {
  atsScore: number;
  qualityScore: number;
  feedback: string[];
  keywordSuggestions: string[];
}

export interface ResumeBuilderResponse {
  id?: string;
  title: string;
  template: ResumeBuilderTemplateId;
  content: ResumeContent;
  scores: ResumeBuilderScores;
  generated?: Partial<ResumeContent>;
}

export interface LinkedInSectionAnalysis {
  score: number;
  feedback: string;
  suggestions: string[];
}

export interface LinkedInSkillsAnalysis {
  score: number;
  listed: string[];
  missing: string[];
  feedback: string;
}

export interface LinkedInCompletenessItem {
  item: string;
  done: boolean;
}

export interface LinkedInAnalysisResult {
  id?: string;
  profileUrl: string;
  linkedinScore: number;
  headline: LinkedInSectionAnalysis;
  about: LinkedInSectionAnalysis;
  skills: LinkedInSkillsAnalysis;
  missingKeywords: string[];
  completeness: {
    score: number;
    checklist: LinkedInCompletenessItem[];
  };
  suggestions: {
    profile: string[];
    visibility: string[];
    recruiterAppeal: string[];
  };
  recommendations: string[];
  createdAt?: string;
}

export type CoverLetterTemplateId = "professional" | "modern" | "formal" | "concise";

export type CoverLetterDocumentType =
  | "cover_letter"
  | "internship_application"
  | "referral_request"
  | "hr_follow_up"
  | "all";

export interface CoverLetterContent {
  subject: string;
  salutation: string;
  body: string;
  closing: string;
  signature: string;
}

export interface CoverLetterGenerateResult {
  id?: string;
  companyName: string;
  jobTitle: string;
  template: CoverLetterTemplateId;
  documents: {
    coverLetter: CoverLetterContent;
    internshipApplication: CoverLetterContent;
    referralRequest: CoverLetterContent;
    hrFollowUp: CoverLetterContent;
  };
  createdAt?: string;
}

export interface PlacementProbabilityInput {
  cgpa: number;
  dsaScore: number;
  aptitudeScore: number;
  resumeScore: number;
  projects: number;
  certifications: number;
  targetRole?: string;
  branch?: string;
}

export interface CompanyProbability {
  company: string;
  slug: string;
  probability: number;
  tier: "Product" | "Service";
}

export interface PlacementProbabilityResult {
  id?: string;
  overallProbability: number;
  readinessLevel: "Low" | "Moderate" | "Good" | "Strong";
  companyProbabilities: CompanyProbability[];
  improvementSuggestions: string[];
  scoreBreakdown: {
    cgpa: number;
    dsa: number;
    aptitude: number;
    resume: number;
    projects: number;
    certifications: number;
  };
  createdAt?: string;
}

export interface CareerCoachLearningPhase {
  phase: string;
  focus: string;
  hoursPerWeek: number;
}

export interface CareerCoachInsights {
  careerGuidance: string;
  skillRecommendations: string[];
  technologyRecommendations: string[];
  learningPath: CareerCoachLearningPhase[];
  placementStrategy: string[];
  currentSkillsAssessed: string[];
}

export interface CareerCoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface CareerCoachChatResponse {
  sessionId: string;
  reply: string;
  message: CareerCoachMessage;
  insights?: CareerCoachInsights;
}

export interface JobMatchInput {
  resume: string;
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
}

export interface JobMatchResult {
  id?: string;
  matchScore: number;
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  matchedKeywords?: string[];
  recommendations?: string[];
  jobTitle?: string;
  companyName?: string;
  createdAt?: string;
}

export interface HrInterviewQuestion {
  id: string;
  question: string;
}

export interface HrInterviewAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface HrQuestionFeedback {
  questionId: string;
  score: number;
  feedback: string;
}

export interface HrInterviewScores {
  communication: number;
  confidence: number;
  clarity: number;
  professionalism: number;
  overall: number;
}

export interface HrInterviewReport {
  id?: string;
  targetRole: string;
  companyName?: string;
  questions: HrInterviewQuestion[];
  answers: HrInterviewAnswer[];
  scores: HrInterviewScores;
  questionFeedback: HrQuestionFeedback[];
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  completedAt?: string;
}

export type SystemDesignTopicId = "instagram" | "whatsapp" | "uber" | "youtube";

export interface SystemDesignTopic {
  id: SystemDesignTopicId;
  title: string;
  tagline: string;
  scaleHint: string;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  discussionPoints: string[];
}

export interface SystemDesignScores {
  scalability: number;
  architecture: number;
  databaseDesign: number;
  caching: number;
  security: number;
  overall: number;
}

export type SystemDesignDimension =
  | "scalability"
  | "architecture"
  | "databaseDesign"
  | "caching"
  | "security";

export interface SystemDesignDimensionFeedback {
  dimension: SystemDesignDimension;
  score: number;
  feedback: string;
  improvements: string[];
}

export interface SystemDesignReport {
  id?: string;
  topicId: SystemDesignTopicId;
  topicTitle: string;
  design: string;
  scores: SystemDesignScores;
  dimensionFeedback: SystemDesignDimensionFeedback[];
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  architectureHighlights?: string[];
  completedAt?: string;
}

export interface ProjectReviewInput {
  repoUrl: string;
}

export type ProjectReviewDimension =
  | "codeQuality"
  | "architecture"
  | "documentation"
  | "resumeWorthiness";

export interface ProjectReviewScores {
  codeQuality: number;
  architecture: number;
  documentation: number;
  resumeWorthiness: number;
  overall: number;
}

export interface ProjectReviewDimensionFeedback {
  dimension: ProjectReviewDimension;
  score: number;
  feedback: string;
}

export interface ProjectReviewReport {
  id?: string;
  repoUrl: string;
  repoFullName: string;
  description?: string;
  primaryLanguage?: string;
  stars?: number;
  scores: ProjectReviewScores;
  dimensionFeedback: ProjectReviewDimensionFeedback[];
  missingFeatures: string[];
  improvementSuggestions: string[];
  summary: string;
  strengths: string[];
  techStack?: string[];
  createdAt?: string;
}

export interface GitHubAnalysisInput {
  username: string;
}

export type GitHubAnalysisDimension =
  | "repositories"
  | "languages"
  | "contributionActivity"
  | "projectQuality"
  | "openSourceActivity";

export interface GitHubAnalysisScores {
  repositories: number;
  languages: number;
  contributionActivity: number;
  projectQuality: number;
  openSourceActivity: number;
  overall: number;
}

export interface GitHubAnalysisDimensionFeedback {
  dimension: GitHubAnalysisDimension;
  score: number;
  feedback: string;
}

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface SkillAnalysisItem {
  skill: string;
  level: SkillLevel;
  evidence: string;
  percentage?: number;
}

export interface GitHubTopLanguage {
  language: string;
  repoCount: number;
  percentage: number;
}

export interface GitHubTopRepository {
  name: string;
  stars: number;
  language: string | null;
  description: string | null;
}

export interface GitHubProfileAnalysisReport {
  id?: string;
  username: string;
  profileUrl: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  publicRepos: number;
  followers: number;
  following: number;
  developerScore: number;
  scores: GitHubAnalysisScores;
  dimensionFeedback: GitHubAnalysisDimensionFeedback[];
  skillAnalysis: SkillAnalysisItem[];
  topLanguages: GitHubTopLanguage[];
  topRepositories: GitHubTopRepository[];
  improvementSuggestions: string[];
  summary: string;
  strengths: string[];
  createdAt?: string;
}

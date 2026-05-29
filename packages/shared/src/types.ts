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

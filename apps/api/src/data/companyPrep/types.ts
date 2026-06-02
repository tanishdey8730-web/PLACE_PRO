export interface CompanyProfile {
  description: string;
  industry: string;
  headquarters: string;
  avgPackageLpa: string;
  difficulty: "Very High" | "High" | "Medium" | "Moderate";
  hiringTimeline: string;
  employeeCount?: string;
  focusAreas: string[];
}

export interface InterviewRound {
  order: number;
  name: string;
  duration: string;
  focus: string;
  tips: string[];
}

export interface DsaQuestion {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  frequency: "Very High" | "High" | "Medium";
  leetcodeSlug?: string;
}

export interface AptitudePattern {
  type: string;
  description: string;
  topics: string[];
  tips: string[];
}

export interface SystemDesignQuestion {
  title: string;
  difficulty: "Medium" | "Hard";
  description: string;
  keyConcepts: string[];
}

export interface InterviewExperience {
  role: string;
  year: string;
  rounds: string;
  outcome: "Selected" | "Rejected" | "Pending";
  summary: string;
  tips?: string;
}

export interface PrepChecklistItem {
  id: string;
  label: string;
  category: "DSA" | "APTITUDE" | "SYSTEM_DESIGN" | "HR" | "CORE" | "GENERAL";
}

export interface CompanyPrepContent {
  slug: string;
  name: string;
  logoColor: string;
  tier: "Product" | "Service";
  profile: CompanyProfile;
  interviewRounds: InterviewRound[];
  dsaQuestions: DsaQuestion[];
  aptitudePatterns: AptitudePattern[];
  hrQuestions: string[];
  systemDesignQuestions: SystemDesignQuestion[];
  experiences: InterviewExperience[];
  prepChecklist: PrepChecklistItem[];
}

export interface CompanyPrepResponse extends CompanyPrepContent {
  progress: {
    completedSections: string[];
    progressPercent: number;
    readinessScore: number;
  };
}

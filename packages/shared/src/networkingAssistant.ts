export type NetworkContactType = "RECRUITER" | "ALUMNI" | "MENTOR";

export interface NetworkContactSuggestion {
  id: string;
  type: NetworkContactType;
  name: string;
  title: string;
  company?: string | null;
  college?: string | null;
  linkedinUrl?: string | null;
  matchScore: number;
  reason: string;
  connectionTip: string;
  isPlatformUser?: boolean;
  platformUserId?: string;
}

export interface NetworkingRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  actionSteps: string[];
}

export type LinkedInOutreachPurpose =
  | "cold_outreach"
  | "follow_up"
  | "thank_you"
  | "referral_request";

export interface LinkedInOutreachSuggestion {
  id: string;
  targetType: NetworkContactType;
  targetName: string;
  targetTitle: string;
  purpose: LinkedInOutreachPurpose;
  subjectLine?: string | null;
  message: string;
  tips: string[];
}

export interface NetworkingAssistantResult {
  id?: string;
  targetRole: string;
  targetCompanies: string[];
  summary: string;
  recruiters: NetworkContactSuggestion[];
  alumni: NetworkContactSuggestion[];
  mentors: NetworkContactSuggestion[];
  recommendations: NetworkingRecommendation[];
  linkedInOutreach: LinkedInOutreachSuggestion[];
  weeklyPlan: string[];
  createdAt?: string;
}

export interface NetworkingAssistantHistoryItem {
  id: string;
  targetRole: string;
  targetCompanies: string[];
  summary: string;
  createdAt: string;
}

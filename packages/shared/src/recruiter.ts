export type RecruiterInterviewStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type RecruiterInterviewType = "technical" | "hr" | "manager" | "final";

export interface RecruiterCandidateSummary {
  id: string;
  name: string;
  email: string;
  college?: string | null;
  graduationYear?: number | null;
  skills: string[];
  avatar?: string | null;
  codingScore: number;
  aptitudeScore: number;
  interviewScore: number;
  placementReadiness: number;
  resumeAtsScore: number;
  applicationsCount: number;
  latestResumeId?: string;
  latestResumeUrl?: string;
  appliedToMyJobs?: boolean;
}

export interface RecruiterCandidateDetail extends RecruiterCandidateSummary {
  bio?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  resumes: {
    id: string;
    fileName: string;
    fileUrl: string;
    atsScore?: number | null;
    createdAt: string;
  }[];
  applications: {
    id: string;
    status: string;
    jobTitle: string;
    appliedAt: string;
  }[];
}

export interface RecruiterJobPosting {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skills: string[];
  experience?: string | null;
  isActive: boolean;
  companyName: string;
  companyId: string;
  applicationsCount: number;
  createdAt: string;
}

export interface RecruiterInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId?: string | null;
  jobTitle?: string | null;
  scheduledAt: string;
  durationMinutes: number;
  type: RecruiterInterviewType;
  status: RecruiterInterviewStatus;
  location?: string | null;
  meetingUrl?: string | null;
  notes?: string | null;
}

export interface RecruiterAnalytics {
  totalCandidates: number;
  activeJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  interviewsThisWeek: number;
  pipeline: { status: string; count: number }[];
  topSkills: { skill: string; count: number }[];
  scoreAverages: {
    coding: number;
    aptitude: number;
    interview: number;
    readiness: number;
  };
  recentApplications: {
    id: string;
    candidateName: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
  }[];
}

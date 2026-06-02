import type {
  RecruiterAnalytics,
  RecruiterCandidateDetail,
  RecruiterCandidateSummary,
  RecruiterInterview,
  RecruiterJobPosting,
} from "@placepro/shared";

export const demoRecruiterUser = {
  id: "demo-recruiter",
  email: "recruiter@placepro.ai",
  name: "Priya Sharma",
  role: "RECRUITER",
  college: null,
  profile: null,
};

export const demoCandidates: RecruiterCandidateSummary[] = [
  {
    id: "cand-1",
    name: "Arjun Mehta",
    email: "arjun.mehta@college.edu",
    college: "IIT Delhi",
    graduationYear: 2026,
    skills: ["Java", "Python", "React", "DSA"],
    codingScore: 82,
    aptitudeScore: 78,
    interviewScore: 74,
    placementReadiness: 79,
    resumeAtsScore: 85,
    applicationsCount: 2,
    latestResumeId: "res-1",
    latestResumeUrl: "/uploads/demo/arjun-resume.pdf",
    appliedToMyJobs: true,
  },
  {
    id: "cand-2",
    name: "Sneha Reddy",
    email: "sneha.r@college.edu",
    college: "NIT Warangal",
    graduationYear: 2025,
    skills: ["TypeScript", "Node.js", "AWS", "System Design"],
    codingScore: 88,
    aptitudeScore: 85,
    interviewScore: 80,
    placementReadiness: 86,
    resumeAtsScore: 90,
    applicationsCount: 1,
    latestResumeId: "res-2",
    latestResumeUrl: "/uploads/demo/sneha-resume.pdf",
    appliedToMyJobs: true,
  },
  {
    id: "cand-3",
    name: "Rahul Verma",
    email: "rahul.v@college.edu",
    college: "BITS Pilani",
    graduationYear: 2026,
    skills: ["C++", "Go", "Kubernetes"],
    codingScore: 71,
    aptitudeScore: 68,
    interviewScore: 65,
    placementReadiness: 68,
    resumeAtsScore: 72,
    applicationsCount: 0,
    appliedToMyJobs: false,
  },
  {
    id: "cand-4",
    name: "Ananya Iyer",
    email: "ananya.i@college.edu",
    college: "VIT Vellore",
    graduationYear: 2025,
    skills: ["Python", "ML", "SQL", "Docker"],
    codingScore: 76,
    aptitudeScore: 82,
    interviewScore: 70,
    placementReadiness: 75,
    resumeAtsScore: 80,
    applicationsCount: 3,
    latestResumeId: "res-4",
    latestResumeUrl: "/uploads/demo/ananya-resume.pdf",
    appliedToMyJobs: true,
  },
];

export let demoJobs: RecruiterJobPosting[] = [
  {
    id: "job-1",
    title: "Software Engineer Intern",
    description: "Build features for placement prep platform. Stack: TypeScript, React, Node.",
    type: "INTERNSHIP",
    location: "Bangalore / Remote",
    salaryMin: 40000,
    salaryMax: 60000,
    skills: ["TypeScript", "React", "Node.js"],
    experience: "0-1 years",
    isActive: true,
    companyName: "PlacePro Labs",
    companyId: "company-1",
    applicationsCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "job-2",
    title: "Associate SDE",
    description: "Full-time role for 2025 grads. DSA + system design interviews.",
    type: "FULL_TIME",
    location: "Hyderabad",
    salaryMin: 1200000,
    salaryMax: 1800000,
    skills: ["Java", "DSA", "SQL"],
    experience: "Fresher",
    isActive: true,
    companyName: "PlacePro Labs",
    companyId: "company-1",
    applicationsCount: 8,
    createdAt: new Date().toISOString(),
  },
];

let demoInterviews: RecruiterInterview[] = [
  {
    id: "int-1",
    candidateId: "cand-1",
    candidateName: "Arjun Mehta",
    candidateEmail: "arjun.mehta@college.edu",
    jobId: "job-1",
    jobTitle: "Software Engineer Intern",
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    durationMinutes: 45,
    type: "technical",
    status: "scheduled",
    meetingUrl: "https://meet.google.com/demo-arjun",
    notes: "Focus on arrays and React fundamentals",
  },
  {
    id: "int-2",
    candidateId: "cand-2",
    candidateName: "Sneha Reddy",
    candidateEmail: "sneha.r@college.edu",
    jobId: "job-2",
    jobTitle: "Associate SDE",
    scheduledAt: new Date(Date.now() + 86400000 * 4).toISOString(),
    durationMinutes: 60,
    type: "hr",
    status: "scheduled",
    location: "Office — Tower A",
  },
];

export function getDemoInterviews() {
  return demoInterviews;
}

export function addDemoInterview(interview: RecruiterInterview) {
  demoInterviews = [...demoInterviews, interview];
  return interview;
}

export function updateDemoInterview(id: string, patch: Partial<RecruiterInterview>) {
  demoInterviews = demoInterviews.map((i) => (i.id === id ? { ...i, ...patch } : i));
  return demoInterviews.find((i) => i.id === id);
}

export const demoAnalytics: RecruiterAnalytics = {
  totalCandidates: 248,
  activeJobs: 2,
  totalApplications: 20,
  interviewsScheduled: 2,
  interviewsThisWeek: 2,
  pipeline: [
    { status: "APPLIED", count: 8 },
    { status: "REVIEWING", count: 5 },
    { status: "SHORTLISTED", count: 4 },
    { status: "INTERVIEW", count: 2 },
    { status: "OFFERED", count: 1 },
  ],
  topSkills: [
    { skill: "Java", count: 45 },
    { skill: "Python", count: 42 },
    { skill: "React", count: 38 },
    { skill: "DSA", count: 55 },
  ],
  scoreAverages: {
    coding: 74,
    aptitude: 76,
    interview: 71,
    readiness: 73,
  },
  recentApplications: [
    {
      id: "app-1",
      candidateName: "Arjun Mehta",
      jobTitle: "Software Engineer Intern",
      status: "SHORTLISTED",
      appliedAt: new Date().toISOString(),
    },
    {
      id: "app-2",
      candidateName: "Sneha Reddy",
      jobTitle: "Associate SDE",
      status: "INTERVIEW",
      appliedAt: new Date().toISOString(),
    },
  ],
};

export function filterDemoCandidates(params: {
  q?: string;
  college?: string;
  skill?: string;
  minCoding?: number;
  graduationYear?: number;
  appliedOnly?: boolean;
}): RecruiterCandidateSummary[] {
  let list = [...demoCandidates];
  if (params.q) {
    const q = params.q.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.college?.toLowerCase().includes(q)
    );
  }
  if (params.college) {
    list = list.filter((c) =>
      c.college?.toLowerCase().includes(params.college!.toLowerCase())
    );
  }
  if (params.skill) {
    list = list.filter((c) =>
      c.skills.some((s) => s.toLowerCase().includes(params.skill!.toLowerCase()))
    );
  }
  if (params.minCoding) {
    list = list.filter((c) => c.codingScore >= params.minCoding!);
  }
  if (params.graduationYear) {
    list = list.filter((c) => c.graduationYear === params.graduationYear);
  }
  if (params.appliedOnly) {
    list = list.filter((c) => c.appliedToMyJobs);
  }
  return list;
}

export function getDemoCandidateDetail(id: string): RecruiterCandidateDetail | null {
  const base = demoCandidates.find((c) => c.id === id);
  if (!base) return null;
  return {
    ...base,
    bio: "Aspiring software engineer passionate about full-stack development.",
    githubUrl: "https://github.com/example",
    linkedinUrl: "https://linkedin.com/in/example",
    resumes: base.latestResumeId
      ? [
          {
            id: base.latestResumeId,
            fileName: `${base.name.replace(/\s/g, "_")}_Resume.pdf`,
            fileUrl: base.latestResumeUrl ?? "#",
            atsScore: base.resumeAtsScore,
            createdAt: new Date().toISOString(),
          },
        ]
      : [],
    applications: base.appliedToMyJobs
      ? [
          {
            id: "app-x",
            status: "SHORTLISTED",
            jobTitle: "Software Engineer Intern",
            appliedAt: new Date().toISOString(),
          },
        ]
      : [],
  };
}

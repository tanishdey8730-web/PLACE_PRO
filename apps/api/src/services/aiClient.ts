const AI_BASE = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function analyzeResume(fileUrl: string, userId: string) {
  const res = await fetch(`${AI_BASE}/api/resume/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_url: fileUrl, user_id: userId }),
  });
  if (!res.ok) throw new Error("AI resume analysis failed");
  return res.json();
}

export async function generateInterviewQuestions(type: string, role: string) {
  const res = await fetch(`${AI_BASE}/api/interview/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interview_type: type, target_role: role }),
  });
  if (!res.ok) throw new Error("Failed to generate questions");
  return res.json();
}

export async function analyzeInterview(transcript: unknown, type: string) {
  const res = await fetch(`${AI_BASE}/api/interview/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, interview_type: type }),
  });
  if (!res.ok) throw new Error("Interview analysis failed");
  return res.json();
}

export async function generateCareerPlan(profile: Record<string, unknown>) {
  const res = await fetch(`${AI_BASE}/api/career/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Career plan generation failed");
  return res.json();
}

export async function generatePlacementRoadmap(input: {
  branch: string;
  graduationYear: number;
  skillLevel: string;
  targetCompanies: string[];
  studyHoursPerDay: number;
  college?: string | null;
  skills?: string[];
}) {
  const res = await fetch(`${AI_BASE}/api/roadmap/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      branch: input.branch,
      graduation_year: input.graduationYear,
      skill_level: input.skillLevel,
      target_companies: input.targetCompanies,
      study_hours_per_day: input.studyHoursPerDay,
      college: input.college,
      skills: input.skills,
    }),
  });
  if (!res.ok) throw new Error("Roadmap generation failed");
  return res.json();
}

export async function callResumeBuilder(body: Record<string, unknown>) {
  const res = await fetch(`${AI_BASE}/api/resume/builder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Resume builder AI failed");
  return res.json();
}

export async function analyzeLinkedInProfile(body: {
  profile_url: string;
  target_role: string;
  headline?: string;
  about?: string;
  skills?: string[];
}) {
  const res = await fetch(`${AI_BASE}/api/linkedin/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("LinkedIn analysis failed");
  return res.json();
}

export async function generateCoverLetter(body: {
  company_name: string;
  job_title: string;
  resume: string;
  skills: string[];
  template: string;
  document_type: string;
  applicant_name: string;
}) {
  const res = await fetch(`${AI_BASE}/api/cover-letter/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Cover letter generation failed");
  return res.json();
}

export async function predictPlacementProbability(body: {
  cgpa: number;
  dsa_score: number;
  aptitude_score: number;
  resume_score: number;
  projects: number;
  certifications: number;
  target_role?: string;
  branch?: string;
}) {
  const res = await fetch(`${AI_BASE}/api/placement-probability/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Placement probability prediction failed");
  return res.json();
}

export async function callCareerCoach(body: Record<string, unknown>) {
  const res = await fetch(`${AI_BASE}/api/career-coach/coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Career coach AI failed");
  return res.json();
}

export async function analyzeJobMatch(body: {
  resume: string;
  job_description: string;
  job_title?: string;
  company_name?: string;
}) {
  const res = await fetch(`${AI_BASE}/api/job-match/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Job match analysis failed");
  return res.json();
}

export async function analyzeHrInterview(body: {
  target_role: string;
  company_name?: string;
  answers: { question_id: string; question: string; answer: string }[];
  duration_seconds?: number;
}) {
  const res = await fetch(`${AI_BASE}/api/hr-interview/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("HR interview evaluation failed");
  return res.json();
}

export async function analyzeSystemDesign(body: {
  topic_id: string;
  topic_title: string;
  design: string;
  scale_hint?: string;
  discussion_points?: string[];
}) {
  const res = await fetch(`${AI_BASE}/api/system-design/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("System design evaluation failed");
  return res.json();
}

export async function analyzeProjectReview(body: {
  repo_url: string;
  repo_full_name: string;
  repo_context: string;
}) {
  const res = await fetch(`${AI_BASE}/api/project-review/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Project review failed");
  return res.json();
}

export async function analyzeGitHubProfile(body: {
  username: string;
  profile_context: string;
}) {
  const res = await fetch(`${AI_BASE}/api/github-analysis/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("GitHub profile analysis failed");
  return res.json();
}

export async function generateDailyChallenges(body: {
  placement_goal: string;
  placement_goal_label: string;
  weak_topics: string[];
  progress: Record<string, unknown>;
}) {
  const res = await fetch(`${AI_BASE}/api/daily-challenge/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Daily challenge generation failed");
  return res.json();
}

export async function generateNetworkingAssistant(body: Record<string, unknown>) {
  const res = await fetch(`${AI_BASE}/api/networking/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Networking assistant generation failed");
  return res.json();
}

export async function predictSalary(body: {
  skills: string[];
  experience_years: number;
  location: string;
  company_type: string;
  role?: string;
}) {
  const res = await fetch(`${AI_BASE}/api/salary-predictor/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Salary prediction failed");
  return res.json();
}

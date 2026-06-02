import type { JobMatchResult } from "@placepro/shared";

export const demoJobMatch: JobMatchResult = {
  id: "demo-job-match",
  matchScore: 85,
  missingSkills: ["Docker", "AWS", "Kubernetes"],
  strengths: [
    "Strong match on Java, Python, and REST API experience",
    "Project experience aligns with backend development requirements",
    "Resume includes measurable outcomes and Git collaboration",
  ],
  weaknesses: [
    "Cloud deployment experience (AWS/Docker) not highlighted",
    "System design keywords absent from resume",
    "No mention of CI/CD pipelines",
  ],
  matchedKeywords: ["JAVA", "PYTHON", "REACT", "SQL", "GIT", "REST"],
  recommendations: [
    "Add Docker and AWS to skills section with a brief project bullet",
    "Include one line on CI/CD (GitHub Actions or Jenkins) if applicable",
    "Mirror job title keywords in your professional summary",
  ],
  jobTitle: "Software Engineer",
  companyName: "Example Corp",
};

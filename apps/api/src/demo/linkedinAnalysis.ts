import type { LinkedInAnalysisResult } from "@placepro/shared";

export const demoLinkedInAnalysis: LinkedInAnalysisResult = {
  id: "demo-linkedin",
  profileUrl: "https://www.linkedin.com/in/demo-profile",
  linkedinScore: 74,
  headline: {
    score: 70,
    feedback: "Headline mentions role but lacks tech stack and measurable impact.",
    suggestions: [
      "Add primary languages/frameworks after job title",
      "Include outcome: 'Building full-stack apps' or '500+ DSA problems solved'",
      "Remove filler words like 'passionate' without specifics",
    ],
  },
  about: {
    score: 68,
    feedback: "About covers background but needs metrics and clearer CTA.",
    suggestions: [
      "Structure in 3 paragraphs: hook, achievements, CTA",
      "Add numbers: projects shipped, hackathon wins, GPA if strong",
      "Link GitHub/portfolio in the first 3 lines",
    ],
  },
  skills: {
    score: 72,
    listed: ["Java", "Python", "React", "Node.js", "SQL", "Git", "DSA"],
    missing: ["System Design", "Docker", "AWS", "CI/CD", "TypeScript"],
    feedback: "Good core stack; add cloud and DevOps keywords for backend roles.",
  },
  missingKeywords: ["system design", "microservices", "REST API", "agile", "CI/CD"],
  completeness: {
    score: 78,
    checklist: [
      { item: "Professional profile photo", done: true },
      { item: "Custom headline", done: true },
      { item: "About section (150+ words)", done: true },
      { item: "5+ relevant skills", done: true },
      { item: "Education listed", done: true },
      { item: "Project or internship experience", done: true },
      { item: "Featured section", done: false },
      { item: "Recommendations (1+)", done: false },
    ],
  },
  suggestions: {
    profile: [
      "Refresh headline every semester with new skills/certifications",
      "Pin a post showcasing your best project",
      "Add licenses & certifications (AWS, Google, etc.)",
    ],
    visibility: [
      "Engage with alumni from target companies weekly",
      "Share bite-sized learning posts after completing modules",
      "Join and participate in role-specific LinkedIn groups",
    ],
    recruiterAppeal: [
      "Set 'Open to work' with 5 specific job titles",
      "Message recruiters with personalized note + portfolio link",
      "Align experience bullets with keywords from job posts",
    ],
  },
  recommendations: [
    "Raise headline score to 85+ with role | stack | impact format",
    "Add featured GitHub repo and resume PDF",
    "Fill missing skills: Docker, AWS, System Design",
    "Request 2 recommendations from professors or managers",
    "Post once per week to stay in recruiter feeds",
  ],
};

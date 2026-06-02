import type { ResumeContent, ResumeBuilderScores } from "@placepro/shared";

export const demoResumeContent: ResumeContent = {
  personal: {
    fullName: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexjohnson",
    summary:
      "Computer Science graduate seeking Software Engineer roles with experience in full-stack development and competitive programming.",
  },
  skills: ["Java", "Python", "React", "Node.js", "SQL", "DSA", "Git", "REST APIs"],
  education: [
    {
      school: "State University",
      degree: "B.Tech Computer Science",
      year: "2026",
      gpa: "8.5/10",
    },
  ],
  experience: [],
  projects: [
    {
      name: "E-Commerce Microservices",
      tech: "Spring Boot, React, PostgreSQL",
      bullets: [
        "Built order service handling 1k+ daily transactions with 99.9% uptime",
        "Reduced API latency by 40% through query optimization and caching",
      ],
    },
  ],
  internships: [
    {
      company: "FinTech Corp",
      role: "Software Engineering Intern",
      start: "May 2025",
      end: "Jul 2025",
      bullets: [
        "Implemented payment webhook handlers processing $50k+ monthly volume",
        "Wrote unit tests increasing coverage from 60% to 82%",
      ],
    },
  ],
  achievements: [
    "CodeChef 3-star rating",
    "Top 10 in university hackathon 2025",
  ],
};

export const demoScores: ResumeBuilderScores = {
  atsScore: 82,
  qualityScore: 78,
  feedback: [
    "Strong project metrics — add more role-specific keywords",
    "Include GitHub link prominently in header",
    "Expand skills with cloud/DevOps terms if targeting backend roles",
  ],
  keywordSuggestions: ["microservices", "CI/CD", "Docker", "system design"],
};

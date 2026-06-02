import type { ProjectReviewReport } from "@placepro/shared";

export const demoProjectReview: ProjectReviewReport = {
  id: "demo-project-review",
  repoUrl: "https://github.com/example/placement-tracker",
  repoFullName: "example/placement-tracker",
  description: "Campus placement preparation platform with coding practice and analytics",
  primaryLanguage: "TypeScript",
  stars: 24,
  scores: {
    codeQuality: 76,
    architecture: 72,
    documentation: 68,
    resumeWorthiness: 80,
    overall: 74,
  },
  dimensionFeedback: [
    {
      dimension: "codeQuality",
      score: 76,
      feedback:
        "Monorepo structure with separate API and web apps is a positive signal. Add more integration tests and enforce lint/format in CI to reach production-grade quality.",
    },
    {
      dimension: "architecture",
      score: 72,
      feedback:
        "Clear separation between frontend, API, and shared packages. Document service boundaries and how data flows between Prisma, Express, and Next.js.",
    },
    {
      dimension: "documentation",
      score: 68,
      feedback:
        "README covers setup but lacks architecture diagram, API overview, and deployment guide. Add screenshots and environment variable table.",
    },
    {
      dimension: "resumeWorthiness",
      score: 80,
      feedback:
        "Strong full-stack story for campus hiring. Add quantified impact (users, response times, features shipped) and a live demo link on the README.",
    },
  ],
  missingFeatures: [
    "Architecture diagram in README",
    "Live demo deployment link",
    "API documentation (OpenAPI/Swagger)",
    "E2E test suite",
    "Performance/load testing notes",
  ],
  improvementSuggestions: [
    "Add a 'Highlights for recruiters' section with 3 resume bullets",
    "Publish a live demo on Vercel/Railway and badge the README",
    "Generate OpenAPI spec for the REST API",
    "Add GitHub Actions badge and test coverage badge",
    "Include .env.example with comments for each variable",
    "Add CONTRIBUTING.md if open to collaborators",
  ],
  summary:
    "A credible full-stack portfolio project scoring 74/100. With richer documentation, demo deployment, and measurable outcomes, this can become a top-tier resume centerpiece for software engineering roles.",
  strengths: [
    "Full-stack TypeScript monorepo",
    "Multiple product features (coding, interviews, analytics)",
    "CI and structured package layout",
    "Relevant to placement/career domain",
  ],
  techStack: ["TypeScript", "JavaScript", "CSS"],
};

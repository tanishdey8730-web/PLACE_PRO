import type { GitHubProfileAnalysisReport } from "@placepro/shared";

export const demoGitHubAnalysis: GitHubProfileAnalysisReport = {
  id: "demo-github-analysis",
  username: "octocat",
  profileUrl: "https://github.com/octocat",
  name: "The Octocat",
  bio: "GitHub mascot and demo profile",
  publicRepos: 8,
  followers: 4200,
  following: 9,
  developerScore: 72,
  scores: {
    repositories: 75,
    languages: 68,
    contributionActivity: 70,
    projectQuality: 74,
    openSourceActivity: 73,
    overall: 72,
  },
  dimensionFeedback: [
    {
      dimension: "repositories",
      score: 75,
      feedback:
        "Solid number of public repos with recognizable flagship projects. Pin your best work and ensure each repo has a description and topics.",
    },
    {
      dimension: "languages",
      score: 68,
      feedback:
        "Multiple languages present — focus depth on 1–2 stacks most relevant to your target role rather than scattering effort.",
    },
    {
      dimension: "contributionActivity",
      score: 70,
      feedback:
        "Regular push activity visible. Maintain weekly commits on active placement-prep or portfolio projects.",
    },
    {
      dimension: "projectQuality",
      score: 74,
      feedback:
        "Top repos have stars and READMEs. Add live demos, tests, and architecture notes to push quality into the 80+ range.",
    },
    {
      dimension: "openSourceActivity",
      score: 73,
      feedback:
        "Healthy follower count and fork traction. Increase PR contributions to external repos for stronger collaboration signals.",
    },
  ],
  skillAnalysis: [
    {
      skill: "JavaScript",
      level: "advanced",
      percentage: 35,
      evidence: "4 public repositories using JavaScript",
    },
    {
      skill: "TypeScript",
      level: "intermediate",
      percentage: 25,
      evidence: "3 public repositories using TypeScript",
    },
    {
      skill: "Python",
      level: "intermediate",
      percentage: 20,
      evidence: "2 public repositories using Python",
    },
  ],
  topLanguages: [
    { language: "JavaScript", repoCount: 4, percentage: 35 },
    { language: "TypeScript", repoCount: 3, percentage: 25 },
    { language: "Python", repoCount: 2, percentage: 20 },
  ],
  topRepositories: [
    {
      name: "octocat/Hello-World",
      stars: 1200,
      language: "JavaScript",
      description: "My first repository on GitHub!",
    },
  ],
  improvementSuggestions: [
    "Pin 3 flagship projects that map to your resume bullets",
    "Add a profile README with tech stack and placement goals",
    "Commit weekly on active projects to show consistency",
    "Contribute at least one PR to a popular open-source repo",
    "Add live demo links to top repository READMEs",
  ],
  summary:
    "Developer score 72/100 — credible GitHub presence for early-career hiring with room to sharpen project depth, documentation, and open-source contributions.",
  strengths: [
    "Recognizable flagship repositories",
    "Multi-language exposure",
    "Active contribution pattern",
    "Strong social proof (followers)",
  ],
};

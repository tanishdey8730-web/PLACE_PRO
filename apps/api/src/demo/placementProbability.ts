import type { PlacementProbabilityResult } from "@placepro/shared";

export const demoPlacementProbability: PlacementProbabilityResult = {
  id: "demo-prediction",
  overallProbability: 68.5,
  readinessLevel: "Good",
  companyProbabilities: [
    { company: "TCS", slug: "tcs", probability: 95, tier: "Service" },
    { company: "Wipro", slug: "wipro", probability: 92, tier: "Service" },
    { company: "Infosys", slug: "infosys", probability: 88, tier: "Service" },
    { company: "Accenture", slug: "accenture", probability: 85, tier: "Service" },
    { company: "Adobe", slug: "adobe", probability: 58, tier: "Product" },
    { company: "Amazon", slug: "amazon", probability: 52, tier: "Product" },
    { company: "Microsoft", slug: "microsoft", probability: 48, tier: "Product" },
    { company: "Atlassian", slug: "atlassian", probability: 45, tier: "Product" },
    { company: "Google", slug: "google", probability: 35, tier: "Product" },
    { company: "Meta", slug: "meta", probability: 32, tier: "Product" },
  ],
  improvementSuggestions: [
    "Increase DSA score to 80+ to improve Google/Meta odds above 50%.",
    "Complete 2 more medium-hard graph problems daily for 4 weeks.",
    "Tailor resume keywords per company using Company Prep guides.",
    "Schedule weekly mock technical interviews to stabilize performance.",
  ],
  scoreBreakdown: {
    cgpa: 85,
    dsa: 72,
    aptitude: 78,
    resume: 76,
    projects: 72,
    certifications: 60,
  },
};

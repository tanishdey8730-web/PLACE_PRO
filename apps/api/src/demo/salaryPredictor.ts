import type { SalaryPredictorResult } from "@placepro/shared";

export const demoSalaryPrediction: SalaryPredictorResult = {
  inputs: {
    skills: ["Python", "React", "AWS", "System Design"],
    experienceYears: 1,
    location: "Bangalore",
    companyType: "PRODUCT",
    role: "Software Engineer",
  },
  salaryRange: {
    minLpa: 10.5,
    maxLpa: 16.8,
    medianLpa: 13.2,
    currency: "INR",
    period: "annual",
  },
  marketInsights: [
    {
      title: "Bangalore product hiring",
      description:
        "Series B–D startups and mid-size product firms are actively hiring 0–2 YOE engineers with full-stack + cloud exposure.",
      trend: "up",
    },
    {
      title: "Compensation structure",
      description:
        "Typical split: 70% fixed, 20% variable, 10% ESOP for product companies at this experience band.",
      trend: "stable",
    },
    {
      title: "Skill premium",
      description:
        "AWS + system design keywords on resume correlate with 15–20% higher median offers vs baseline full-stack profiles.",
      trend: "up",
    },
  ],
  growthPotential: {
    score: 78,
    outlook:
      "Strong growth potential via internal promotion or switching to FAANG-tier after 2–3 years of DSA and system design depth.",
    factors: [
      "1 year experience — early career acceleration phase",
      "Product company type supports equity upside",
      "High-demand cloud and frontend skills",
    ],
    fiveYearProjection: {
      minLpa: 21,
      maxLpa: 37,
    },
  },
};

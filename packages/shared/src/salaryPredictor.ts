export type SalaryCompanyType =
  | "PRODUCT"
  | "SERVICE"
  | "STARTUP"
  | "FAANG"
  | "MNC"
  | "CONSULTING";

export const SALARY_COMPANY_TYPES: { id: SalaryCompanyType; label: string }[] = [
  { id: "PRODUCT", label: "Product / Tech" },
  { id: "FAANG", label: "FAANG / Big Tech" },
  { id: "STARTUP", label: "Startup" },
  { id: "MNC", label: "MNC" },
  { id: "SERVICE", label: "IT Services" },
  { id: "CONSULTING", label: "Consulting" },
];

export interface SalaryRange {
  minLpa: number;
  maxLpa: number;
  medianLpa: number;
  currency: string;
  period: "annual";
}

export interface MarketInsight {
  title: string;
  description: string;
  trend: "up" | "stable" | "down";
}

export interface GrowthPotential {
  score: number;
  outlook: string;
  factors: string[];
  fiveYearProjection?: {
    minLpa: number;
    maxLpa: number;
  };
}

export interface SalaryPredictorInput {
  skills: string[];
  experienceYears: number;
  location: string;
  companyType: SalaryCompanyType;
  role?: string;
}

export interface SalaryPredictorResult {
  id?: string;
  inputs: SalaryPredictorInput;
  salaryRange: SalaryRange;
  marketInsights: MarketInsight[];
  growthPotential: GrowthPotential;
  createdAt?: string;
}

export interface SalaryPredictorHistoryItem {
  id: string;
  role?: string | null;
  location: string;
  companyType: SalaryCompanyType;
  medianLpa: number;
  createdAt: string;
}

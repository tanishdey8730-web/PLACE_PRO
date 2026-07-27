export interface CareerCoachDashboard {
  careerScore: number;
  placementProbability: number;
  industryReadinessScore: number;
  skillRadar: { subject: string; score: number }[];
  growthGraph: { week: string; score: number }[];
  weeklyProgress: { week: string; tasksCompleted: number; hoursSpent: number }[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendedRoles: string[];
  salaryRange: { minLpa: number; maxLpa: number; medianLpa: number };
  learningRecommendations: string[];
  improvementSuggestions: string[];
  roadmaps: {
    days30: CareerRoadmapPhase[];
    days60: CareerRoadmapPhase[];
    days90: CareerRoadmapPhase[];
  };
}

export interface CareerRoadmapPhase {
  week: string;
  focus: string;
  tasks: string[];
  milestones: string[];
}

export interface AnalyticsDashboard {
  placementReadiness: number;
  codingScore: number;
  aptitudeScore: number;
  interviewScore: number;
  resumeScore: number;
  skillRadar: { subject: string; score: number }[];
  problemStatus: { name: string; value: number; color: string }[];
  readinessTrend: { week: string; score: number }[];
  activityHeatmap: { day: string; count: number }[];
  interviewSuccessRate: number;
  skillGrowth: { skill: string; delta: number }[];
}

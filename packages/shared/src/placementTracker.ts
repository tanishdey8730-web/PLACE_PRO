export type PlacementTrackerStage =
  | "APPLIED"
  | "OA_CLEARED"
  | "INTERVIEW_SCHEDULED"
  | "HR_ROUND"
  | "SELECTED"
  | "REJECTED";

export const PLACEMENT_TRACKER_STAGES: {
  id: PlacementTrackerStage;
  label: string;
  color: string;
}[] = [
  { id: "APPLIED", label: "Applied", color: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { id: "OA_CLEARED", label: "OA Cleared", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  {
    id: "INTERVIEW_SCHEDULED",
    label: "Interview Scheduled",
    color: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  { id: "HR_ROUND", label: "HR Round", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { id: "SELECTED", label: "Selected", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-500/15 text-red-600 dark:text-red-400" },
];

export interface PlacementTrackerEntry {
  id: string;
  companyName: string;
  role: string;
  location?: string | null;
  jobType?: string | null;
  stage: PlacementTrackerStage;
  appliedAt: string;
  nextEventAt?: string | null;
  notes?: string | null;
  salaryOffer?: string | null;
  updatedAt: string;
}

export interface PlacementTrackerBoard {
  columns: Record<PlacementTrackerStage, PlacementTrackerEntry[]>;
  stats: PlacementTrackerStats;
}

export interface PlacementTrackerStats {
  total: number;
  active: number;
  selected: number;
  rejected: number;
  inProgress: number;
  successRate: number;
  stageCounts: Record<PlacementTrackerStage, number>;
  funnel: { stage: PlacementTrackerStage; label: string; count: number; percent: number }[];
}

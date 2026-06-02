import type {
  PlacementApplication,
  PlacementTrackerBoard,
  PlacementTrackerEntry,
  PlacementTrackerStage,
} from "@placepro/shared";
import { PLACEMENT_TRACKER_STAGES } from "@placepro/shared";

export let demoPlacementEntries: PlacementTrackerEntry[] = [
  {
    id: "pt-1",
    companyName: "Google",
    role: "Software Engineer Intern",
    location: "Bangalore",
    jobType: "Internship",
    stage: "INTERVIEW_SCHEDULED",
    appliedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    nextEventAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    notes: "Technical round on Friday",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pt-2",
    companyName: "Microsoft",
    role: "SDE",
    location: "Hyderabad",
    jobType: "Full-time",
    stage: "OA_CLEARED",
    appliedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    notes: "Waiting for interview slot",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pt-3",
    companyName: "Amazon",
    role: "SDE-1",
    location: "Remote",
    jobType: "Full-time",
    stage: "APPLIED",
    appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pt-4",
    companyName: "Infosys",
    role: "Systems Engineer",
    location: "Pune",
    jobType: "Full-time",
    stage: "SELECTED",
    appliedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    salaryOffer: "6.5 LPA",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pt-5",
    companyName: "Startup XYZ",
    role: "Full Stack Developer",
    stage: "REJECTED",
    appliedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    notes: "Rejected after HR — culture fit",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pt-6",
    companyName: "Meta",
    role: "Production Engineer",
    location: "London",
    jobType: "Full-time",
    stage: "HR_ROUND",
    appliedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    nextEventAt: new Date(Date.now() + 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function emptyColumns(): Record<PlacementTrackerStage, PlacementTrackerEntry[]> {
  return {
    APPLIED: [],
    OA_CLEARED: [],
    INTERVIEW_SCHEDULED: [],
    HR_ROUND: [],
    SELECTED: [],
    REJECTED: [],
  };
}

export function buildBoard(entries: PlacementTrackerEntry[]): PlacementTrackerBoard {
  const columns = emptyColumns();
  for (const e of entries) {
    columns[e.stage].push(e);
  }
  for (const stage of PLACEMENT_TRACKER_STAGES) {
    columns[stage.id].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  const total = entries.length;
  const selected = entries.filter((e) => e.stage === "SELECTED").length;
  const rejected = entries.filter((e) => e.stage === "REJECTED").length;
  const active = total - rejected;
  const inProgress = entries.filter(
    (e) => !["SELECTED", "REJECTED"].includes(e.stage)
  ).length;

  const stageCounts = {} as Record<PlacementTrackerStage, number>;
  for (const s of PLACEMENT_TRACKER_STAGES) {
    stageCounts[s.id] = columns[s.id].length;
  }

  const funnel = PLACEMENT_TRACKER_STAGES.map((s) => ({
    stage: s.id,
    label: s.label,
    count: stageCounts[s.id],
    percent: total ? Math.round((stageCounts[s.id] / total) * 100) : 0,
  }));

  return {
    columns,
    stats: {
      total,
      active,
      selected,
      rejected,
      inProgress,
      successRate: total ? Math.round((selected / total) * 100) : 0,
      stageCounts,
      funnel,
    },
  };
}

import { prisma } from "@placepro/database";
import type { CareerCoachDashboard } from "@placepro/shared";
import { demoCareerCoachDashboard } from "../demo/careerCoachDashboard.js";
import { computeLocalSalaryPrediction } from "./salaryPredictorScoring.js";

export async function buildCareerCoachDashboard(
  userId: string,
  targetRole: string
): Promise<CareerCoachDashboard> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { skills: true, college: true, graduationYear: true },
  });
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });

  const skills = user?.skills ?? ["Java", "Python", "DSA"];
  const codingScore = profile?.codingScore ?? 65;
  const aptitudeScore = profile?.aptitudeScore ?? 70;
  const resumeScore = profile?.resumeAtsScore ?? 75;
  const placementReadiness = profile?.placementReadiness ?? 68;

  const salary = computeLocalSalaryPrediction({
    skills,
    experienceYears: 0,
    location: "Bangalore",
    companyType: "PRODUCT",
    role: targetRole,
  });

  const missingSkills =
    codingScore < 70
      ? ["Advanced DP", "Graph algorithms", "System Design"]
      : ["Kubernetes", "System Design"];

  const dashboard: CareerCoachDashboard = {
    ...demoCareerCoachDashboard,
    careerScore: Math.round((codingScore + aptitudeScore + resumeScore) / 3),
    placementProbability: placementReadiness,
    industryReadinessScore: Math.round((placementReadiness + codingScore) / 2),
    skillRadar: [
      { subject: "DSA", score: codingScore },
      { subject: "Projects", score: Math.min(100, resumeScore + 5) },
      { subject: "Aptitude", score: aptitudeScore },
      { subject: "Communication", score: profile?.interviewScore ?? 65 },
      { subject: "Resume", score: resumeScore },
      { subject: "System Design", score: Math.max(30, codingScore - 25) },
    ],
    missingSkills,
    recommendedRoles: [targetRole, "Backend Engineer", "Full Stack Developer"],
    salaryRange: {
      minLpa: salary.salaryRange.minLpa,
      maxLpa: salary.salaryRange.maxLpa,
      medianLpa: salary.salaryRange.medianLpa,
    },
    strengths:
      codingScore >= 70
        ? ["Strong DSA foundation", "Good practice consistency"]
        : ["Motivated learner", "Solid fundamentals"],
    weaknesses: missingSkills.map((s) => `Gap in ${s}`),
  };

  return dashboard;
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import codingRoutes from "./routes/coding.js";
import aptitudeRoutes from "./routes/aptitude.js";
import resumeRoutes from "./routes/resume.js";
import interviewRoutes from "./routes/interviews.js";
import learningRoutes from "./routes/learning.js";
import contestRoutes from "./routes/contests.js";
import jobRoutes from "./routes/jobs.js";
import mentorRoutes from "./routes/mentors.js";
import communityRoutes from "./routes/community.js";
import adminRoutes from "./routes/admin.js";
import dashboardRoutes from "./routes/dashboard.js";
import careerRoutes from "./routes/career.js";
import roadmapRoutes from "./routes/roadmap.js";
import assessmentRoutes from "./routes/assessment.js";
import companyPrepRoutes from "./routes/companyPrep.js";
import resumeBuilderRoutes from "./routes/resumeBuilder.js";
import linkedinAnalysisRoutes from "./routes/linkedinAnalysis.js";
import coverLetterRoutes from "./routes/coverLetter.js";
import placementProbabilityRoutes from "./routes/placementProbability.js";
import careerCoachRoutes from "./routes/careerCoach.js";
import jobMatchRoutes from "./routes/jobMatch.js";
import hrInterviewRoutes from "./routes/hrInterview.js";
import collabRoutes from "./routes/collab.js";
import systemDesignRoutes from "./routes/systemDesign.js";
import projectReviewRoutes from "./routes/projectReview.js";
import githubAnalysisRoutes from "./routes/githubAnalysis.js";
import dailyChallengesRoutes from "./routes/dailyChallenges.js";
import recruiterRoutes from "./routes/recruiter.js";
import referralRoutes from "./routes/referrals.js";
import placementTrackerRoutes from "./routes/placementTracker.js";
import networkingAssistantRoutes from "./routes/networkingAssistant.js";
import salaryPredictorRoutes from "./routes/salaryPredictor.js";
import analyticsRoutes from "./routes/analytics.js";
import interviewExperiencesRoutes from "./routes/interviewExperiences.js";
import codingBattlesRoutes from "./routes/codingBattles.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(rateLimit);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "placepro-api", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/aptitude", aptitudeRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/company-prep", companyPrepRoutes);
app.use("/api/resume-builder", resumeBuilderRoutes);
app.use("/api/linkedin-analysis", linkedinAnalysisRoutes);
app.use("/api/cover-letter", coverLetterRoutes);
app.use("/api/placement-probability", placementProbabilityRoutes);
app.use("/api/career-coach", careerCoachRoutes);
app.use("/api/job-match", jobMatchRoutes);
app.use("/api/hr-interview", hrInterviewRoutes);
app.use("/api/collab", collabRoutes);
app.use("/api/system-design", systemDesignRoutes);
app.use("/api/project-review", projectReviewRoutes);
app.use("/api/github-analysis", githubAnalysisRoutes);
app.use("/api/daily-challenges", dailyChallengesRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/placement-tracker", placementTrackerRoutes);
app.use("/api/networking-assistant", networkingAssistantRoutes);
app.use("/api/salary-predictor", salaryPredictorRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/interview-experiences", interviewExperiencesRoutes);
app.use("/api/coding-battles", codingBattlesRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;

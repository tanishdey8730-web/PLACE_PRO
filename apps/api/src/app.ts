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
app.use("/api/resume", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;

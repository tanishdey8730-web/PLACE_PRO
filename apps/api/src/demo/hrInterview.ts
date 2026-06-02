import type { HrInterviewReport } from "@placepro/shared";
import { STANDARD_HR_QUESTIONS } from "../data/hrInterview/questions.js";

export const demoHrReport: HrInterviewReport = {
  id: "demo-hr-interview",
  targetRole: "Software Engineer",
  companyName: "Example Corp",
  questions: STANDARD_HR_QUESTIONS,
  answers: STANDARD_HR_QUESTIONS.map((q) => ({
    questionId: q.id,
    question: q.question,
    answer: "Sample answer provided during demo mode.",
  })),
  scores: {
    communication: 82,
    confidence: 78,
    clarity: 80,
    professionalism: 85,
    overall: 81,
  },
  questionFeedback: [
    { questionId: "about", score: 85, feedback: "Good structure; add a clear hook and target role in the first sentence." },
    { questionId: "strengths", score: 80, feedback: "Mention 2–3 strengths with brief examples." },
    { questionId: "weaknesses", score: 75, feedback: "Frame weakness with improvement steps (STAR)." },
    { questionId: "career_goals", score: 78, feedback: "Align goals with the company and role." },
    { questionId: "why_hire", score: 88, feedback: "Strong closing — quantify value where possible." },
  ],
  summary:
    "Solid HR interview performance with clear communication and professional tone. Focus on sharper openings and more metrics in your answers.",
  strengths: [
    "Professional and polite tone throughout",
    "Answers stay relevant to the role",
    "Good enthusiasm for the opportunity",
  ],
  improvements: [
    "Use STAR format for behavioral points",
    "Reduce filler words (um, like, actually)",
    "Open with role + value proposition in 30 seconds",
  ],
  recommendations: [
    "Practice 60-second 'Tell me about yourself' daily",
    "Record answers and review pace and clarity",
    "Prepare one metric-backed story per question",
  ],
};

const AI_BASE = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function analyzeResume(fileUrl: string, userId: string) {
  const res = await fetch(`${AI_BASE}/api/resume/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_url: fileUrl, user_id: userId }),
  });
  if (!res.ok) throw new Error("AI resume analysis failed");
  return res.json();
}

export async function generateInterviewQuestions(type: string, role: string) {
  const res = await fetch(`${AI_BASE}/api/interview/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interview_type: type, target_role: role }),
  });
  if (!res.ok) throw new Error("Failed to generate questions");
  return res.json();
}

export async function analyzeInterview(transcript: unknown, type: string) {
  const res = await fetch(`${AI_BASE}/api/interview/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, interview_type: type }),
  });
  if (!res.ok) throw new Error("Interview analysis failed");
  return res.json();
}

export async function generateCareerPlan(profile: Record<string, unknown>) {
  const res = await fetch(`${AI_BASE}/api/career/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Career plan generation failed");
  return res.json();
}

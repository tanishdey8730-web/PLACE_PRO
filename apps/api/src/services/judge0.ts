import { JUDGE0_LANGUAGE_IDS } from "@placepro/shared";

const JUDGE0_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";

export async function submitToJudge0(
  code: string,
  language: string,
  stdin?: string,
  expectedOutput?: string
) {
  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
  }

  const createRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      stdin: stdin || "",
      expected_output: expectedOutput,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Judge0 submission failed: ${err}`);
  }

  const { token } = (await createRes.json()) as { token: string };

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const resultRes = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false`, {
      headers,
    });
    const result = (await resultRes.json()) as {
      status: { id: number; description: string };
      stdout: string | null;
      stderr: string | null;
      time: string | null;
      memory: number | null;
      compile_output: string | null;
    };

    if (result.status.id <= 2) continue;

    return {
      status: mapJudgeStatus(result.status.description),
      stdout: result.stdout,
      stderr: result.stderr || result.compile_output,
      time: result.time ? parseFloat(result.time) * 1000 : null,
      memory: result.memory,
      token,
    };
  }

  throw new Error("Judge0 timeout");
}

function mapJudgeStatus(desc: string): string {
  const map: Record<string, string> = {
    Accepted: "ACCEPTED",
    "Wrong Answer": "WRONG_ANSWER",
    "Time Limit Exceeded": "TIME_LIMIT",
    "Memory Limit Exceeded": "MEMORY_LIMIT",
    "Runtime Error": "RUNTIME_ERROR",
    "Compilation Error": "COMPILE_ERROR",
  };
  return map[desc] || "RUNTIME_ERROR";
}

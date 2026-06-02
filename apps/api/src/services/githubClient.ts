import { AppError } from "../middleware/errorHandler.js";

export const GITHUB_API = "https://api.github.com";

export function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "PlacePro-GitHub-Analyzer",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function ghFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: githubHeaders() });
  if (res.status === 404) {
    throw new AppError(404, "GitHub user or resource not found");
  }
  if (res.status === 403) {
    throw new AppError(
      429,
      "GitHub API rate limit reached — try again later or add GITHUB_TOKEN on the server"
    );
  }
  if (!res.ok) {
    throw new AppError(502, `Failed to fetch from GitHub (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function normalizeUsername(input: string): string {
  const trimmed = input.trim().replace(/^@/, "");
  let username = trimmed;
  if (trimmed.includes("github.com")) {
    try {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0]) username = parts[0];
    } catch {
      throw new AppError(400, "Invalid GitHub profile URL");
    }
  }
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    throw new AppError(400, "Invalid GitHub username");
  }
  return username;
}

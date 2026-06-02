import { AppError } from "../middleware/errorHandler.js";
import { ghFetch, githubHeaders, GITHUB_API } from "./githubClient.js";

export interface ParsedGitHubRepo {
  owner: string;
  repo: string;
  fullName: string;
}

export interface GitHubRepoContext {
  parsed: ParsedGitHubRepo;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  primaryLanguage: string | null;
  topics: string[];
  license: string | null;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  languages: Record<string, number>;
  readme: string;
  rootFiles: string[];
  hasTests: boolean;
  hasCi: boolean;
  hasDocker: boolean;
  hasEnvExample: boolean;
  hasContributing: boolean;
}

export function parseGitHubUrl(input: string): ParsedGitHubRepo {
  const trimmed = input.trim();
  let path = trimmed;

  try {
    if (trimmed.includes("github.com")) {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      if (!url.hostname.replace("www.", "").endsWith("github.com")) {
        throw new Error("not github");
      }
      path = url.pathname;
    }
  } catch {
    throw new AppError(400, "Invalid GitHub repository URL");
  }

  const parts = path
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean);

  if (parts.length < 2) {
    throw new AppError(400, "URL must be in the form github.com/owner/repository");
  }

  const owner = parts[0]!;
  const repo = parts[1]!.replace(/\.git$/, "");

  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) {
    throw new AppError(400, "Invalid owner or repository name in URL");
  }

  return { owner, repo, fullName: `${owner}/${repo}` };
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
      headers: {
        ...githubHeaders(),
        Accept: "application/vnd.github.raw",
      },
    });
    if (!res.ok) return "";
    const text = await res.text();
    return text.slice(0, 8000);
  } catch {
    return "";
  }
}

type GhRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics?: string[];
  license: { spdx_id: string | null } | null;
  default_branch: string;
  created_at: string;
  updated_at: string;
};

type GhContent = { name: string; type: string; path: string };

function detectFlags(names: string[]) {
  const lower = names.map((n) => n.toLowerCase());
  const joined = lower.join(" ");
  return {
    hasTests:
      lower.some((n) => n === "test" || n === "tests" || n === "__tests__") ||
      joined.includes(".test.") ||
      joined.includes(".spec."),
    hasCi: lower.includes(".github") || lower.some((n) => n.includes("workflow")),
    hasDocker: lower.includes("dockerfile") || lower.includes("docker-compose.yml"),
    hasEnvExample:
      lower.includes(".env.example") || lower.includes("env.example") || lower.includes(".env.sample"),
    hasContributing: lower.includes("contributing.md"),
  };
}

export async function fetchGitHubRepoContext(repoUrl: string): Promise<GitHubRepoContext> {
  const parsed = parseGitHubUrl(repoUrl);
  const { owner, repo } = parsed;

  const [meta, languages, contents] = await Promise.all([
    ghFetch<GhRepo>(`/repos/${owner}/${repo}`),
    ghFetch<Record<string, number>>(`/repos/${owner}/${repo}/languages`).catch(() => ({})),
    ghFetch<GhContent[]>(`/repos/${owner}/${repo}/contents`).catch(() => []),
  ]);

  const readme = await fetchReadme(owner, repo);
  const rootFiles = contents.map((c) => (c.type === "dir" ? `${c.name}/` : c.name));
  const flags = detectFlags(rootFiles);

  return {
    parsed,
    name: meta.name,
    fullName: meta.full_name,
    description: meta.description,
    htmlUrl: meta.html_url,
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    openIssues: meta.open_issues_count,
    primaryLanguage: meta.language,
    topics: meta.topics ?? [],
    license: meta.license?.spdx_id ?? null,
    defaultBranch: meta.default_branch,
    createdAt: meta.created_at,
    updatedAt: meta.updated_at,
    languages,
    readme,
    rootFiles,
    ...flags,
  };
}

export function buildRepoAnalysisPayload(ctx: GitHubRepoContext): string {
  const langList = Object.entries(ctx.languages)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, bytes]) => `${lang} (${bytes} bytes)`)
    .join(", ");

  return `
Repository: ${ctx.fullName}
URL: ${ctx.htmlUrl}
Description: ${ctx.description ?? "(none)"}
Stars: ${ctx.stars} | Forks: ${ctx.forks} | Open issues: ${ctx.openIssues}
Primary language: ${ctx.primaryLanguage ?? "unknown"}
Languages: ${langList || "unknown"}
Topics: ${ctx.topics.join(", ") || "(none)"}
License: ${ctx.license ?? "(none)"}
Default branch: ${ctx.defaultBranch}
Last updated: ${ctx.updatedAt}

Structure flags:
- Has tests: ${ctx.hasTests}
- Has CI/workflows: ${ctx.hasCi}
- Has Docker: ${ctx.hasDocker}
- Has .env.example: ${ctx.hasEnvExample}
- Has CONTRIBUTING: ${ctx.hasContributing}

Root files/folders:
${ctx.rootFiles.map((f) => `- ${f}`).join("\n") || "(empty or unavailable)"}

README excerpt:
${ctx.readme || "(no README found)"}
`.trim();
}

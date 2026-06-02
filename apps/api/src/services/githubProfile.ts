import { ghFetch } from "./githubClient.js";

export interface GitHubUserRepo {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  topics: string[];
  pushedAt: string;
  createdAt: string;
  hasReadme: boolean;
  isFork: boolean;
  license: string | null;
}

export interface GitHubProfileContext {
  username: string;
  profileUrl: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitterUsername: string | null;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
  repos: GitHubUserRepo[];
  languageCounts: Record<string, number>;
  totalStars: number;
  totalForks: number;
  reposWithDescription: number;
  reposWithTopics: number;
  originalRepos: number;
  forkedRepos: number;
  recentPushCount: number;
  eventCount30d: number;
  pushEvents30d: number;
  prEvents30d: number;
  issueEvents30d: number;
}

type GhUser = {
  login: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
};

type GhRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  pushed_at: string;
  created_at: string;
  fork: boolean;
  license: { spdx_id: string | null } | null;
  has_wiki?: boolean;
};

type GhEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
};

export async function fetchGitHubProfileContext(username: string): Promise<GitHubProfileContext> {
  const [user, repos, events] = await Promise.all([
    ghFetch<GhUser>(`/users/${username}`),
    ghFetch<GhRepo[]>(`/users/${username}/repos?sort=updated&per_page=100`).catch(() => []),
    ghFetch<GhEvent[]>(`/users/${username}/events/public?per_page=100`).catch(() => []),
  ]);

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentEvents = events.filter((e) => new Date(e.created_at).getTime() >= thirtyDaysAgo);

  const mappedRepos: GitHubUserRepo[] = repos.map((r) => ({
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    htmlUrl: r.html_url,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    openIssues: r.open_issues_count,
    topics: r.topics ?? [],
    pushedAt: r.pushed_at,
    createdAt: r.created_at,
    hasReadme: true,
    isFork: r.fork,
    license: r.license?.spdx_id ?? null,
  }));

  const languageCounts: Record<string, number> = {};
  for (const r of mappedRepos) {
    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] ?? 0) + 1;
    }
  }

  const originalRepos = mappedRepos.filter((r) => !r.isFork);
  const recentPushCount = mappedRepos.filter(
    (r) => new Date(r.pushedAt).getTime() >= thirtyDaysAgo
  ).length;

  return {
    username: user.login,
    profileUrl: user.html_url,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    location: user.location,
    company: user.company,
    blog: user.blog,
    twitterUsername: user.twitter_username,
    publicRepos: user.public_repos,
    publicGists: user.public_gists,
    followers: user.followers,
    following: user.following,
    createdAt: user.created_at,
    repos: mappedRepos,
    languageCounts,
    totalStars: mappedRepos.reduce((s, r) => s + r.stars, 0),
    totalForks: mappedRepos.reduce((s, r) => s + r.forks, 0),
    reposWithDescription: mappedRepos.filter((r) => r.description).length,
    reposWithTopics: mappedRepos.filter((r) => r.topics.length > 0).length,
    originalRepos: originalRepos.length,
    forkedRepos: mappedRepos.length - originalRepos.length,
    recentPushCount,
    eventCount30d: recentEvents.length,
    pushEvents30d: recentEvents.filter((e) => e.type === "PushEvent").length,
    prEvents30d: recentEvents.filter((e) => e.type === "PullRequestEvent").length,
    issueEvents30d: recentEvents.filter(
      (e) => e.type === "IssuesEvent" || e.type === "IssueCommentEvent"
    ).length,
  };
}

export function buildProfileAnalysisPayload(ctx: GitHubProfileContext): string {
  const topRepos = [...ctx.repos]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 15)
    .map(
      (r) =>
        `- ${r.fullName} | ★${r.stars} | ${r.language ?? "unknown"} | fork:${r.isFork} | ${r.description ?? "no desc"}`
    )
    .join("\n");

  const langs = Object.entries(ctx.languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => `${lang}: ${count} repos`)
    .join(", ");

  return `
GitHub User: ${ctx.username}
Profile: ${ctx.profileUrl}
Name: ${ctx.name ?? "(none)"}
Bio: ${ctx.bio ?? "(none)"}
Location: ${ctx.location ?? "(none)"} | Company: ${ctx.company ?? "(none)"}
Account created: ${ctx.createdAt}
Followers: ${ctx.followers} | Following: ${ctx.following}
Public repos (API count): ${ctx.publicRepos} | Fetched repos: ${ctx.repos.length}

Portfolio stats:
- Total stars across fetched repos: ${ctx.totalStars}
- Total forks: ${ctx.totalForks}
- Original repos: ${ctx.originalRepos} | Forks: ${ctx.forkedRepos}
- Repos with description: ${ctx.reposWithDescription}
- Repos with topics/tags: ${ctx.reposWithTopics}
- Repos pushed in last 30 days: ${ctx.recentPushCount}

Languages (by repo count): ${langs || "none detected"}

Activity (last 30 days, from public events sample):
- Total events: ${ctx.eventCount30d}
- Push events: ${ctx.pushEvents30d}
- PR events: ${ctx.prEvents30d}
- Issue events: ${ctx.issueEvents30d}

Top repositories:
${topRepos || "(none)"}
`.trim();
}

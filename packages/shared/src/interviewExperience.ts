export type InterviewExperienceDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface InterviewExperienceItem {
  id: string;
  companyName: string;
  role: string;
  interviewDate?: string | null;
  questionsAsked: string;
  difficulty: InterviewExperienceDifficulty;
  tips?: string | null;
  tags: string[];
  upvoteCount: number;
  downvoteCount: number;
  shareCount: number;
  commentCount: number;
  author: { name: string; avatar?: string | null };
  userVote?: 1 | -1 | 0;
  saved?: boolean;
  createdAt: string;
  trendingScore?: number;
}

export interface InterviewExperienceComment {
  id: string;
  content: string;
  author: { name: string; avatar?: string | null };
  createdAt: string;
}

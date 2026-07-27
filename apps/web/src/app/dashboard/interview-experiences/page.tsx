"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  MessageCircle,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { InterviewExperienceItem } from "@placepro/shared";

export default function InterviewExperiencesPage() {
  const [items, setItems] = useState<InterviewExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"recent" | "trending">("trending");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    role: "",
    questionsAsked: "",
    difficulty: "MEDIUM" as const,
    tips: "",
    tags: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (search) params.set("q", search);
    const res = await api<InterviewExperienceItem[]>(
      `/api/interview-experiences?${params.toString()}`
    );
    setLoading(false);
    if (res.success && res.data) setItems(res.data);
  }, [sort, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    const res = await api<InterviewExperienceItem>("/api/interview-experiences", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.success) {
      setShowForm(false);
      setForm({ companyName: "", role: "", questionsAsked: "", difficulty: "MEDIUM", tips: "", tags: "" });
      load();
    }
  }

  async function vote(id: string, voteVal: 1 | -1) {
    await api(`/api/interview-experiences/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote: voteVal }),
    });
    load();
  }

  async function save(id: string) {
    await api(`/api/interview-experiences/${id}/save`, { method: "POST" });
    load();
  }

  async function share(id: string) {
    await api(`/api/interview-experiences/${id}/share`, { method: "POST" });
    if (navigator.share) {
      await navigator.share({ title: "Interview Experience", url: window.location.href });
    }
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-3xl mx-auto pb-24 lg:pb-8">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Interview Experience Community</h1>
            <p className="text-muted-foreground mt-1">
              Real questions, difficulty ratings, and tips from peers
            </p>
          </div>
          <Button variant="gradient" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" />
            Share experience
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search company, role, questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <Button variant={sort === "trending" ? "default" : "outline"} size="sm" onClick={() => setSort("trending")}>
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            Trending
          </Button>
          <Button variant={sort === "recent" ? "default" : "outline"} size="sm" onClick={() => setSort("recent")}>
            Recent
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Post your experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Company name" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
              <Input placeholder="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Questions asked (rounds, topics, difficulty)…"
                value={form.questionsAsked}
                onChange={(e) => setForm((f) => ({ ...f, questionsAsked: e.target.value }))}
              />
              <Input placeholder="Tips (optional)" value={form.tips} onChange={(e) => setForm((f) => ({ ...f, tips: e.target.value }))} />
              <Input placeholder="Tags: amazon, oa, intern" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
              <div className="flex gap-2">
                <Button onClick={submit}>Publish</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="py-4 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            : items.map((item) => (
                <Card key={item.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          type="button"
                          aria-label="Upvote"
                          onClick={() => vote(item.id, 1)}
                          className={cn(item.userVote === 1 && "text-primary")}
                        >
                          <ThumbsUp className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium">{item.upvoteCount - item.downvoteCount}</span>
                        <button
                          type="button"
                          aria-label="Downvote"
                          onClick={() => vote(item.id, -1)}
                          className={cn(item.userVote === -1 && "text-destructive")}
                        >
                          <ThumbsDown className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{item.companyName}</h3>
                          <Badge variant="secondary" className="font-normal">{item.role}</Badge>
                          <Badge
                            variant={
                              item.difficulty === "HARD"
                                ? "destructive"
                                : item.difficulty === "MEDIUM"
                                  ? "warning"
                                  : "secondary"
                            }
                            className="font-normal"
                          >
                            {item.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">by {item.author.name}</p>
                        <p className="text-sm mt-3 leading-relaxed">{item.questionsAsked}</p>
                        {item.tips && (
                          <p className="text-sm text-primary mt-2">Tip: {item.tips}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs font-normal">
                              #{t}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {item.commentCount}
                          </span>
                          <button type="button" className="flex items-center gap-1 hover:text-foreground" onClick={() => save(item.id)}>
                            <Bookmark className={cn("h-3.5 w-3.5", item.saved && "fill-current text-primary")} />
                            Save
                          </button>
                          <button type="button" className="flex items-center gap-1 hover:text-foreground" onClick={() => share(item.id)}>
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          {!loading && items.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                No experiences yet. Be the first to share!
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, MessageCircle, Plus } from "lucide-react";
import { api } from "@/lib/api";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  type: string;
  upvoteCount: number;
  user: { name: string; avatar?: string | null };
  _count?: { comments: number };
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api<CommunityPost[]>("/api/community/posts").then((res) => {
      setLoading(false);
      if (res.success && res.data) setPosts(res.data as CommunityPost[]);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createPost() {
    const res = await api("/api/community/posts", {
      method: "POST",
      body: JSON.stringify({ title, content, type: "DISCUSSION" }),
    });
    if (res.success) {
      setShowPost(false);
      setTitle("");
      setContent("");
      load();
    }
  }

  async function upvote(id: string) {
    await api(`/api/community/posts/${id}/upvote`, { method: "POST" });
    load();
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-3xl mx-auto pb-24 lg:pb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Community</h1>
            <p className="text-muted-foreground">Discussions, doubts & peer learning</p>
          </div>
          <Button variant="gradient" onClick={() => setShowPost((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" />
            New Post
          </Button>
        </div>

        {showPost && (
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea
                className="w-full min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button onClick={createPost}>Post</Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
            : posts.map((p) => (
                <Card key={p.id}>
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => upvote(p.id)}
                        className="flex flex-col items-center gap-1 px-2 text-muted-foreground hover:text-primary"
                      >
                        <ThumbsUp className="h-5 w-5" />
                        <span className="text-xs font-medium">{p.upvoteCount}</span>
                      </button>
                      <div className="flex-1">
                        <span className="text-xs text-primary">{p.type}</span>
                        <h3 className="font-medium mt-0.5">{p.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">by {p.user.name}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <MessageCircle className="h-3 w-3" /> {p._count?.comments ?? 0} comments
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </main>
    </>
  );
}

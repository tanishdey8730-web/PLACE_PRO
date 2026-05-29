"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle } from "lucide-react";

const posts = [
  { id: "1", title: "How to approach Graph problems?", author: "Rahul K.", upvotes: 42, comments: 8, type: "CODING" },
  { id: "2", title: "Amazon OA experience — 2026", author: "Priya S.", upvotes: 89, comments: 23, type: "DISCUSSION" },
  { id: "3", title: "DP pattern cheat sheet", author: "Ankit M.", upvotes: 156, comments: 31, type: "CODING" },
];

export default function CommunityPage() {
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Community</h1>
            <p className="text-muted-foreground">Discussions, doubts & peer learning</p>
          </div>
          <Button variant="gradient">New Post</Button>
        </div>
        <div className="space-y-4">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardContent className="py-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setUpvoted((s) => new Set(s).add(p.id))}
                    className={`flex flex-col items-center gap-1 px-2 ${upvoted.has(p.id) ? "text-primary" : "text-muted-foreground"}`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span className="text-xs font-medium">{p.upvotes + (upvoted.has(p.id) ? 1 : 0)}</span>
                  </button>
                  <div className="flex-1">
                    <span className="text-xs text-primary">{p.type}</span>
                    <h3 className="font-medium mt-0.5">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">by {p.author}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" /> {p.comments} comments
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

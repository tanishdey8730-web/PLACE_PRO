"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Search } from "lucide-react";

interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
  acceptance: number;
  companies: string[];
}

export default function CodingPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api<{ items: Problem[] }>("/api/coding/problems").then((res) => {
      if (res.success && res.data) setProblems(res.data.items);
      else setProblems([
        { id: "1", slug: "two-sum", title: "Two Sum", difficulty: "EASY", category: "ARRAYS", acceptance: 48.5, companies: ["Google"] },
        { id: "2", slug: "reverse-linked-list", title: "Reverse Linked List", difficulty: "EASY", category: "LINKED_LIST", acceptance: 62, companies: ["Meta"] },
      ]);
    });
  }, []);

  const filtered = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(filter.toLowerCase()) ||
      p.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold mb-2">Coding Practice</h1>
        <p className="text-muted-foreground mb-6">5000+ problems with multi-language support</p>
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Filter by title or category..." className="pl-9" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div className="space-y-2">
          {filtered.map((p) => (
            <Link key={p.slug} href={`/dashboard/coding/${p.slug}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.category.replace(/_/g, " ")} · {p.acceptance}% acceptance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.companies.slice(0, 2).map((c) => (
                      <Badge key={c} variant="secondary" className="hidden sm:inline-flex">{c}</Badge>
                    ))}
                    <Badge variant={p.difficulty === "EASY" ? "success" : p.difficulty === "MEDIUM" ? "warning" : "destructive"}>
                      {p.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

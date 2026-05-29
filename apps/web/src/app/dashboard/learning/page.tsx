"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { api } from "@/lib/api";

const defaultCourses = [
  { slug: "dsa-fundamentals", title: "DSA Fundamentals", category: "DSA", duration: 40, _count: { lessons: 24 } },
  { slug: "system-design", title: "System Design", category: "SYSTEM_DESIGN", duration: 30, _count: { lessons: 18 } },
  { slug: "dbms", title: "Database Management", category: "DBMS", duration: 20, _count: { lessons: 12 } },
];

export default function LearningPage() {
  const [courses, setCourses] = useState(defaultCourses);

  useEffect(() => {
    api<typeof defaultCourses>("/api/learning/courses").then((res) => {
      if (res.success && res.data) setCourses(res.data as typeof defaultCourses);
    });
  }, []);

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold">Learning Hub</h1>
        <p className="text-muted-foreground mt-1 mb-8">Structured courses with notes, videos & quizzes</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.slug} href={`/dashboard/learning/${c.slug}`}>
              <Card className="h-full hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{c.category} · {c.duration}h · {c._count.lessons} lessons</p>
                  <Progress value={35} className="mt-4" />
                  <p className="text-xs text-muted-foreground mt-1">35% complete</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

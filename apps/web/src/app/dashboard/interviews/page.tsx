"use client";

import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Video, MessageSquare, ChevronRight } from "lucide-react";

const INTERVIEW_TYPES = [
  {
    href: "/dashboard/interviews/technical",
    title: "Technical Interview",
    description: "DSA, system design & coding questions with AI feedback",
    icon: Mic,
    color: "from-purple-500 to-pink-500",
  },
  {
    href: "/dashboard/hr-interview",
    title: "HR Interview",
    description: "5 standard HR questions with full AI evaluation report",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
  },
  {
    href: "/dashboard/interviews/behavioral",
    title: "Behavioral Interview",
    description: "STAR method & situational questions",
    icon: Mic,
    color: "from-amber-500 to-orange-500",
  },
];

export default function InterviewsHubPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-3xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold">AI Mock Interviews</h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Pick an interview type — each opens on its own dedicated page
        </p>

        <div className="grid gap-4">
          {INTERVIEW_TYPES.map((t) => (
            <Link key={t.href} href={t.href} className="group block">
              <Card className="hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${t.color} text-white`}
                      >
                        <t.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {t.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="gradient" className="w-full sm:w-auto pointer-events-none">
                    <Video className="h-4 w-4 mr-2" />
                    Open {t.title}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

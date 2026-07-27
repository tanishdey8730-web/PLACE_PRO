"use client";

import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, BarChart3, MessageSquare, ChevronRight } from "lucide-react";

const OPTIONS = [
  {
    href: "/dashboard/career/chat",
    title: "AI Coach Chat",
    description: "Live conversation for skills, tech stack & placement strategy",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
  },
  {
    href: "/dashboard/career/dashboard",
    title: "Career Dashboard",
    description: "Career score, skill radar, 30/60/90 roadmaps & salary insights",
    icon: BarChart3,
    color: "from-indigo-500 to-purple-500",
  },
];

export default function CareerCoachHubPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-3xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          AI Career Coach
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Choose a tool — each opens on its own page
        </p>
        <div className="grid gap-4">
          {OPTIONS.map((opt) => (
            <Link key={opt.href} href={opt.href} className="group block">
              <Card className="hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${opt.color} text-white`}
                      >
                        <opt.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {opt.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

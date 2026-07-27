"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  Brain,
  FileText,
  Mic,
  BookOpen,
  Trophy,
  Briefcase,
  Users,
  BarChart3,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: Code2, title: "Coding Practice", desc: "5000+ problems with Judge0 execution, editorials & company tags.", href: "/dashboard/coding" },
  { icon: Brain, title: "Aptitude Tests", desc: "Quant, logical & verbal with timed mocks and analytics.", href: "/dashboard/aptitude" },
  { icon: FileText, title: "AI Resume Analyzer", desc: "ATS score, skill gaps, and optimization suggestions.", href: "/dashboard/resume" },
  { icon: Mic, title: "Mock Interviews", desc: "AI interviewer with voice, webcam & detailed feedback.", href: "/dashboard/interviews" },
  { icon: Bot, title: "AI Career Coach", desc: "Personalized learning paths and company recommendations.", href: "/dashboard/career" },
  { icon: BookOpen, title: "Structured Courses", desc: "DSA, System Design, DBMS, OS, Networks & more.", href: "/dashboard/learning" },
  { icon: Trophy, title: "Weekly Contests", desc: "Coding & aptitude challenges with leaderboards & certificates.", href: "/dashboard/contests" },
  { icon: Briefcase, title: "Job Portal", desc: "Browse jobs & internships, apply and track applications.", href: "/dashboard/jobs" },
  { icon: Users, title: "Mentorship", desc: "Book mentors with Zoom & Google Meet integration.", href: "/dashboard/mentors" },
  { icon: BarChart3, title: "Progress Analytics", desc: "Radar charts, heat maps, and skill growth tracking.", href: "/dashboard/analytics" },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything You Need to <span className="gradient-text">Get Placed</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            One platform combining the best of LeetCode, HackerRank, InterviewBit, and LinkedIn Learning.
          </p>
        </motion.div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={f.href} className="block h-full">
              <Card className="h-full hover:border-primary/30 transition-colors group cursor-pointer">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

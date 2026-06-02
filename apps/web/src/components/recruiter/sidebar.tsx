"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/recruiter", icon: LayoutDashboard, label: "Overview" },
  { href: "/recruiter/candidates", icon: Users, label: "Candidates" },
  { href: "/recruiter/jobs", icon: Briefcase, label: "Job Postings" },
  { href: "/recruiter/interviews", icon: Calendar, label: "Interviews" },
  { href: "/recruiter/analytics", icon: BarChart3, label: "Analytics" },
];

export function RecruiterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-background/80 backdrop-blur-xl hidden lg:flex flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border/50 px-6">
        <Briefcase className="h-6 w-6 text-primary" />
        <span className="font-bold text-sm">Recruiter Hub</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/recruiter" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Student dashboard
        </Link>
      </div>
    </aside>
  );
}

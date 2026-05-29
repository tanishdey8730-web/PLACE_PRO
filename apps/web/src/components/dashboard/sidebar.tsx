"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  Brain,
  FileText,
  Mic,
  BookOpen,
  Trophy,
  Briefcase,
  Users,
  MessageSquare,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/coding", icon: Code2, label: "Coding" },
  { href: "/dashboard/aptitude", icon: Brain, label: "Aptitude" },
  { href: "/dashboard/resume", icon: FileText, label: "Resume" },
  { href: "/dashboard/interviews", icon: Mic, label: "Interviews" },
  { href: "/dashboard/learning", icon: BookOpen, label: "Learning" },
  { href: "/dashboard/contests", icon: Trophy, label: "Contests" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/dashboard/mentors", icon: Users, label: "Mentors" },
  { href: "/dashboard/community", icon: MessageSquare, label: "Community" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/career", icon: Bot, label: "AI Coach" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-card/30 backdrop-blur-xl fixed inset-y-0 left-0 z-40">
        <div className="flex h-16 items-center gap-2 border-b border-border/50 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold gradient-text">PlacePro</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/50 p-4">
          <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl safe-area-pb">
        <div className="flex justify-around py-2">
          {nav.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-0.5 p-2 text-xs", active ? "text-primary" : "text-muted-foreground")}>
                <item.icon className="h-5 w-5" />
                <span className="truncate max-w-[4rem]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

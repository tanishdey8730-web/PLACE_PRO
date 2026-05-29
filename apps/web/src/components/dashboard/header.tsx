"use client";

import Link from "next/link";
import { Bell, Flame, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { clearAuthToken } from "@/lib/api";
import { enterGuestMode } from "@/lib/guest";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  streak?: number;
  level?: number;
}

export function DashboardHeader({ streak = 0, level = 1 }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/60 backdrop-blur-xl px-4 lg:px-8">
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search problems, courses..." className="pl-9 bg-muted/50" />
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <Badge variant="secondary" className="gap-1 hidden sm:flex">
          <Flame className="h-3 w-3 text-orange-500" />
          {streak} day streak
        </Badge>
        <Badge variant="default">Lv.{level}</Badge>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearAuthToken();
            enterGuestMode();
            router.refresh();
          }}
        >
          Guest
        </Button>
        <Link href="/dashboard/settings">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            S
          </div>
        </Link>
      </div>
    </header>
  );
}

"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Video } from "lucide-react";

const mentors = [
  { name: "Dr. Arjun Mehta", expertise: ["DSA", "System Design"], experience: 12, rating: 4.9, rate: 1500 },
  { name: "Sarah Chen", expertise: ["FAANG Interviews", "Resume"], experience: 8, rating: 4.8, rate: 2000 },
  { name: "Vikram Singh", expertise: ["Aptitude", "HR Rounds"], experience: 6, rating: 4.7, rate: 999 },
];

export default function MentorsPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold">Mentorship</h1>
        <p className="text-muted-foreground mt-1 mb-8">Book mentors · Zoom & Google Meet sessions</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m) => (
            <Card key={m.name}>
              <CardContent className="pt-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl font-bold mb-4">
                  {m.name[0]}
                </div>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.experience}+ years experience</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {m.rating}
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {m.expertise.map((e) => (
                    <span key={e} className="text-xs rounded-full bg-muted px-2 py-0.5">{e}</span>
                  ))}
                </div>
                <p className="mt-4 font-semibold">₹{m.rate}/hr</p>
                <Button variant="gradient" className="w-full mt-4">
                  <Video className="h-4 w-4 mr-2" /> Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}

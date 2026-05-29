"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Full name" defaultValue="Demo Student" />
            <Input placeholder="College" defaultValue="Demo University" />
            <Input placeholder="GitHub URL" />
            <Input placeholder="LinkedIn URL" />
            <Button variant="gradient">Save Changes</Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

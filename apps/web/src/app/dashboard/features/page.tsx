"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { FeatureHub } from "@/components/dashboard/feature-hub";

export default function FeaturesPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold">Explore Features</h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Every tool opens on its own page — pick what you want to work on
        </p>
        <FeatureHub showCategories title="" description="" />
      </main>
    </>
  );
}

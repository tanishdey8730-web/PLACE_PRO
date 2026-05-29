"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodingAnimation } from "./coding-animation";
import { AnimatedStats } from "./animated-stats";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24 mesh-bg">
      <div className="absolute inset-0 gradient-bg opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
              Trusted by 50,000+ students
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Crack Your Dream Job with{" "}
              <span className="gradient-text">AI-Powered</span> Placement Preparation
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Practice coding, aptitude, interviews, resume building, and career development on one
              platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button variant="gradient" size="lg" className="group">
                  Start Learning
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/dashboard/assessment">
                <Button variant="outline" size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Take Free Assessment
                </Button>
              </Link>
            </div>
            <AnimatedStats />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <CodingAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

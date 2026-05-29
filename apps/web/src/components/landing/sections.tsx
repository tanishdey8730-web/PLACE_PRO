"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Adobe", "Goldman Sachs"];

const process = [
  { step: "01", title: "Assess", desc: "Take free placement readiness assessment" },
  { step: "02", title: "Learn", desc: "Follow AI-curated learning roadmap" },
  { step: "03", title: "Practice", desc: "Code, aptitude & mock interviews daily" },
  { step: "04", title: "Apply", desc: "Optimized resume & job applications" },
  { step: "05", title: "Get Placed", desc: "Land your dream offer" },
];

const testimonials = [
  { name: "Priya Sharma", role: "SDE @ Google", text: "PlacePro's AI mock interviews were game-changing. I cracked Google in 4 months!" },
  { name: "Rahul Verma", role: "Analyst @ Goldman Sachs", text: "Aptitude module + resume analyzer helped me stand out from 10,000 applicants." },
  { name: "Ananya Patel", role: "Intern @ Microsoft", text: "The coding platform rivals LeetCode. Company-tagged questions are incredibly useful." },
];

const faqs = [
  { q: "Is PlacePro AI free to start?", a: "Yes! Free tier includes coding problems, basic aptitude, and one resume analysis." },
  { q: "Which companies hire through PlacePro?", a: "500+ partners including FAANG, product startups, and consulting firms." },
  { q: "How does AI mock interview work?", a: "Voice-based AI asks role-specific questions, analyzes speech, confidence, and technical accuracy." },
  { q: "Can I use PlacePro on mobile?", a: "Fully responsive with bottom navigation and offline learning support on mobile." },
];

const plans = [
  { name: "Free", price: "₹0", features: ["100 coding problems", "Basic aptitude", "1 resume scan", "Community access"], cta: "Get Started" },
  { name: "Pro", price: "₹999", period: "/mo", popular: true, features: ["Unlimited problems", "AI mock interviews", "Career coach", "Contest certificates"], cta: "Start Pro" },
  { name: "Premium", price: "₹2,499", period: "/mo", features: ["1:1 mentorship sessions", "Priority job referrals", "System design course", "Placement guarantee support"], cta: "Go Premium" },
];

export function PlacementProcess() {
  return (
    <section id="process" className="py-24 gradient-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold">Your Path to Placement</h2>
        <div className="mt-12 flex flex-col gap-4 md:flex-row md:justify-between">
          {process.map((p, i) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex-1 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-lg font-bold text-white">
                {p.step}
              </div>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Companies() {
  return (
    <section id="companies" className="py-16 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-sm text-muted-foreground mb-8">Students placed at top companies</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {companies.map((c) => (
            <span key={c} className="text-lg font-semibold text-muted-foreground/70 hover:text-foreground transition-colors">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SuccessStories() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold">Success Stories</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-primary">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoadmapPreview() {
  const weeks = ["Arrays & Strings", "Linked Lists", "Trees & Graphs", "Dynamic Programming", "System Design", "Mock Interviews"];
  return (
    <section className="py-24 mesh-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold">AI Learning Roadmap</h2>
        <div className="mt-12 space-y-3 max-w-2xl mx-auto">
          {weeks.map((w, i) => (
            <motion.div
              key={w}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 glass rounded-lg px-4 py-3"
            >
              <span className="text-sm font-mono text-primary">W{i + 1}</span>
              <span className="flex-1">{w}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-primary ring-2 ring-primary/20 relative" : ""}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-0.5 text-xs text-white">
                  Most Popular
                </span>
              )}
              <CardContent className="pt-8">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className="block mt-8">
                  <Button variant={plan.popular ? "gradient" : "outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold">FAQ</h2>
        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <CardContent className="pt-6">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-bold gradient-text">PlacePro AI</p>
        <p className="text-sm text-muted-foreground">© 2026 PlacePro AI. All rights reserved.</p>
      </div>
    </footer>
  );
}

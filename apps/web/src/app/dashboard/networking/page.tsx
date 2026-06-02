"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Sparkles,
  Building2,
  GraduationCap,
  UserCheck,
  Lightbulb,
  Linkedin,
  Copy,
  Check,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  NetworkContactSuggestion,
  NetworkingAssistantHistoryItem,
  NetworkingAssistantResult,
  NetworkingRecommendation,
  LinkedInOutreachSuggestion,
} from "@placepro/shared";

type Tab = "recruiters" | "alumni" | "mentors" | "recommendations" | "linkedin";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "recruiters", label: "Recruiters", icon: Building2 },
  { id: "alumni", label: "Alumni", icon: GraduationCap },
  { id: "mentors", label: "Mentors", icon: UserCheck },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "linkedin", label: "LinkedIn Outreach", icon: Linkedin },
];

function scoreClass(score: number) {
  if (score >= 85) return "text-emerald-500";
  if (score >= 70) return "text-blue-400";
  return "text-amber-500";
}

export default function NetworkingAssistantPage() {
  const [tab, setTab] = useState<Tab>("recruiters");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [companiesInput, setCompaniesInput] = useState("Google, Microsoft, Amazon");
  const [networkingGoal, setNetworkingGoal] = useState("campus placement and referrals");
  const [result, setResult] = useState<NetworkingAssistantResult | null>(null);
  const [history, setHistory] = useState<NetworkingAssistantHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadHistory = useCallback(() => {
    api<NetworkingAssistantHistoryItem[]>("/api/networking-assistant/history").then((res) => {
      if (res.success && res.data) setHistory(res.data);
    });
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function generate() {
    setLoading(true);
    const targetCompanies = companiesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await api<NetworkingAssistantResult>("/api/networking-assistant/generate", {
      method: "POST",
      body: JSON.stringify({
        targetRole,
        targetCompanies,
        networkingGoal,
      }),
    });
    setLoading(false);
    if (res.success && res.data) {
      setResult(res.data);
      loadHistory();
    }
  }

  async function loadSession(id: string) {
    const res = await api<NetworkingAssistantResult>(`/api/networking-assistant/${id}`);
    if (res.success && res.data) setResult(res.data);
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const contacts: NetworkContactSuggestion[] = result
    ? tab === "recruiters"
      ? result.recruiters
      : tab === "alumni"
        ? result.alumni
        : tab === "mentors"
          ? result.mentors
          : []
    : [];

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          AI Networking Assistant
        </h1>
        <p className="text-muted-foreground mt-1 mb-6">
          Recruiter, alumni, and mentor suggestions — networking tips and LinkedIn outreach drafts
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Your goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Target role</label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Target companies (comma-separated)</label>
                <Input
                  value={companiesInput}
                  onChange={(e) => setCompaniesInput(e.target.value)}
                  placeholder="Google, Microsoft"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Networking goal</label>
                <Input
                  value={networkingGoal}
                  onChange={(e) => setNetworkingGoal(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={generate} disabled={loading}>
                {loading ? "Generating…" : "Generate plan"}
              </Button>
              {history.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Recent sessions</p>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {history.map((h) => (
                      <li key={h.id}>
                        <button
                          type="button"
                          className="text-left text-sm w-full hover:text-primary truncate"
                          onClick={() => loadSession(h.id)}
                        >
                          {h.targetRole} · {new Date(h.createdAt).toLocaleDateString()}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {result ? (
              <>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed">{result.summary}</p>
                    {result.weeklyPlan.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.weeklyPlan.map((step, i) => (
                          <Badge key={i} variant="secondary" className="font-normal gap-1">
                            <Calendar className="h-3 w-3" />
                            {step}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-wrap gap-2">
                  {TABS.map((t) => (
                    <Button
                      key={t.id}
                      variant={tab === t.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTab(t.id)}
                    >
                      <t.icon className="mr-1.5 h-3.5 w-3.5" />
                      {t.label}
                    </Button>
                  ))}
                </div>

                {(tab === "recruiters" || tab === "alumni" || tab === "mentors") && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {contacts.map((c) => (
                      <ContactCard key={c.id} contact={c} />
                    ))}
                    {contacts.length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-2">No suggestions in this category.</p>
                    )}
                  </div>
                )}

                {tab === "recommendations" && (
                  <div className="space-y-3">
                    {result.recommendations.map((r) => (
                      <RecommendationCard key={r.id} item={r} />
                    ))}
                  </div>
                )}

                {tab === "linkedin" && (
                  <div className="space-y-4">
                    {result.linkedInOutreach.map((o) => (
                      <OutreachCard
                        key={o.id}
                        outreach={o}
                        copied={copiedId === o.id}
                        onCopy={() => copyText(o.message, o.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Set your target role and companies, then generate your networking plan.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center">
          Platform mentors can be booked in{" "}
          <Link href="/dashboard/mentors" className="text-primary hover:underline">
            Mentors
          </Link>
          . Track applications in{" "}
          <Link href="/dashboard/placement-tracker" className="text-primary hover:underline">
            Placement Tracker
          </Link>
          .
        </p>
      </main>
    </>
  );
}

function ContactCard({ contact }: { contact: NetworkContactSuggestion }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="font-medium">{contact.name}</p>
            <p className="text-sm text-muted-foreground">{contact.title}</p>
            {contact.company && (
              <p className="text-xs text-muted-foreground mt-0.5">{contact.company}</p>
            )}
            {contact.college && (
              <p className="text-xs text-muted-foreground">{contact.college}</p>
            )}
          </div>
          <span className={cn("text-sm font-semibold", scoreClass(contact.matchScore))}>
            {contact.matchScore}%
          </span>
        </div>
        <p className="text-sm mt-3">{contact.reason}</p>
        <p className="text-xs text-primary mt-2">{contact.connectionTip}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {contact.isPlatformUser && (
            <Badge variant="success" className="text-xs font-normal">
              PlacePro
            </Badge>
          )}
          {contact.linkedinUrl && (
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Linkedin className="h-3 w-3" />
              Profile
            </a>
          )}
          {contact.isPlatformUser && contact.type === "MENTOR" && (
            <Link href="/dashboard/mentors" className="text-xs text-primary hover:underline">
              Book mentor
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationCard({ item }: { item: NetworkingRecommendation }) {
  const priorityColor =
    item.priority === "high"
      ? "destructive"
      : item.priority === "medium"
        ? "warning"
        : "secondary";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={priorityColor} className="text-xs font-normal capitalize">
            {item.priority}
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal">
            {item.category}
          </Badge>
        </div>
        <p className="font-medium">{item.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        <ul className="mt-3 space-y-1 text-sm list-disc list-inside text-muted-foreground">
          {item.actionSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function OutreachCard({
  outreach,
  copied,
  onCopy,
}: {
  outreach: LinkedInOutreachSuggestion;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-base">{outreach.targetName}</CardTitle>
            <p className="text-sm text-muted-foreground">{outreach.targetTitle}</p>
          </div>
          <Badge variant="secondary" className="capitalize font-normal">
            {outreach.purpose.replace(/_/g, " ")}
          </Badge>
        </div>
        {outreach.subjectLine && (
          <p className="text-xs text-muted-foreground mt-2">
            Subject: <span className="text-foreground">{outreach.subjectLine}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="whitespace-pre-wrap text-sm bg-muted/50 rounded-lg p-3 font-sans">
          {outreach.message}
        </pre>
        <Button variant="outline" size="sm" onClick={onCopy}>
          {copied ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy message
            </>
          )}
        </Button>
        {outreach.tips.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-1">
            {outreach.tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

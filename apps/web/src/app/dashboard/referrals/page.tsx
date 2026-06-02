"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Handshake,
  Search,
  Plus,
  MessageSquare,
  Building2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  ReferralConnectionItem,
  ReferralListingItem,
  ReferralListingType,
  ReferralTrackingSummary,
} from "@placepro/shared";

type Tab = "browse" | "requests" | "offers" | "mine" | "connections";

export default function ReferralMarketplacePage() {
  const [tab, setTab] = useState<Tab>("browse");
  const [companyFilter, setCompanyFilter] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [listings, setListings] = useState<ReferralListingItem[]>([]);
  const [connections, setConnections] = useState<ReferralConnectionItem[]>([]);
  const [tracking, setTracking] = useState<ReferralTrackingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [postForm, setPostForm] = useState({
    type: "REQUEST" as ReferralListingType,
    companyName: "",
    companyId: "",
    targetRole: "",
    description: "",
    skills: "",
  });

  const loadCompanies = useCallback(() => {
    api<{ id: string; name: string }[]>("/api/referrals/companies").then((res) => {
      if (res.success && res.data) setCompanies(res.data);
    });
  }, []);

  const loadTracking = useCallback(() => {
    api<ReferralTrackingSummary>("/api/referrals/tracking").then((res) => {
      if (res.success && res.data) setTracking(res.data);
    });
  }, []);

  const loadListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab === "requests") params.set("type", "REQUEST");
    if (tab === "offers") params.set("type", "OFFER");
    if (tab === "mine") params.set("mine", "true");
    if (companyFilter) params.set("company", companyFilter);
    if (companyId) params.set("companyId", companyId);

    const res = await api<ReferralListingItem[]>(
      `/api/referrals/listings?${params.toString()}`
    );
    setLoading(false);
    if (res.success && res.data) setListings(res.data);
  }, [tab, companyFilter, companyId]);

  const loadConnections = useCallback(() => {
    api<ReferralConnectionItem[]>("/api/referrals/connections").then((res) => {
      if (res.success && res.data) setConnections(res.data);
    });
  }, []);

  useEffect(() => {
    loadCompanies();
    loadTracking();
  }, [loadCompanies, loadTracking]);

  useEffect(() => {
    if (tab === "connections") loadConnections();
    else loadListings();
  }, [tab, loadListings, loadConnections]);

  async function postListing() {
    const res = await api<ReferralListingItem>("/api/referrals/listings", {
      method: "POST",
      body: JSON.stringify({
        type: postForm.type,
        companyName: postForm.companyName,
        companyId: postForm.companyId || undefined,
        targetRole: postForm.targetRole,
        description: postForm.description,
        skills: postForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    if (res.success) {
      setShowPost(false);
      setTab("mine");
      loadTracking();
    }
  }

  async function connect(listingId: string) {
    const res = await api<ReferralConnectionItem>(
      `/api/referrals/listings/${listingId}/connect`,
      { method: "POST" }
    );
    if (res.success && res.data) {
      window.location.href = `/dashboard/referrals/messages/${res.data.id}`;
    }
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Handshake className="h-7 w-7 text-primary" />
              Referral Marketplace
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Request referrals, offer referrals, message peers, and track outcomes
            </p>
          </div>
          <Button onClick={() => setShowPost(!showPost)}>
            <Plus className="h-4 w-4 mr-2" />
            Post listing
          </Button>
        </div>

        {tracking && (
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "Requests posted", value: tracking.requestsPosted },
              { label: "Offers posted", value: tracking.offersPosted },
              { label: "Active chats", value: tracking.activeConnections },
              { label: "Completed", value: tracking.completedReferrals },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showPost && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New listing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="flex gap-2 sm:col-span-2">
                <Button
                  variant={postForm.type === "REQUEST" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPostForm({ ...postForm, type: "REQUEST" })}
                >
                  Request referral
                </Button>
                <Button
                  variant={postForm.type === "OFFER" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPostForm({ ...postForm, type: "OFFER" })}
                >
                  Offer referral
                </Button>
              </div>
              <select
                value={postForm.companyId}
                onChange={(e) => {
                  const c = companies.find((x) => x.id === e.target.value);
                  setPostForm({
                    ...postForm,
                    companyId: e.target.value,
                    companyName: c?.name ?? postForm.companyName,
                  });
                }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Custom company name below</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Company name"
                value={postForm.companyName}
                onChange={(e) => setPostForm({ ...postForm, companyName: e.target.value })}
              />
              <Input
                placeholder="Target role"
                value={postForm.targetRole}
                onChange={(e) => setPostForm({ ...postForm, targetRole: e.target.value })}
              />
              <Input
                placeholder="Skills (comma-separated)"
                value={postForm.skills}
                onChange={(e) => setPostForm({ ...postForm, skills: e.target.value })}
                className="sm:col-span-2"
              />
              <textarea
                placeholder="Describe what you need or what you can offer…"
                value={postForm.description}
                onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                className="sm:col-span-2 min-h-[90px] rounded-lg border border-border bg-background p-3 text-sm"
              />
              <Button onClick={postListing} className="sm:col-span-2">
                Publish
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["browse", "All open"],
              ["requests", "Requests"],
              ["offers", "Offers"],
              ["mine", "My listings"],
              ["connections", "Messages"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <Button
              key={id}
              size="sm"
              variant={tab === id ? "default" : "outline"}
              onClick={() => setTab(id)}
            >
              {id === "connections" && <MessageSquare className="h-3.5 w-3.5 mr-1" />}
              {label}
            </Button>
          ))}
        </div>

        {tab !== "connections" && (
          <Card>
            <CardContent className="pt-6 flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Filter by company name…"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                />
              </div>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">All companies</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button variant="secondary" onClick={loadListings} disabled={loading}>
                Apply filters
              </Button>
            </CardContent>
          </Card>
        )}

        {tab === "connections" ? (
          <div className="space-y-3">
            {connections.length === 0 && (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            )}
            {connections.map((c) => (
              <Card key={c.id}>
                <CardContent className="py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      {c.companyName} · {c.targetRole}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      With {c.otherUser.name} · {c.status}
                    </p>
                    {c.lastMessage && (
                      <p className="text-xs mt-2 line-clamp-1">{c.lastMessage}</p>
                    )}
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/referrals/messages/${c.id}`}>
                      Open <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {listings.map((l) => (
              <Card key={l.id}>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={l.type === "REQUEST" ? "default" : "secondary"}
                        >
                          {l.type === "REQUEST" ? "Request" : "Offer"}
                        </Badge>
                        <span className="font-semibold">{l.companyName}</span>
                        <span className="text-sm text-muted-foreground">
                          {l.targetRole}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {l.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {l.author.name}
                        {l.author.college ? ` · ${l.author.college}` : ""} ·{" "}
                        {l.connectionsCount} connections
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {l.skills.slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 rounded bg-muted"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {!l.isOwner && tab !== "mine" && (
                      <Button size="sm" onClick={() => connect(l.id)}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    )}
                    {l.isOwner && (
                      <Badge variant="secondary" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Your post
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

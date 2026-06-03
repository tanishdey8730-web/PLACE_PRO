"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Kanban,
  Plus,
  Trash2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Briefcase,
  Calendar,
  GripVertical,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  PlacementTrackerBoard,
  PlacementTrackerEntry,
  PlacementTrackerStage,
} from "@placepro/shared";
import { PLACEMENT_TRACKER_STAGES } from "@placepro/shared";

export default function PlacementTrackerPage() {
  const [board, setBoard] = useState<PlacementTrackerBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    role: "",
    location: "",
    jobType: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api<PlacementTrackerBoard>("/api/placement-tracker");
    setLoading(false);
    if (res.success && res.data) setBoard(res.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createApplication() {
    if (!form.companyName.trim() || !form.role.trim()) return;
    const res = await api<PlacementTrackerBoard>("/api/placement-tracker", {
      method: "POST",
      body: JSON.stringify({
        companyName: form.companyName.trim(),
        role: form.role.trim(),
        location: form.location.trim() || undefined,
        jobType: form.jobType.trim() || undefined,
        notes: form.notes.trim() || undefined,
      }),
    });
    if (res.success && res.data) {
      setBoard(res.data);
      setShowAdd(false);
      setForm({ companyName: "", role: "", location: "", jobType: "", notes: "" });
    }
  }

  async function moveToStage(id: string, stage: PlacementTrackerStage) {
    const res = await api<PlacementTrackerBoard>(`/api/placement-tracker/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    });
    if (res.success && res.data) setBoard(res.data);
  }

  async function remove(id: string) {
    const res = await api<PlacementTrackerBoard>(`/api/placement-tracker/${id}`, {
      method: "DELETE",
    });
    if (res.success && res.data) setBoard(res.data);
  }

  const stats = board?.stats;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader/>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total applications"
            value={stats.total}
            icon={<Briefcase className="h-4 w-4 text-primary" />}
          />
          <StatCard
            label="In progress"
            value={stats.inProgress}
            icon={<Kanban className="h-4 w-4 text-purple-500" />}
          />
          <StatCard
            label="Selected"
            value={stats.selected}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={<XCircle className="h-4 w-4 text-red-500" />}
          />
          <StatCard
            label="Success rate"
            value={`${stats.successRate}%`}
            icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
          />
        </div>
      )}

      {stats && stats.total > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Progress funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.funnel.map((step) => (
              <div key={step.stage} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{step.label}</span>
                  <span className="font-medium">
                    {step.count} ({step.percent}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      step.stage === "SELECTED"
                        ? "bg-emerald-500"
                        : step.stage === "REJECTED"
                          ? "bg-red-500"
                          : "bg-primary"
                    )}
                    style={{ width: `${Math.max(step.percent, step.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Drag cards between columns to update stage
        </p>
        <Button onClick={() => setShowAdd((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" />
          Add application
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New application</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Company name *"
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            />
            <Input
              placeholder="Role *"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            />
            <Input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              placeholder="Job type (Internship / Full-time)"
              value={form.jobType}
              onChange={(e) => setForm((f) => ({ ...f, jobType: e.target.value }))}
            />
            <Input
              className="sm:col-span-2"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <div className="flex gap-2 sm:col-span-2">
              <Button onClick={createApplication}>Save</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading board…</p>
      ) : board ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PLACEMENT_TRACKER_STAGES.map((col) => (
            <KanbanColumn
              key={col.id}
              stage={col}
              entries={board.columns[col.id]}
              draggingId={draggingId}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              onDrop={(entryId) => moveToStage(entryId, col.id)}
              onDelete={remove}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-muted p-2">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({
  stage,
  entries,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
  onDelete,
}: {
  stage: (typeof PLACEMENT_TRACKER_STAGES)[number];
  entries: PlacementTrackerEntry[];
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (entryId: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="flex w-72 shrink-0 flex-col rounded-xl border border-border/50 bg-muted/20"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(id);
        onDragEnd();
      }}
    >
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <Badge className={cn("font-normal", stage.color)}>{stage.label}</Badge>
        <span className="text-xs text-muted-foreground">{entries.length}</span>
      </div>
      <div className="flex min-h-[200px] flex-col gap-2 p-2">
        {entries.map((entry) => (
          <ApplicationCard
            key={entry.id}
            entry={entry}
            isDragging={draggingId === entry.id}
            onDragStart={() => onDragStart(entry.id)}
            onDragEnd={onDragEnd}
            onDelete={() => onDelete(entry.id)}
          />
        ))}
        {entries.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">Drop here</p>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({
  entry,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
}: {
  entry: PlacementTrackerEntry;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", entry.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-lg border border-border/60 bg-card p-3 shadow-sm active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start gap-1">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{entry.companyName}</p>
          <p className="truncate text-sm text-muted-foreground">{entry.role}</p>
          {entry.location && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{entry.location}</p>
          )}
          {entry.jobType && (
            <Badge variant="secondary" className="mt-2 text-xs font-normal">
              {entry.jobType}
            </Badge>
          )}
          {entry.nextEventAt && (
            <p className="mt-2 flex items-center gap-1 text-xs text-primary">
              <Calendar className="h-3 w-3" />
              {new Date(entry.nextEventAt).toLocaleDateString()}
            </p>
          )}
          {entry.salaryOffer && (
            <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {entry.salaryOffer}
            </p>
          )}
          {entry.notes && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{entry.notes}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

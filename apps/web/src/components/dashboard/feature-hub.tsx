"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardFeature, FeatureCategory } from "@/lib/dashboard-features";
import { DASHBOARD_FEATURES, FEATURE_CATEGORIES } from "@/lib/dashboard-features";

interface FeatureHubProps {
  title?: string;
  description?: string;
  filterCategory?: FeatureCategory | "all";
  limit?: number;
  showCategories?: boolean;
}

export function FeatureHub({
  title = "All Features",
  description = "Open any tool on its own dedicated page",
  filterCategory = "all",
  limit,
  showCategories = true,
}: FeatureHubProps) {
  const items =
    filterCategory === "all"
      ? DASHBOARD_FEATURES
      : DASHBOARD_FEATURES.filter((f) => f.category === filterCategory);

  const displayed = limit ? items.slice(0, limit) : items;

  if (showCategories && filterCategory === "all" && !limit) {
    return (
      <div className="space-y-10">
        {FEATURE_CATEGORIES.map((cat) => {
          const catItems = DASHBOARD_FEATURES.filter((f) => f.category === cat);
          if (!catItems.length) return null;
          return (
            <section key={cat}>
              <h2 className="text-lg font-semibold mb-4">{cat}</h2>
              <FeatureGrid features={catItems} />
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div>
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <FeatureGrid features={displayed} />
    </div>
  );
}

function FeatureGrid({ features }: { features: DashboardFeature[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <Link key={f.href} href={f.href} className="group block h-full">
          <Card className="h-full hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
            <CardContent className="p-4 flex gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                  f.color
                )}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {f.label}
                  </p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

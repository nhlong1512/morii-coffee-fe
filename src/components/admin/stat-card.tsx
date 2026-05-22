"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: number | null;
  comparisonSupported?: boolean;
  icon: LucideIcon;
}

export function StatCard({
  title,
  value,
  change,
  comparisonSupported = true,
  icon: Icon,
}: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {comparisonSupported && change !== null ? (
          <div className="mt-3 flex items-center gap-1 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span
              className={cn(
                "font-medium",
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        ) : (
          <div className="mt-3 text-sm text-muted-foreground">Current snapshot</div>
        )}
      </CardContent>
    </Card>
  );
}

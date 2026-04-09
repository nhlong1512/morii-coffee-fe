"use client";

import {
  Gift,
  Trophy,
  Coffee,
  Star,
  Percent,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// TODO: Wire to real loyalty API when available
const userLoyalty = { points: 0, tier: "Bronze" as const };

const tierColors: Record<string, string> = {
  Bronze: "from-amber-700 to-amber-600 text-white",
  Silver: "from-gray-400 to-gray-300 text-gray-900",
  Gold: "from-yellow-500 to-yellow-400 text-yellow-950",
  Platinum: "from-indigo-500 to-indigo-400 text-white",
};

const tierBadgeBg: Record<string, string> = {
  Bronze: "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400",
  Silver: "bg-gray-100 text-gray-800 dark:bg-gray-400/10 dark:text-gray-400",
  Gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-400",
  Platinum: "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-400",
};

const rewards = [
  {
    id: "reward-001",
    name: "Free Coffee",
    description: "Redeem for any regular-size coffee of your choice.",
    pointsCost: 200,
    icon: Coffee,
  },
  {
    id: "reward-002",
    name: "15% Off Order",
    description: "Get 15% off your entire next order.",
    pointsCost: 350,
    icon: Percent,
  },
  {
    id: "reward-003",
    name: "Free Pastry",
    description: "Choose any pastry from our menu.",
    pointsCost: 150,
    icon: Gift,
  },
  {
    id: "reward-004",
    name: "Morii Merchandise",
    description: "Redeem for a Morii-branded item of your choice.",
    pointsCost: 500,
    icon: ShoppingBag,
  },
];

const pointsHistory = [
  { id: 1, description: "Order MRC-20250301-001", points: 135, type: "earned" as const, date: "2025-03-01" },
  { id: 2, description: "Order MRC-20250215-002", points: 420, type: "earned" as const, date: "2025-02-15" },
  { id: 3, description: "Redeemed: Free Coffee", points: -200, type: "redeemed" as const, date: "2025-02-20" },
  { id: 4, description: "Order MRC-20250310-003", points: 165, type: "earned" as const, date: "2025-03-10" },
  { id: 5, description: "Order MRC-20250312-004", points: 145, type: "earned" as const, date: "2025-03-12" },
  { id: 6, description: "Redeemed: 15% Off Order", points: -350, type: "redeemed" as const, date: "2025-03-05" },
  { id: 7, description: "Welcome Bonus", points: 100, type: "earned" as const, date: "2025-01-10" },
];

export default function LoyaltyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Points Balance & Tier */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Points Balance */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points Balance</p>
                <p className="text-4xl font-bold text-card-foreground">
                  {userLoyalty.points.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Earn 10 points for every $1 spent.
            </p>
          </div>

          {/* Tier */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br",
                  tierColors[userLoyalty.tier]
                )}
              >
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Tier</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-card-foreground">
                    {userLoyalty.tier}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      tierBadgeBg[userLoyalty.tier]
                    )}
                  >
                    Member
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Earn 500 more points to reach Gold tier.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-foreground">How It Works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Coffee className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-card-foreground">
                Earn Points
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Earn 10 points for every $1 you spend on coffee, pastries, and
                merchandise.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-card-foreground">
                Unlock Tiers
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Progress through Bronze, Silver, Gold, and Platinum tiers for
                exclusive benefits and perks.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-card-foreground">
                Redeem Rewards
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Use your points to redeem free drinks, discounts, and exclusive
                Morii merchandise.
              </p>
            </div>
          </div>
        </div>

        {/* Available Rewards */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-foreground">
            Available Rewards
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rewards.map((reward) => {
              const Icon = reward.icon;
              const canRedeem = userLoyalty.points >= reward.pointsCost;
              return (
                <div
                  key={reward.id}
                  className="flex flex-col rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                    <Icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-card-foreground">
                    {reward.name}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">
                    {reward.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {reward.pointsCost} pts
                    </span>
                    <button
                      disabled={!canRedeem}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        canRedeem
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Points History */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-foreground">Points History</h2>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </th>
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                    Date
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pointsHistory
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-accent/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {entry.type === "earned" ? (
                            <ArrowUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm text-card-foreground">
                            {entry.description}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 text-sm text-muted-foreground sm:table-cell">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            entry.type === "earned"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {entry.type === "earned" ? "+" : ""}
                          {entry.points}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

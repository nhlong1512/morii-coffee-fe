"use client";

import { useState } from "react";
import { Star, Flag, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviews } from "@/data/reviews";
import { useTranslations } from "next-intl";

interface ReviewListProps {
  productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
  const t = useTranslations("reviews");
  const productReviews = reviews.filter((r) => r.productId === productId);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const toggleReport = (reviewId: string) => {
    setReportedIds((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  if (productReviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {productReviews.map((review) => {
        const isReported = reportedIds.has(review.id) || review.reported;

        return (
          <div
            key={review.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-card-foreground">
                      {review.userName}
                    </span>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        <BadgeCheck className="h-3 w-3" />
                        {t("verifiedPurchase")}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Report button */}
              <button
                onClick={() => toggleReport(review.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                  isReported
                    ? "bg-destructive/10 text-destructive"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Flag className="h-3.5 w-3.5" />
                {isReported ? t("reported") : t("report")}
              </button>
            </div>

            {/* Stars */}
            <div className="mt-3 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40"
                  )}
                />
              ))}
            </div>

            {/* Comment */}
            <p className="mt-3 text-sm leading-relaxed text-card-foreground/90">
              {review.comment}
            </p>
          </div>
        );
      })}
    </div>
  );
}

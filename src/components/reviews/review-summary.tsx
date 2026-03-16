"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviews } from "@/data/reviews";
import { useTranslations } from "next-intl";

interface ReviewSummaryProps {
  productId: string;
}

export function ReviewSummary({ productId }: ReviewSummaryProps) {
  const t = useTranslations("reviews");
  const productReviews = reviews.filter((r) => r.productId === productId);

  if (productReviews.length === 0) {
    return null;
  }

  const totalReviews = productReviews.length;
  const averageRating =
    productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: productReviews.filter((r) => r.rating === star).length,
    percentage:
      (productReviews.filter((r) => r.rating === star).length / totalReviews) *
      100,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground">
        {t("reviews")}
      </h3>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Average rating */}
        <div className="flex flex-col items-center gap-1 sm:min-w-[120px]">
          <span className="text-4xl font-bold text-card-foreground">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/40"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {totalReviews} {t("reviews").toLowerCase()}
          </span>
        </div>

        {/* Star breakdown */}
        <div className="flex-1 space-y-2">
          {starCounts.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="w-8 text-right text-sm text-muted-foreground">
                {star}
              </span>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-sm text-muted-foreground">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

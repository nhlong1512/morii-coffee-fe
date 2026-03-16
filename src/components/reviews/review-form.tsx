"use client";

import { useState } from "react";
import { Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId: _productId }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>(
    {}
  );

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border bg-muted/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">{t("signInToReview")}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-green-500/5 p-6 text-center">
        <CheckCircle className="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
        <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
          {t("reviewSubmitted")}
        </p>
      </div>
    );
  }

  const maxChars = 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { rating?: string; comment?: string } = {};

    if (rating === 0) {
      newErrors.rating = t("ratingRequired");
    }
    if (comment.trim().length < 10) {
      newErrors.comment = t("minChars");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground">
        {t("writeReview")}
      </h3>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Star rating selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            {t("rating")}
          </label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const starValue = i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoveredRating(starValue)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      starValue <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    )}
                  />
                </button>
              );
            })}
          </div>
          {errors.rating && (
            <p className="mt-1 text-xs text-destructive">{errors.rating}</p>
          )}
        </div>

        {/* Comment textarea */}
        <div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, maxChars))}
            placeholder={t("writeReview") + "..."}
            rows={4}
            className="resize-none"
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.comment ? (
              <p className="text-xs text-destructive">{errors.comment}</p>
            ) : (
              <span />
            )}
            <span
              className={cn(
                "text-xs",
                comment.length >= maxChars
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {comment.length}/{maxChars} {t("characters")}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("submitReview")}
        </button>
      </form>
    </div>
  );
}

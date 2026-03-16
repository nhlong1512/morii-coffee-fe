"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { storeTestimonials } from "@/data/reviews";

interface StoreRatingProps {
  storeId: string;
}

export function StoreRating({ storeId }: StoreRatingProps) {
  const testimonials = storeTestimonials.filter((t) => t.storeId === storeId);

  if (testimonials.length === 0) {
    return null;
  }

  const averageRating =
    testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;

  const displayTestimonials = testimonials.slice(0, 3);

  return (
    <div className="mt-4 border-t border-border pt-4">
      {/* Overall rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < Math.round(averageRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-card-foreground">
          {averageRating.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">
          ({testimonials.length})
        </span>
      </div>

      {/* Testimonials */}
      <div className="mt-3 space-y-2.5">
        {displayTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-card-foreground">
                {testimonial.userName}
              </span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < testimonial.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {testimonial.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

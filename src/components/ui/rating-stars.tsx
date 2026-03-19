import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  className?: string;
}

export function RatingStars({ rating, className }: RatingStarsProps) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn("fill-amber-400 text-amber-400", className)}
        />
      ))}
      {hasHalf && (
        <StarHalf className={cn("fill-amber-400 text-amber-400", className)} />
      )}
      {Array.from({ length: 5 - full - (hasHalf ? 1 : 0) }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn("text-muted-foreground/40", className)}
        />
      ))}
    </div>
  );
}

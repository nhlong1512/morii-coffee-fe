import Image from "next/image";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  /**
   * Size of the loading spinner
   * - sm: Small (16px icon / 24px logo)
   * - md: Medium (24px icon / 40px logo) - default
   * - lg: Large (32px icon / 56px logo)
   */
  size?: "sm" | "md" | "lg";
  /**
   * Visual variant of the loader
   * - logo: Animated Morii Coffee logo (brand identity)
   * - spinner: Circular spinner icon (generic loading)
   * - dots: Three animated dots (minimal loading)
   */
  variant?: "logo" | "spinner" | "dots";
  /**
   * Additional CSS classes
   */
  className?: string;
}

const sizeClasses = {
  logo: {
    sm: "h-6 w-auto",
    md: "h-10 w-auto",
    lg: "h-14 w-auto",
  },
  spinner: {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  },
  dots: {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
  },
};

const dotSizeClasses = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

export function LoadingSpinner({
  size = "md",
  variant = "spinner",
  className,
}: LoadingSpinnerProps) {
  if (variant === "logo") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Image
          src="/images/logo.png"
          alt="Loading..."
          width={size === "sm" ? 60 : size === "md" ? 120 : 168}
          height={size === "sm" ? 20 : size === "md" ? 40 : 56}
          className={cn("animate-pulse", sizeClasses.logo[size])}
        />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center", sizeClasses.dots[size], className)}>
        <div
          className={cn(
            "animate-bounce rounded-full bg-primary",
            dotSizeClasses[size]
          )}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn(
            "animate-bounce rounded-full bg-primary",
            dotSizeClasses[size]
          )}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={cn(
            "animate-bounce rounded-full bg-primary",
            dotSizeClasses[size]
          )}
          style={{ animationDelay: "300ms" }}
        />
      </div>
    );
  }

  // Default: spinner variant
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses.spinner[size])} />
    </div>
  );
}

LoadingSpinner.displayName = "LoadingSpinner";

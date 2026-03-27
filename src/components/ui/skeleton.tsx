import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the skeleton
   * - text: Single line of text (default)
   * - circular: Avatar or profile picture
   * - rectangular: Image or media
   * - card: Content card with title and body
   * - table: Table row with multiple columns
   */
  variant?: "text" | "circular" | "rectangular" | "card" | "table";
  /**
   * Width of the skeleton (CSS value: px, %, rem, etc.)
   */
  width?: string | number;
  /**
   * Height of the skeleton (CSS value: px, %, rem, etc.)
   */
  height?: string | number;
  /**
   * Number of skeleton elements to render (useful for text lines or table rows)
   */
  count?: number;
}

function Skeleton({
  variant = "text",
  width,
  height,
  count = 1,
  className,
  style,
  ...props
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "rectangular":
        return "rounded-md";
      case "card":
        return "rounded-lg p-4 space-y-3";
      case "table":
        return "rounded-md h-12";
      case "text":
      default:
        return "rounded-md h-4";
    }
  };

  const getSizeStyle = () => {
    const sizeStyle: React.CSSProperties = {};
    if (width !== undefined) {
      sizeStyle.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      sizeStyle.height = typeof height === "number" ? `${height}px` : height;
    }
    return sizeStyle;
  };

  // Render card variant with structured layout
  if (variant === "card") {
    return (
      <div
        className={cn("animate-pulse rounded-lg bg-primary/10 p-4 space-y-3", className)}
        style={{ ...getSizeStyle(), ...style }}
        {...props}
      >
        <div className="h-4 w-3/4 rounded-md bg-primary/20" />
        <div className="h-3 w-full rounded-md bg-primary/15" />
        <div className="h-3 w-5/6 rounded-md bg-primary/15" />
      </div>
    );
  }

  // Render multiple skeleton elements if count > 1
  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn("animate-pulse bg-primary/10", getVariantClasses(), className)}
            style={{ ...getSizeStyle(), ...style }}
            {...props}
          />
        ))}
      </div>
    );
  }

  // Single skeleton element
  return (
    <div
      className={cn("animate-pulse bg-primary/10", getVariantClasses(), className)}
      style={{ ...getSizeStyle(), ...style }}
      {...props}
    />
  );
}

Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };

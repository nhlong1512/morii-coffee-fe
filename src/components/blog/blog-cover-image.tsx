"use client";

import * as React from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const placeholderGradients = [
  "from-amber-700/75 to-amber-500/55",
  "from-stone-700/75 to-stone-500/55",
  "from-sky-700/75 to-sky-500/55",
  "from-[#0d4a34]/90 via-[#146d4d]/80 to-[#1f8a62]/70",
];

interface BlogCoverImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  placeholderIndex?: number;
}

export function BlogCoverImage({
  src,
  alt,
  className,
  width = 1200,
  height = 720,
  sizes,
  priority = false,
  placeholderIndex = 0,
}: BlogCoverImageProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const normalizedSrc = src?.trim() ?? "";
  const gradientClass =
    placeholderGradients[placeholderIndex % placeholderGradients.length] ??
    placeholderGradients[0];

  if (!normalizedSrc || hasError) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-linear-to-br",
          gradientClass,
          className
        )}
      >
        <BookOpen className="h-12 w-12 text-white/45" />
      </div>
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      unoptimized
      className={cn("h-full w-full object-cover", className)}
      onError={() => setHasError(true)}
    />
  );
}

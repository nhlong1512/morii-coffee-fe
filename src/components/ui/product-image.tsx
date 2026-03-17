"use client";

import { useState } from "react";
import Image from "next/image";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const CLOUDFRONT_HOST = "ddlda2rzhrys8.cloudfront.net";

function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname === CLOUDFRONT_HOST;
  } catch {
    return false;
  }
}

const placeholderColors: Record<string, string> = {
  espresso: "from-amber-900/80 to-amber-800/60",
  "cold-brew": "from-sky-700/80 to-sky-600/60",
  latte: "from-orange-400/80 to-orange-300/60",
  pastry: "from-pink-400/80 to-pink-300/60",
  merchandise: "from-violet-500/80 to-violet-400/60",
};

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  category?: string;
  className?: string;
}

export function ProductImage({ src, alt, category, className }: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showImage = isValidImageUrl(src) && !errored;
  const gradientClass = placeholderColors[category ?? ""] ?? "from-[#146d4d]/80 to-[#146d4d]/50";

  if (!showImage) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br",
          gradientClass,
          className
        )}
      >
        <Coffee className="h-12 w-12 text-white/40" />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Skeleton shown until image loads */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      <Image
        src={src!}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          "object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

  const gradientClass =
    placeholderColors[category ?? ""] ?? "from-[#146d4d]/80 to-[#146d4d]/50";

  if (!src || errored) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-linear-to-br",
          gradientClass,
          className
        )}
      >
        <Coffee className="h-12 w-12 text-white/40" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={() => setErrored(true)}
      className={cn("object-cover", className)}
    />
  );
}


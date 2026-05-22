"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useWishlistStore } from "@/stores/wishlist-store";

export function WishlistIconButton() {
  const totalItems = useWishlistStore((s) => s.totalItems());
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/wishlist"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background transition-colors hover:bg-accent"
      aria-label="Wishlist"
    >
      <Heart className="h-4 w-4" />
      {mounted && totalItems > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}

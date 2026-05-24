"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useWishlistStore } from "@/stores/wishlist-store";
import { IconButton } from "@/components/ui/icon-button";

export function WishlistIconButton() {
  const totalItems = useWishlistStore((s) => s.totalItems());
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <Link href="/wishlist">
      <IconButton
        badge={mounted ? totalItems : undefined}
        badgeVariant="destructive"
        aria-label="Wishlist"
      >
        <Heart className="h-4 w-4" />
      </IconButton>
    </Link>
  );
}

"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { IconButton } from "@/components/ui/icon-button";

export function CartButton() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <Link href="/cart">
      <IconButton
        badge={mounted ? totalItems : undefined}
        badgeVariant="primary"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="h-4 w-4" />
      </IconButton>
    </Link>
  );
}

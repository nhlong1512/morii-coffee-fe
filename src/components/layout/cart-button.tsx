"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";

export function CartButton() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/cart"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background transition-colors hover:bg-accent"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="h-4 w-4" />
      {mounted && totalItems > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}

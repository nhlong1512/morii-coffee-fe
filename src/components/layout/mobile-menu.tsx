"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", labelKey: "home" },
  { href: "/products", labelKey: "products" },
  { href: "/blog", labelKey: "blog" },
  { href: "/stores", labelKey: "storeLocator" },
] as const;

export function MobileMenu() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background transition-colors hover:bg-accent"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-background p-4 shadow-lg">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-border pt-4">
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="block rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

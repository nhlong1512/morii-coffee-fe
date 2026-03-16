"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { CartButton } from "./cart-button";
import { NotificationBell } from "./notification-bell";
import { MobileMenu } from "./mobile-menu";
import { useAuthStore } from "@/stores/auth-store";

const NAV_ITEMS = [
  { href: "/", labelKey: "home" },
  { href: "/products", labelKey: "products" },
  { href: "/blog", labelKey: "blog" },
  { href: "/stores", labelKey: "storeLocator" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <SearchBar />
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationBell />
          <CartButton />

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/profile"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {user?.name}
              </Link>
              <button
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:block"
            >
              {t("signIn")}
            </Link>
          )}

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

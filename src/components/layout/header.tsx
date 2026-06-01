"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { LogOut, User, Package, Heart } from "lucide-react";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { CartButton } from "./cart-button";
import { WishlistIconButton } from "./wishlist-icon-button";
import { MobileMenu } from "./mobile-menu";
import { selectHasValidSession, useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { href: "/", labelKey: "home" },
  { href: "/products", labelKey: "products" },
  { href: "/blog", labelKey: "blog" },
  { href: "/stores", labelKey: "storeLocator" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const isAuthenticated = useAuthStore(selectHasValidSession);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const displayName = user
    ? user.fullName || user.userName
    : "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden md:flex">
            <SearchBar />
          </div>
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <div className="hidden md:block">
            <WishlistIconButton />
          </div>
          <CartButton />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden lg:flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent transition-colors focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-[9999] bg-white dark:bg-zinc-900 border-border shadow-xl">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    {t("profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                    <Package className="h-4 w-4" />
                    {t("orders")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="h-4 w-4" />
                    {t("wishlist")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/sign-in"
              className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 lg:block"
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

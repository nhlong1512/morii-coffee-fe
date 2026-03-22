"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Gift,
  Images,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UserRole } from "@/enums";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuthStore } from "@/stores/auth-store";
import { useAdminStore } from "@/stores/admin-store";

const navItems = [
  { href: "/admin/reports", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/banners", label: "Banners", icon: Images },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/promotions", label: "Promotions", icon: Gift },
];

function SidebarNav({
  collapsed,
  onNavClick,
}: Readonly<{
  collapsed: boolean;
  onNavClick?: () => void;
}>) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <span key={href} className="flex items-center gap-1.5">
            {index > 0 && <span>/</span>}
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

function getDisplayName(user: { fullName: string | null; userName: string }) {
  return user.fullName || user.userName;
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useAdminStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.roles?.includes(UserRole.Admin) ?? false;

  // Auth guard redirect
  useEffect(() => {
    if (mounted && pathname !== "/admin/login" && (!isAuthenticated || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [mounted, pathname, isAuthenticated, isAdmin, router]);

  // Skip auth guard for the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Wait for client hydration
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Image src="/images/logo.png" alt="Morii Coffee" width={120} height={40} className="h-10 w-auto animate-pulse" />
      </div>
    );
  }

  // Auth guard — show loading while redirect happens
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Image src="/images/logo.png" alt="Morii Coffee" width={120} height={40} className="h-10 w-auto animate-pulse" />
      </div>
    );
  }

  // user is guaranteed non-null after the auth guard above
  const authenticatedUser = user!;
  const displayName = getDisplayName(authenticatedUser);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <Image src="/images/logo.png" alt="Morii Coffee" width={sidebarOpen ? 120 : 32} height={40} className={cn("shrink-0", sidebarOpen ? "h-10 w-auto" : "h-8 w-auto")} />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav collapsed={!sidebarOpen} />
        </div>
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-16 items-center border-b border-border px-4">
                  <Image src="/images/logo.png" alt="Morii Coffee" width={120} height={40} className="h-10 w-auto" />
                </div>
                <div className="py-4">
                  <SidebarNav
                    collapsed={false}
                    onNavClick={() => setMobileOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={authenticatedUser.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium truncate max-w-30">
                    {displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

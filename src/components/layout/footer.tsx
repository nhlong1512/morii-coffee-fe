import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 space-y-3 sm:space-y-4">
            <Image
              src="/images/logo.png"
              alt="Morii Coffee"
              width={120}
              height={40}
              className="h-8 w-24 sm:h-[40px] sm:w-[120px]"
            />
            <p className="max-w-md text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t("quickLinks")}</h3>
            <nav className="grid gap-2">
              <Link
                href="/products"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("products")}
              </Link>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("blog")}
              </Link>
              <Link
                href="/stores"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("storeLocator")}
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t("support")}</h3>
            <nav className="grid gap-2">
              <Link
                href="/about"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("about")}
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("contact")}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("terms")}
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("privacy")}
              </Link>
            </nav>
          </div>

          {/* Social */}
          <div className="col-span-2 space-y-3 lg:col-span-1">
            <h3 className="font-semibold">{t("followUs")}</h3>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
            <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-1">
              <p>{t("addressLine1")}</p>
              <p>{t("addressLine2")}</p>
              <p>{t("email")}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground sm:mt-8 sm:pt-8">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}

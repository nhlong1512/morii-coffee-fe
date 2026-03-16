"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function switchLocale() {
    const next = locale === "en" ? "vi" : "en";
    document.cookie = `locale=${next};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <button
      onClick={switchLocale}
      className="flex h-9 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent"
      aria-label="Switch language"
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase">{locale}</span>
    </button>
  );
}

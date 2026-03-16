import React from "react";
import Link from "next/link";
import { Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function LoyaltyTeaser() {
  const t = useTranslations("home");

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-800 px-8 py-14 text-white shadow-xl md:px-16">
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute right-1/4 top-1/3 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                <Gift className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {t("loyaltyTitle")}
              </h2>
              <p className="max-w-lg text-lg text-white/85">
                {t("loyaltyDescription")}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="shrink-0 rounded-full bg-white px-8 text-base font-semibold text-amber-900 shadow-lg hover:bg-white/90"
            >
              <Link href="/loyalty">Join Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

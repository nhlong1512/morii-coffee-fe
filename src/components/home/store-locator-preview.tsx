import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { stores } from "@/data/stores";
import { Button } from "@/components/ui/button";

export function StoreLocatorPreview() {
  const t = useTranslations("home");
  const displayedStores = stores.slice(0, 3);

  return (
    <section className="py-16 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("storeLocator")}
          </h2>
          <Button asChild variant="ghost" className="gap-1 text-muted-foreground">
            <Link href="/stores">
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Store Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedStores.map((store) => (
            <div
              key={store.id}
              className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow transition-all duration-300 hover:shadow-lg"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{store.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{store.city}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{store.phone}</span>
                </div>
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{store.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

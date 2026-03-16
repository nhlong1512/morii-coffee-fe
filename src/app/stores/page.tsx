"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import { stores } from "@/data/stores";
import { StoreRating } from "@/components/reviews/store-rating";

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Our Stores</h1>
          <p className="mt-2 text-muted-foreground">
            Find a Morii Coffee location near you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Store List */}
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-card-foreground">
                      {store.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {store.address}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {store.city}
                    </p>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{store.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{store.hours}</span>
                      </div>
                    </div>

                    <StoreRating storeId={store.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="sticky top-8 h-fit">
            <div className="flex h-[500px] items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-accent/10 to-muted border border-border">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  Map will be displayed here
                </p>
                <p className="mt-1 text-sm text-muted-foreground/60">
                  Google Maps / Mapbox integration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

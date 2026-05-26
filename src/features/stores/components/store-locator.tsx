"use client";

import * as React from "react";
import { MapPin, Navigation, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import { StoreLocatorMap } from "./store-locator-map";
import { StoreStatusBadge } from "./store-status-badge";
import { usePublicStores, useStoreLocatorState } from "../hooks";
import { formatDistanceKm, getStoreAvailability, sortStoresForDisplay } from "../utils";

export function StoreLocator() {
  const t = useTranslations("stores");
  const [radius] = React.useState(5);
  const [query, setQuery] = React.useState<{
    latitude?: number;
    longitude?: number;
    radius?: number;
  }>({});

  const storesResult = usePublicStores({
    takeAll: true,
    latitude: query.latitude,
    longitude: query.longitude,
    radius: query.radius,
  });
  const locatorState = useStoreLocatorState(storesResult.data);

  const filteredStores = React.useMemo(() => {
    const normalizedSearch = locatorState.search.trim().toLowerCase();

    return sortStoresForDisplay(
      storesResult.data.filter((store) => {
        const matchesCity =
          locatorState.selectedCity === "all" ||
          store.city.toLowerCase() === locatorState.selectedCity.toLowerCase();
        const matchesSearch =
          normalizedSearch.length === 0 ||
          `${store.name} ${store.address} ${store.city}`
            .toLowerCase()
            .includes(normalizedSearch);
        return matchesCity && matchesSearch;
      })
    );
  }, [locatorState.search, locatorState.selectedCity, storesResult.data]);

  React.useEffect(() => {
    if (!filteredStores.length) {
      locatorState.setSelectedStoreId(null);
      return;
    }

    if (
      !locatorState.selectedStoreId ||
      !filteredStores.some((store) => store.id === locatorState.selectedStoreId)
    ) {
      locatorState.setSelectedStoreId(filteredStores[0].id);
    }
  }, [filteredStores, locatorState]);

  React.useEffect(() => {
    if (
      locatorState.isNearMeActive &&
      locatorState.userLatitude !== null &&
      locatorState.userLongitude !== null
    ) {
      setQuery({
        latitude: locatorState.userLatitude,
        longitude: locatorState.userLongitude,
        radius,
      });
      return;
    }

    setQuery({});
  }, [
    locatorState.isNearMeActive,
    locatorState.userLatitude,
    locatorState.userLongitude,
    radius,
  ]);

  if (storesResult.loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
        <Skeleton className="min-h-[420px] rounded-xl" />
      </div>
    );
  }

  if (storesResult.error) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={storesResult.error} inline={false} />
        <Button onClick={storesResult.refetch}>{t("retry")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("pageTitle")}</h1>
              <p className="mt-2 text-muted-foreground">{t("pageSubtitle")}</p>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("storeCount", { count: filteredStores.length })}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_auto_auto]">
            <Input
              value={locatorState.search}
              onChange={(event) => locatorState.setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
            />
            <Select
              value={locatorState.selectedCity}
              onValueChange={locatorState.setSelectedCity}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("cityFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCities")}</SelectItem>
                {locatorState.availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={locatorState.requestNearMe}
              className="w-full"
            >
              <Navigation className="h-4 w-4" />
              {t("nearMe")}
            </Button>
            {locatorState.isNearMeActive ? (
              <Button
                variant="ghost"
                onClick={locatorState.clearNearMe}
                className="w-full"
              >
                {t("clearNearMe")}
              </Button>
            ) : (
              <div className="hidden lg:block" />
            )}
          </div>

          {locatorState.geolocationError && (
            <ErrorMessage message={locatorState.geolocationError} />
          )}
        </div>

        {filteredStores.length === 0 ? (
          <EmptyState
            icon={<MapPin className="h-10 w-10" />}
            title={t("noResultsTitle")}
            description={t("noResultsDescription")}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              {filteredStores.map((store) => {
                const availability = getStoreAvailability(store);
                const isSelected = store.id === locatorState.selectedStoreId;
                const distance = formatDistanceKm(store.distanceKm);

                return (
                  <Card
                    key={store.id}
                    className={isSelected ? "border-primary shadow-md" : undefined}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>{store.name}</CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">{store.city}</p>
                        </div>
                        <StoreStatusBadge availability={availability} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{store.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{store.phone}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {availability.isOpenNow && availability.closesAt
                          ? t("closesAt", { time: availability.closesAt })
                          : availability.isClosedToday
                            ? t("closedToday")
                            : availability.opensAt
                              ? t("opensAt", { time: availability.opensAt })
                              : t("closedNow")}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {availability.todayHoursLabel}
                        </p>
                        {distance && (
                          <p className="shrink-0 text-xs font-medium text-muted-foreground">
                            {t("distance", { distance })}
                          </p>
                        )}
                      </div>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className="w-full"
                        onClick={() => locatorState.setSelectedStoreId(store.id)}
                      >
                        {isSelected ? t("selected") : t("viewOnMap")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="h-fit overflow-hidden rounded-2xl lg:sticky lg:top-24">
              <StoreLocatorMap
                stores={filteredStores}
                selectedStoreId={locatorState.selectedStoreId}
                onSelectStore={locatorState.setSelectedStoreId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

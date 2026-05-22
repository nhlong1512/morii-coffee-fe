"use client";

import * as React from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import type { StoreLocation } from "../types";

interface StoreLocatorMapProps {
  stores: StoreLocation[];
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
}

interface GoogleMapInstance {
  fitBounds: (bounds: GoogleLatLngBoundsInstance, padding?: number) => void;
}

interface GoogleMarkerInstance {
  addListener: (eventName: string, handler: () => void) => void;
  getPosition: () => unknown;
  setMap: (map: GoogleMapInstance | null) => void;
}

interface GoogleInfoWindowInstance {
  setContent: (content: string) => void;
  open: (options: { map: GoogleMapInstance; anchor: GoogleMarkerInstance }) => void;
}

interface GoogleLatLngBoundsInstance {
  extend: (position: unknown) => void;
  isEmpty: () => boolean;
}

interface GoogleMapsNamespace {
  Animation: {
    DROP: unknown;
  };
  InfoWindow: new () => GoogleInfoWindowInstance;
  LatLngBounds: new () => GoogleLatLngBoundsInstance;
  Map: new (
    container: HTMLDivElement,
    options: {
      center: { lat: number; lng: number };
      zoom: number;
      mapTypeControl: boolean;
      streetViewControl: boolean;
      fullscreenControl: boolean;
    }
  ) => GoogleMapInstance;
  Marker: new (options: {
    map: GoogleMapInstance;
    position: { lat: number; lng: number };
    title: string;
    animation?: unknown;
  }) => GoogleMarkerInstance;
}

type GoogleWindow = Window &
  typeof globalThis & {
    google?: {
      maps: GoogleMapsNamespace;
    };
  };

function getGoogleMaps(): GoogleMapsNamespace | null {
  return (window as GoogleWindow).google?.maps ?? null;
}

export function StoreLocatorMap({
  stores,
  selectedStoreId,
  onSelectStore,
}: StoreLocatorMapProps) {
  const t = useTranslations("stores");
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<GoogleMapInstance | null>(null);
  const markersRef = React.useRef<GoogleMarkerInstance[]>([]);
  const infoWindowRef = React.useRef<GoogleInfoWindowInstance | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

      if (!apiKey) {
        setError("missing-key");
        return;
      }

      if (!mapContainerRef.current) {
        return;
      }

      try {
        setOptions({
          key: apiKey,
          v: "weekly",
        });

        await importLibrary("maps");

        const maps = getGoogleMaps();

        if (cancelled || !mapContainerRef.current || !maps) {
          return;
        }

        mapRef.current = new maps.Map(mapContainerRef.current, {
          center: { lat: stores[0]?.latitude ?? 10.7769, lng: stores[0]?.longitude ?? 106.7009 },
          zoom: stores.length > 1 ? 11 : 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        infoWindowRef.current = new maps.InfoWindow();
      } catch {
        if (!cancelled) {
          setError("load-failed");
        }
      }
    }

    setupMap();

    return () => {
      cancelled = true;
    };
  }, [stores]);

  React.useEffect(() => {
    const maps = getGoogleMaps();

    if (!mapRef.current || !maps) {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new maps.LatLngBounds();
    const mapInstance = mapRef.current;

    if (!mapInstance) {
      return;
    }

    stores.forEach((store) => {
      const marker = new maps.Marker({
        map: mapInstance,
        position: { lat: store.latitude, lng: store.longitude },
        title: store.name,
        animation:
          selectedStoreId === store.id ? maps.Animation.DROP : undefined,
      });

      marker.addListener("click", () => {
        onSelectStore(store.id);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(
            `<div style="min-width: 180px;"><strong>${store.name}</strong><br />${store.address}<br />${store.phone}</div>`
          );
          infoWindowRef.current.open({
            map: mapInstance,
            anchor: marker,
          });
        }
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, 48);
    }
  }, [stores, selectedStoreId, onSelectStore]);

  if (error) {
    return (
      <div className="h-full min-h-[360px]">
        <EmptyState
          icon={<MapPin className="h-10 w-10" />}
          title={t("mapUnavailable")}
          description={t("mapUnavailableHint")}
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-full min-h-[360px] rounded-xl border border-border bg-muted/20"
    />
  );
}

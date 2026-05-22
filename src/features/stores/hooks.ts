"use client";

import * as React from "react";
import {
  getAdminStoreById,
  getAdminStores,
  getPublicStores,
} from "./api";
import { deriveAvailableCities } from "./utils";
import type {
  GetAdminStoresOptions,
  GetPublicStoresOptions,
  StoreLocation,
  StoreLocatorState,
  UseStoreResult,
  UseStoresResult,
} from "./types";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function usePublicStores(
  options: GetPublicStoresOptions = { takeAll: true }
): UseStoresResult {
  const { city, latitude, longitude, page, radius, search, size, takeAll } = options;
  const [data, setData] = React.useState<StoreLocation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [metadata, setMetadata] = React.useState<UseStoresResult["metadata"]>(null);

  const fetchStores = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublicStores({
        city,
        latitude,
        longitude,
        page,
        radius,
        search,
        size,
        takeAll,
      });
      setData(response.items);
      setMetadata(response.metadata);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load stores."));
    } finally {
      setLoading(false);
    }
  }, [
    city,
    latitude,
    longitude,
    page,
    radius,
    search,
    size,
    takeAll,
  ]);

  React.useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { data, loading, error, metadata, refetch: fetchStores };
}

export function useAdminStores(
  options: GetAdminStoresOptions = { takeAll: true }
): UseStoresResult {
  const { city, isActive, page, search, size, takeAll } = options;
  const [data, setData] = React.useState<StoreLocation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [metadata, setMetadata] = React.useState<UseStoresResult["metadata"]>(null);

  const fetchStores = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminStores({
        city,
        isActive,
        page,
        search,
        size,
        takeAll,
      });
      setData(response.items);
      setMetadata(response.metadata);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load stores."));
    } finally {
      setLoading(false);
    }
  }, [
    city,
    isActive,
    page,
    search,
    size,
    takeAll,
  ]);

  React.useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { data, loading, error, metadata, refetch: fetchStores };
}

export function useAdminStore(id: string | null): UseStoreResult {
  const [data, setData] = React.useState<StoreLocation | null>(null);
  const [loading, setLoading] = React.useState(Boolean(id));
  const [error, setError] = React.useState<string | null>(null);

  const fetchStore = React.useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setData(await getAdminStoreById(id));
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load the store."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  return { data, loading, error, refetch: fetchStore };
}

export function useStoreLocatorState(
  stores: StoreLocation[] = []
): StoreLocatorState {
  const [search, setSearch] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState("all");
  const [selectedStoreId, setSelectedStoreId] = React.useState<string | null>(null);
  const [isNearMeActive, setIsNearMeActive] = React.useState(false);
  const [userLatitude, setUserLatitude] = React.useState<number | null>(null);
  const [userLongitude, setUserLongitude] = React.useState<number | null>(null);
  const [geolocationError, setGeolocationError] = React.useState<string | null>(null);

  const availableCities = React.useMemo(() => deriveAvailableCities(stores), [stores]);

  const requestNearMe = React.useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeolocationError("Geolocation is not supported in this browser.");
      return;
    }

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLatitude(position.coords.latitude);
          setUserLongitude(position.coords.longitude);
          setGeolocationError(null);
          setIsNearMeActive(true);
          resolve();
        },
        (error) => {
          setGeolocationError(error.message || "Unable to access your location.");
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const clearNearMe = React.useCallback(() => {
    setIsNearMeActive(false);
    setUserLatitude(null);
    setUserLongitude(null);
    setGeolocationError(null);
  }, []);

  return {
    search,
    selectedCity,
    selectedStoreId,
    isNearMeActive,
    userLatitude,
    userLongitude,
    geolocationError,
    availableCities,
    setSearch,
    setSelectedCity,
    setSelectedStoreId,
    requestNearMe,
    clearNearMe,
  };
}

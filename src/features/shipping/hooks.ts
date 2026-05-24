"use client";

import * as React from "react";
import {
  cancelShipmentForOrder,
  createShipmentForOrder,
  createShippingQuote,
  getShipmentSummary,
  getShippingDistricts,
  getShippingProvinces,
  getShippingWards,
  requoteShipmentForOrder,
  syncShipmentForOrder,
  updateShipmentNoteForOrder,
} from "./api";
import type {
  ShipmentActionState,
  ShipmentActionType,
  UseShipmentSummaryResult,
  UseShippingQuoteResult,
  UseShippingSelectorsResult,
} from "./types";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useShippingSelectors(
  provinceId: number | null,
  districtId: number | null
): UseShippingSelectorsResult {
  const [provinces, setProvinces] = React.useState<UseShippingSelectorsResult["provinces"]>(
    []
  );
  const [districts, setDistricts] = React.useState<UseShippingSelectorsResult["districts"]>(
    []
  );
  const [wards, setWards] = React.useState<UseShippingSelectorsResult["wards"]>([]);
  const [loadingProvinces, setLoadingProvinces] = React.useState(true);
  const [loadingDistricts, setLoadingDistricts] = React.useState(false);
  const [loadingWards, setLoadingWards] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refetchProvinces = React.useCallback(async () => {
    setLoadingProvinces(true);
    setError(null);
    try {
      setProvinces(await getShippingProvinces());
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load provinces."));
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  React.useEffect(() => {
    void refetchProvinces();
  }, [refetchProvinces]);

  React.useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }

    const nextProvinceId = provinceId;
    let cancelled = false;

    async function loadDistricts() {
      setLoadingDistricts(true);
      setError(null);
      try {
        const response = await getShippingDistricts(nextProvinceId);
        if (!cancelled) {
          setDistricts(response);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(getErrorMessage(fetchError, "Failed to load districts."));
        }
      } finally {
        if (!cancelled) {
          setLoadingDistricts(false);
        }
      }
    }

    void loadDistricts();

    return () => {
      cancelled = true;
    };
  }, [provinceId]);

  React.useEffect(() => {
    if (!districtId) {
      setWards([]);
      return;
    }

    const nextDistrictId = districtId;
    let cancelled = false;

    async function loadWards() {
      setLoadingWards(true);
      setError(null);
      try {
        const response = await getShippingWards(nextDistrictId);
        if (!cancelled) {
          setWards(response);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(getErrorMessage(fetchError, "Failed to load wards."));
        }
      } finally {
        if (!cancelled) {
          setLoadingWards(false);
        }
      }
    }

    void loadWards();

    return () => {
      cancelled = true;
    };
  }, [districtId]);

  return {
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    error,
    refetchProvinces,
  };
}

export function useShippingQuote(): UseShippingQuoteResult {
  const [quote, setQuote] = React.useState<UseShippingQuoteResult["quote"]>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [quoteInvalidated, setQuoteInvalidated] = React.useState(false);

  const requestQuote = React.useCallback<UseShippingQuoteResult["requestQuote"]>(
    async (request) => {
      setLoading(true);
      setError(null);
      try {
        const response = await createShippingQuote(request);
        setQuote(response);
        setQuoteInvalidated(false);
        return response;
      } catch (quoteError) {
        setError(getErrorMessage(quoteError, "Failed to create shipping quote."));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const invalidateQuote = React.useCallback(() => {
    setQuoteInvalidated(true);
  }, []);

  const resetQuote = React.useCallback(() => {
    setQuote(null);
    setError(null);
    setQuoteInvalidated(false);
  }, []);

  return {
    quote,
    loading,
    error,
    quoteInvalidated,
    requestQuote,
    setQuote,
    invalidateQuote,
    resetQuote,
  };
}

export function useShipmentSummary(orderId: string | null): UseShipmentSummaryResult {
  const [shipment, setShipment] = React.useState<UseShipmentSummaryResult["shipment"]>(null);
  const [loading, setLoading] = React.useState(Boolean(orderId));
  const [error, setError] = React.useState<string | null>(null);

  const refetch = React.useCallback(async () => {
    if (!orderId) {
      setShipment(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getShipmentSummary(orderId);
      setShipment(response);
      return response;
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load shipment summary."));
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  return { shipment, loading, error, refetch, setShipment };
}

export function useShipmentActions(orderId: string | null): ShipmentActionState {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const runAction = React.useCallback<ShipmentActionState["runAction"]>(
    async (action: ShipmentActionType, payload) => {
      if (!orderId) {
        return null;
      }

      setIsSubmitting(true);
      setActionError(null);
      setActionMessage(null);

      try {
        const shipment =
          action === "create"
            ? await createShipmentForOrder(orderId)
            : action === "requote"
              ? await requoteShipmentForOrder(orderId)
              : action === "sync"
                ? await syncShipmentForOrder(orderId)
                : action === "cancel"
                  ? await cancelShipmentForOrder(orderId)
                  : await updateShipmentNoteForOrder(orderId, payload?.note ?? "");

        const message =
          action === "create"
            ? "Shipment action completed."
            : action === "requote"
              ? "Shipment quote refreshed."
              : action === "sync"
                ? "Shipment status refreshed."
                : action === "cancel"
                  ? "Shipment cancelled."
                  : "Shipment note updated.";

        setActionMessage(message);
        return { shipment, message };
      } catch (actionFailure) {
        setActionError(getErrorMessage(actionFailure, "Shipment action failed."));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [orderId]
  );

  return {
    isSubmitting,
    actionError,
    actionMessage,
    runAction,
  };
}

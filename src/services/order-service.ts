import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  CreateOrderRequest,
  Order,
} from "@/types";
import type {
  ApiAdminOrderSummary,
  ApiCreateOrderRequest,
  ApiCreateOrderResponse,
  ApiOrderDetail,
  ApiOrderSummary,
  ApiPagination,
  ApiOrderPaymentInfo,
  ApiShipmentSummary,
} from "@/types/api";

export interface OrdersQuery {
  page?: number;
  pageSize?: number;
  status?: string;
}

interface LegacyOrdersResponse {
  items: ApiOrderSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

function mapOrderSummary(order: ApiOrderSummary): ApiOrderSummary {
  const items = order.items ?? [];
  const firstNamedItem = items.find((item) => item.productName || item.name);

  return {
    ...order,
    itemCount:
      order.itemCount ??
      order.totalItems ??
      (items.length > 0
        ? items.reduce((sum, item) => sum + (item.quantity ?? 1), 0)
        : null),
    firstProductName:
      order.firstProductName ??
      firstNamedItem?.productName ??
      firstNamedItem?.name ??
      null,
    deliveryMethod: order.deliveryMethod ?? "PICKUP",
    shippingProvider: order.shippingProvider ?? null,
    shipmentStatus: order.shipmentStatus ?? null,
    shipmentStatusLabel: order.shipmentStatusLabel ?? null,
  };
}

function mapOrderStatus(status: string): Order["status"] {
  switch (status) {
    case "PENDING":
    case "CONFIRMED":
    case "READY_TO_PICKUP":
    case "IN_DELIVERY":
    case "DELIVERED":
    case "REVIEWED":
    case "CANCELLED":
      return status;
    default:
      return "PENDING";
  }
}

function mapOrderItem(item: ApiOrderDetail["items"][number]): Order["items"][number] {
  return {
    productId: item.productId,
    variantId: item.variantId,
    name: item.productName,
    price: item.unitPrice,
    quantity: item.quantity,
    size: item.variantLabel ?? "",
    image: item.imageUrl ?? "",
  };
}

function mapDeliveryInfo(order: ApiOrderDetail): Order["delivery"] {
  return {
    fullName: order.deliveryFullName ?? "",
    phoneNumber: order.deliveryPhoneNumber ?? "",
    address: order.deliveryAddress ?? "",
    provinceId: order.provinceId ?? null,
    provinceName: order.provinceName ?? null,
    districtId: order.districtId ?? null,
    districtName: order.districtName ?? null,
    wardCode: order.wardCode ?? null,
    wardName: order.wardName ?? null,
  };
}

function mapShipmentSummary(
  shipment: ApiShipmentSummary | null | undefined
): Order["shipment"] {
  if (!shipment) {
    return null;
  }

  return {
    id: shipment.id,
    provider: shipment.provider,
    providerEnvironment: shipment.providerEnvironment,
    status: shipment.status,
    statusLabel: shipment.statusLabel,
    clientOrderCode: shipment.clientOrderCode,
    providerOrderCode: shipment.providerOrderCode,
    shopId: shipment.shopId,
    serviceId: shipment.serviceId,
    serviceTypeId: shipment.serviceTypeId,
    feeTotal: shipment.feeTotal,
    expectedDeliveryAt: shipment.expectedDeliveryAt,
    trackingUrl: shipment.trackingUrl,
    failureReasonCode: shipment.failureReasonCode,
    failureReason: shipment.failureReason,
    note: shipment.note,
    lastSyncedAt: shipment.lastSyncedAt,
  };
}

function mapOrderPaymentInfo(
  paymentInfo: ApiOrderPaymentInfo | null | undefined
): Order["paymentInfo"] {
  if (!paymentInfo) {
    return null;
  }

  return {
    paymentStatus: paymentInfo.paymentStatus,
    attemptCount: paymentInfo.attemptCount,
    latestPaymentId: paymentInfo.latestPaymentId,
    latestAttemptStatus: paymentInfo.latestAttemptStatus,
    stripeSessionId: paymentInfo.stripeSessionId,
    stripePaymentIntentId: paymentInfo.stripePaymentIntentId,
    stripeChargeId: paymentInfo.stripeChargeId,
    failureReason: paymentInfo.failureReason,
    latestAttemptCreatedAt: paymentInfo.latestAttemptCreatedAt,
  };
}

function mapOrderDetail(order: ApiOrderDetail): Order {
  const orderNumber = order.orderNumber ?? order.id;

  return {
    id: order.id,
    orderNumber,
    date: order.createdAt,
    status: mapOrderStatus(order.orderStatus),
    items: order.items.map(mapOrderItem),
    delivery: mapDeliveryInfo(order),
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    trackingNumber: order.trackingNumber,
    paymentInfo: mapOrderPaymentInfo(order.paymentInfo),
    deliveryMethod: order.deliveryMethod ?? "PICKUP",
    shippingProvider: order.shippingProvider ?? null,
    shippingQuoteSnapshot: order.shippingQuoteFingerprint
      ? {
          shippingQuoteFingerprint: order.shippingQuoteFingerprint,
          shippingServiceId: order.shippingServiceId ?? 0,
          shippingServiceTypeId: order.shippingServiceTypeId ?? null,
          shippingServiceLabel: order.shippingServiceLabel ?? "",
          shippingFee: order.shipping,
          shippingQuoteExpiresAt: order.shippingQuoteExpiresAt ?? "",
          shippingProviderEnvironment: order.shippingProviderEnvironment ?? "",
        }
      : null,
    shipmentStatus: order.shipmentStatus ?? order.shipment?.status ?? null,
    shipmentStatusLabel: order.shipmentStatusLabel ?? order.shipment?.statusLabel ?? null,
    shipment: mapShipmentSummary(order.shipment),
  };
}

function toPagination(
  response: ApiPagination<ApiOrderSummary> | LegacyOrdersResponse
): ApiPagination<ApiOrderSummary> {
  if ("metadata" in response) {
    return {
      ...response,
      items: response.items.map(mapOrderSummary),
    };
  }

  return {
    items: response.items.map(mapOrderSummary),
    metadata: {
      currentPage: response.page,
      totalPages: Math.max(1, Math.ceil(response.totalCount / response.pageSize)),
      pageSize: response.pageSize,
      totalCount: response.totalCount,
      payloadSize: response.items.length,
      hasPrevious: response.page > 1,
      hasNext: response.page * response.pageSize < response.totalCount,
      takeAll: false,
    },
  };
}

export async function createOrder(
  request: CreateOrderRequest
): Promise<ApiCreateOrderResponse> {
  const payload: ApiCreateOrderRequest = {
    fullName: request.fullName,
    phoneNumber: request.phoneNumber,
    address: request.address,
    paymentMethod: request.paymentMethod,
    notes: request.notes,
    saveDeliveryProfile: request.saveDeliveryProfile,
    provinceId: request.provinceId ?? null,
    provinceName: request.provinceName ?? null,
    districtId: request.districtId ?? null,
    districtName: request.districtName ?? null,
    wardCode: request.wardCode ?? null,
    wardName: request.wardName ?? null,
    deliveryMethod: request.deliveryMethod,
    shippingQuoteFingerprint: request.shippingQuoteFingerprint ?? null,
    shippingServiceId: request.shippingServiceId ?? null,
    shippingServiceTypeId: request.shippingServiceTypeId ?? null,
    shippingServiceLabel: request.shippingServiceLabel ?? null,
    shippingFee: request.shippingFee ?? null,
    shippingQuoteExpiresAt: request.shippingQuoteExpiresAt ?? null,
    shippingProviderEnvironment: request.shippingProviderEnvironment ?? null,
  };

  return apiPost<ApiCreateOrderResponse>("/v1/orders", payload);
}

export async function getOrders(
  query: OrdersQuery = {}
): Promise<ApiPagination<ApiOrderSummary>> {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 10));

  const response = await apiGet<ApiPagination<ApiOrderSummary> | LegacyOrdersResponse>(
    `/v1/orders?${params.toString()}`
  );

  return toPagination(response);
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const response = await apiGet<ApiOrderDetail>(`/v1/orders/${id}`);
    return mapOrderDetail(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

export async function getOrderHistory(
  query: OrdersQuery = {}
): Promise<{
  items: ApiOrderSummary[];
  hasNext: boolean;
  totalCount: number;
}> {
  const params = new URLSearchParams();
  if (query.status) {
    params.set("status", query.status);
  }

  const path = params.toString()
    ? `/v1/orders/my?${params.toString()}`
    : "/v1/orders/my";
  const items = await apiGet<ApiOrderSummary[]>(path);

  return {
    items: items.map(mapOrderSummary),
    hasNext: false,
    totalCount: items.length,
  };
}

export async function cancelOrder(id: string): Promise<void> {
  await apiPatch(`/v1/orders/${id}/cancel`);
}

export async function getAdminOrders(
  query: { status?: string } = {}
): Promise<ApiAdminOrderSummary[]> {
  const params = new URLSearchParams();
  if (query.status) {
    params.set("status", query.status);
  }
  const path = params.toString() ? `/v1/orders?${params.toString()}` : "/v1/orders";
  return apiGet<ApiAdminOrderSummary[]>(path);
}

export async function getAdminOrderById(id: string): Promise<ApiOrderDetail | null> {
  try {
    return await apiGet<ApiOrderDetail>(`/v1/orders/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

export async function updateOrderStatus(id: string, newStatus: string): Promise<string[]> {
  return apiPatch<string[]>(`/v1/orders/${id}/status`, { newStatus });
}

export async function getValidOrderStatuses(id: string): Promise<string[]> {
  return apiGet<string[]>(`/v1/orders/${id}/valid-statuses`);
}

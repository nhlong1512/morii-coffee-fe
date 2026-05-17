import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  CreateOrderRequest,
  Order,
} from "@/types";
import type {
  ApiCheckoutSessionResponse,
  ApiCreateCheckoutSessionRequest,
  ApiAdminOrderSummary,
  ApiCreateOrderRequest,
  ApiCreateOrderResponse,
  ApiCreateRefundRequest,
  ApiOrderDetail,
  ApiOrderPaymentSummary,
  ApiOrderSummary,
  ApiPagination,
  ApiRefundResponse,
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
  };

  return apiPost<ApiCreateOrderResponse>("/v1/orders", payload);
}

export async function createCheckoutSession(
  orderId: string
): Promise<ApiCheckoutSessionResponse> {
  const payload: ApiCreateCheckoutSessionRequest = { orderId };
  return apiPost<ApiCheckoutSessionResponse>(
    "/v1/payments/stripe/checkout-session",
    payload
  );
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

export async function getOrderPaymentSummary(
  orderId: string
): Promise<ApiOrderPaymentSummary | null> {
  try {
    return await apiGet<ApiOrderPaymentSummary>(`/v1/payments/by-order/${orderId}`);
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

export async function refundOrderPayment(
  orderId: string,
  request: ApiCreateRefundRequest
): Promise<ApiRefundResponse> {
  return apiPost<ApiRefundResponse>(`/v1/payments/${orderId}/refund`, request);
}

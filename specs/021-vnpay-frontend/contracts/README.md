# API Contracts: VNPAY Frontend Integration

**Status**: ✅ Complete  
**Date**: June 15, 2026  
**Backend Reference**: [FRONTEND_HANDOFF.md](../../../docs/features/vnpay-integration/FRONTEND_HANDOFF.md)

---

## Overview

These contracts define the frontend-backend interface for VNPAY payment integration. All endpoints are provided by the Morii Coffee backend (morii-coffee repository, .NET 8). Frontend makes authenticated HTTP calls via `payment-service.ts`.

---

## Authentication

All authenticated endpoints require:

```http
Authorization: Bearer {accessToken}
```

Access token obtained from login/auth flow (existing Zustand auth store).

---

## Endpoints

### 1. Create VNPAY Payment URL

**Purpose**: Generate a signed payment URL to redirect customer to VNPAY hosted payment page.

**Method**: `POST`

**Endpoint**: `/api/v1/payments/vnpay/payment-url`

**Authentication**: Required (Bearer token)

**Request Schema**:

```typescript
{
  deliveryProvinceName: string;     // e.g., "Hồ Chí Minh"
  deliveryDistrictName: string;     // e.g., "Quận 1"
  deliveryWardName: string;         // e.g., "Phường Bến Nghé"
  deliveryAddressDetail: string;    // e.g., "123 Nguyễn Huệ"
  deliveryPhoneNumber: string;      // 10-11 digits
  
  shippingProviderId: number;       // GHN shipper ID (e.g., 1 for GHN)
  expectedDeliveryDate: string;     // ISO 8601 date, e.g., "2026-06-20"
  serviceId: number;                // GHN service type ID
}
```

**Response Schema** (HTTP 200):

```typescript
{
  success: true,
  data: {
    paymentUrl: string;             // Signed URL to VNPAY hosted page
    checkoutDraftId: string;        // UUID, store in sessionStorage
    txnRef: string;                 // VNPAY transaction reference (UUID)
    amount: number;                 // VND amount (display to customer)
    currency: string;               // "VND"
    expiresAtUtc: string;          // ISO 8601 datetime (15 min from now)
  }
}
```

**Error Response** (HTTP 4xx/5xx):

```typescript
{
  success: false,
  error: {
    code: string;                   // e.g., "INVALID_DELIVERY_DATA", "PAYMENT_URL_CREATION_FAILED"
    message: string;                // User-friendly message
  }
}
```

**Frontend Usage**:

```typescript
// In src/services/payment-service.ts
export async function createVnpayPaymentUrl(
  request: CreateVnpayPaymentUrlRequest
): Promise<CreateVnpayPaymentUrlResponse> {
  const response = await fetch("/api/v1/payments/vnpay/payment-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAccessToken()}`
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    throw new PaymentError(await response.json());
  }
  
  const json = await response.json();
  return json.data;
}
```

---

### 2. Reconcile VNPAY Payment

**Purpose**: Poll backend to verify payment state after VNPAY return. Queries `QueryDR` if pending.

**Method**: `POST`

**Endpoint**: `/api/v1/payments/vnpay/reconcile`

**Authentication**: Required (Bearer token)

**Request Schema**:

```typescript
{
  checkoutDraftId: string;         // UUID from earlier create-payment-url response
  txnRef: string;                  // VNPAY transaction reference (same as above)
}
```

**Response Schema** (HTTP 200):

```typescript
{
  success: true,
  data: {
    checkoutDraftId: string;       // Echo of request
    txnRef: string;                // Echo of request
    orderId: string | null;        // UUID if finalized, null if still pending
    orderNumber: string | null;    // e.g., "MRC-20260615-0001" if finalized
    paymentStatus: string;         // "Paid" | "Failed" | "NotRequired" | null (pending)
    failureReason: string | null;  // Error detail if status is "Failed"
    expiresAtUtc: string;         // Original draft expiration time
  }
}
```

**Error Response** (HTTP 4xx/5xx):

```typescript
{
  success: false,
  error: {
    code: string;                   // e.g., "DRAFT_NOT_FOUND", "UNAUTHORIZED"
    message: string;
  }
}
```

**Frontend Usage**:

```typescript
// In src/components/checkout/vnpay-return-state.tsx
export async function reconcileVnpayPayment(
  checkoutDraftId: string,
  txnRef: string
): Promise<ReconcileResponse> {
  const response = await fetch("/api/v1/payments/vnpay/reconcile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAccessToken()}`
    },
    body: JSON.stringify({ checkoutDraftId, txnRef })
  });
  
  if (!response.ok) {
    throw new PaymentError(await response.json());
  }
  
  const json = await response.json();
  return json.data;
}
```

**Polling Strategy**:

```typescript
const poll = async () => {
  const elapsed = Date.now() - startTime;
  
  // Stop conditions
  if (elapsed > 300_000) {
    showError("reconcile_timeout");
    return;
  }
  if (isExpired(expiresAtUtc)) {
    showError("vnpay_expired");
    return;
  }
  
  try {
    const response = await reconcileVnpayPayment(checkoutDraftId, txnRef);
    
    if (response.paymentStatus === "Paid") {
      clearCart();
      navigateToOrder(response.orderId);
      return;
    }
    
    if (response.paymentStatus !== null) {
      // Failed or NotRequired
      showError(response.failureReason || response.paymentStatus);
      return;
    }
    
    // Still pending, schedule next poll
    setTimeout(poll, 2000 + Math.random() * 1000);
  } catch (error) {
    // Retry on network error, give up on 4xx
    if (error.status >= 400 && error.status < 500) {
      showError("unauthorized_or_draft_not_found");
    } else {
      setTimeout(poll, 2000 + Math.random() * 1000);
    }
  }
};

poll();
```

---

### 3. Get Payment History

**Purpose**: Retrieve payment records for an order (existing endpoint, extended with VNPAY fields).

**Method**: `GET`

**Endpoint**: `/api/v1/payments/by-order/{orderId}`

**Authentication**: Required (Bearer token)

**Response Schema** (HTTP 200):

```typescript
{
  success: true,
  data: {
    payments: [
      {
        id: string;
        orderId: string;
        paymentMethod: "COD" | "STRIPE" | "VNPAY" | ...;
        provider: "Stripe" | "Vnpay";
        
        // Provider-neutral fields
        providerSessionId?: string;    // Stripe sessionId, VNPAY txnRef
        providerPaymentId?: string;    // Stripe paymentIntentId, VNPAY TransactionNo
        providerTransactionId?: string;// Stripe chargeId, VNPAY BankTranNo
        
        // Status
        status: "Pending" | "Paid" | "Failed" | "Expired" | "Refunding" | "Refunded";
        failureReason?: string;
        
        // VNPAY diagnostic fields
        responseCode?: string;         // vnp_ResponseCode
        transactionStatus?: string;    // vnp_TransactionStatus
        bankCode?: string;            // vnp_BankCode
        cardType?: string;            // vnp_CardType
        payDate?: string;             // ISO 8601
        
        amount: number;               // VND
        createdAtUtc: string;        // ISO 8601
      }
    ]
  }
}
```

**Frontend Usage**:

```typescript
// In src/app/orders/[id]/page.tsx
const payments = await paymentService.getPaymentsByOrderId(orderId);

payments.forEach(payment => {
  console.log(`Provider: ${payment.provider}`);
  if (payment.provider === "Vnpay") {
    console.log(`  TransactionNo: ${payment.providerPaymentId}`);
    console.log(`  ResponseCode: ${payment.responseCode}`);
  }
});
```

---

### 4. Create Refund (Existing Endpoint, Provider-Agnostic)

**Purpose**: Request refund for a payment (routes to correct provider based on payment record).

**Method**: `POST`

**Endpoint**: `/api/v1/payments/{orderId}/refund`

**Authentication**: Required (Bearer token)

**Request Schema**:

```typescript
{
  amount?: number;                  // Optional; if null, full refund
  reason?: string;                  // Refund reason (optional)
}
```

**Response Schema** (HTTP 200):

```typescript
{
  success: true,
  data: {
    refundId: string;               // Refund transaction ID
    status: "Pending" | "Succeeded" | "Failed";
    providerRefundId?: string;      // Stripe refund ID or VNPAY refund ID
    message: string;
  }
}
```

**Error Response** (HTTP 4xx):

```typescript
{
  success: false,
  error: {
    code: "REFUND_CAPABILITY_DISABLED" | "INSUFFICIENT_BALANCE" | "INVALID_ORDER" | ...;
    message: string;                // "Refunds are not available for this payment method at this time."
  }
}
```

**Frontend Usage**:

```typescript
// In src/app/admin/orders/[id]/page.tsx
const result = await paymentService.createRefund(orderId, {
  amount: partialAmount,
  reason: "Customer request"
});

if (result.success) {
  showToast("Refund processed");
} else if (result.error.code === "REFUND_CAPABILITY_DISABLED") {
  showToast(t("refund.vnpay_unavailable"));
} else {
  showError(result.error.message);
}
```

---

## Error Handling

### Common Error Codes

| Code | HTTP | Meaning | Frontend Action |
|------|------|---------|-----------------|
| `INVALID_DELIVERY_DATA` | 400 | Delivery info incomplete or invalid | Show validation error, allow retry |
| `INVALID_SHIPPING_QUOTE` | 400 | Shipping quote stale or invalid | Refresh shipping quote, retry |
| `PAYMENT_URL_CREATION_FAILED` | 500 | Backend error creating signed URL | Show error, allow retry |
| `DRAFT_NOT_FOUND` | 404 | Checkout draft expired or doesn't exist | Offer new checkout |
| `UNAUTHORIZED` | 401 | Access token invalid/expired | Redirect to login |
| `REFUND_CAPABILITY_DISABLED` | 402 | VNPAY refund API not enabled | Show i18n message, disable refund button |
| `INSUFFICIENT_BALANCE` | 402 | Cannot refund more than original amount | Show error, allow partial refund |

### Network Error Handling

**Transient (Retry)**:
- Network timeout
- 5xx server error
- Any error without explicit 4xx code

**Terminal (Don't Retry)**:
- 400 Bad Request (invalid input)
- 401 Unauthorized (auth issue)
- 403 Forbidden (permission)
- 404 Not Found (resource doesn't exist)

---

## Testing Strategy

### Unit Tests (payment-service.ts)

```typescript
describe("createVnpayPaymentUrl", () => {
  test("returns signed URL and draft ID on success");
  test("throws error on 400 response");
  test("throws error on network failure");
});

describe("reconcileVnpayPayment", () => {
  test("returns paid status with orderId");
  test("returns failed status with failureReason");
  test("returns null paymentStatus when pending");
  test("retries on 500 error");
  test("gives up on 404 error");
});
```

### Integration Tests (checkout flow)

```typescript
describe("VNPAY Checkout Flow", () => {
  test("Submit checkout → redirect to VNPAY URL");
  test("Return with pending status → polling continues");
  test("Return with paid status → cart cleared, order displayed");
  test("Polling timeout → show timeout message");
  test("Payment expired → show expiration message");
});
```

### Sandbox Acceptance

1. Create VNPAY checkout with valid delivery/shipping
2. Confirm payment URL is valid HTTPS URL
3. Complete payment on VNPAY sandbox
4. Confirm return page loads and polling begins
5. Confirm order is created after IPN confirmation
6. Verify refund capability (if enabled)

---

## Cross-References

- **Backend Contract**: [FRONTEND_HANDOFF.md](../../../docs/features/vnpay-integration/FRONTEND_HANDOFF.md)
- **Data Model**: [data-model.md](../data-model.md)
- **Implementation Guide**: [README.md](../../../docs/features/vnpay-integration/README.md)

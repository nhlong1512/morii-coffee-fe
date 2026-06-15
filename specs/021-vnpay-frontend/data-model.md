# Data Model: VNPAY Frontend Integration

**Status**: ✅ Complete  
**Date**: June 15, 2026

---

## Overview

VNPAY frontend integration extends existing payment types and checkout state with provider-neutral fields. No new database schema required (backend handles persistence). All data is frontend-local or backend-provided DTOs.

---

## Entities & Type Definitions

### PaymentMethod (Enum)

**Location**: `src/types/index.ts`

**Definition**:
```typescript
export type PaymentMethod = 
  | "COD"              // Cash on delivery
  | "MOMO"             // MOMO (Vietnamese mobile wallet)
  | "PAYPAL"           // PayPal
  | "STRIPE"           // Stripe
  | "VNPAY";           // VNPAY (new)
```

**Usage**: Customer selects one during checkout; stored in order.

**Validation**: Must be one of the union values (TypeScript enforces).

---

### PaymentProvider (Enum)

**Location**: `src/lib/payment.ts`

**Definition**:
```typescript
export type PaymentProvider = 
  | "Stripe"           // Stripe integration (SCA/3DS)
  | "Vnpay";           // VNPAY integration (hosted page)
```

**Usage**: Maps payment method to provider integration. One-to-many (future: PayPal provider, Momo provider).

**Validation**: Must match payment gateway availability.

---

### PendingHostedCheckout (Session State)

**Location**: `src/lib/payment.ts`

**Scope**: Client-side, sessionStorage-persisted (session lifetime).

**Definition**:
```typescript
export interface PendingHostedCheckout {
  provider: "Stripe" | "Vnpay";
  checkoutDraftId: string;       // UUID from backend
  providerSessionId: string;     // Stripe session ID or VNPAY txnRef
  expiresAtUtc: string;          // ISO 8601 datetime
}
```

**Transitions**:
1. Created: When customer submits checkout with hosted payment method (Stripe/VNPAY)
2. Retrieved: On return endpoint, loaded from sessionStorage
3. Consumed: After polling confirms `paymentStatus: "Paid"` or timeout/expiration
4. Cleaned: Browser closes (sessionStorage cleared) or explicit removal after terminal state

**Validation**:
- `provider` in ["Stripe", "Vnpay"]
- `checkoutDraftId` is valid UUID
- `expiresAtUtc` is future date (otherwise treat as expired)
- All fields required (non-null)

---

### Payment (DTO from Backend)

**Location**: `src/types/api.ts`

**Scope**: Backend-provided, read-only on frontend.

**Definition**:
```typescript
export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  provider: PaymentProvider;
  
  // Provider-neutral fields
  providerSessionId?: string;    // Stripe sessionId, VNPAY txnRef
  providerPaymentId?: string;    // Stripe paymentIntentId, VNPAY TransactionNo
  providerTransactionId?: string; // Stripe chargeId, VNPAY BankTranNo
  
  // Status
  status: "Pending" | "Paid" | "Failed" | "Expired" | "Refunding" | "Refunded";
  failureReason?: string;
  
  // VNPAY-specific diagnostic fields
  responseCode?: string;         // vnp_ResponseCode
  transactionStatus?: string;    // vnp_TransactionStatus
  bankCode?: string;            // vnp_BankCode
  cardType?: string;            // vnp_CardType
  payDate?: string;             // ISO 8601 of vnp_PayDate
  
  // Backward compat (Stripe fields, kept as aliases)
  stripeSessionId?: string;      // Same as providerSessionId for Stripe
  stripePaymentIntentId?: string; // Same as providerPaymentId
  stripeChargeId?: string;       // Same as providerTransactionId
  
  // Metadata
  amount: number;               // VND
  createdAtUtc: string;        // ISO 8601
  updatedAtUtc: string;        // ISO 8601
}
```

**Validation**:
- `provider` determines which optional fields are populated
- VNPAY payments: expect `responseCode`, `transactionStatus`, possibly `bankCode`/`cardType`
- Stripe payments: `stripeSessionId` or `providerSessionId` populated

---

### ReconcileVnpayPaymentResponse (DTO from Backend)

**Location**: `src/types/api.ts`

**Scope**: Response from `POST /api/v1/payments/vnpay/reconcile` endpoint.

**Definition**:
```typescript
export interface ReconcileVnpayPaymentResponse {
  checkoutDraftId: string;       // UUID
  txnRef: string;               // VNPAY transaction reference
  orderId?: string;             // UUID if finalized, else null
  orderNumber?: string;         // e.g. "MRC-20260615-0001" if finalized
  paymentStatus: "Paid" | "Failed" | "NotRequired" | null;
  failureReason?: string;       // If status is "Failed"
  expiresAtUtc: string;         // ISO 8601 (original draft expiration)
}
```

**Validation**:
- `paymentStatus` is one of terminal values or null (pending)
- `orderId` and `orderNumber` populated iff `paymentStatus === "Paid"`
- `failureReason` present iff `paymentStatus === "Failed"`

---

### CreateVnpayPaymentUrlRequest (DTO to Backend)

**Location**: `src/types/api.ts`

**Scope**: Request body for `POST /api/v1/payments/vnpay/payment-url`.

**Definition**:
```typescript
// Reuse existing checkout delivery structure
export interface CreateVnpayPaymentUrlRequest {
  deliveryProvinceName: string;
  deliveryDistrictName: string;
  deliveryWardName: string;
  deliveryAddressDetail: string;
  deliveryPhoneNumber: string;
  
  shippingProviderId: number;    // GHN shipper ID
  expectedDeliveryDate: string;  // ISO 8601 date
  serviceId: number;             // GHN service type
  
  // (NO amount, NO ip address, NO signing)
}
```

**Validation**:
- All fields required and non-empty
- Phone number format valid (10-11 digits for Vietnam)
- Date in future
- Service ID matches provider

---

### CreateVnpayPaymentUrlResponse (DTO from Backend)

**Location**: `src/types/api.ts`

**Scope**: Response from `POST /api/v1/payments/vnpay/payment-url`.

**Definition**:
```typescript
export interface CreateVnpayPaymentUrlResponse {
  paymentUrl: string;           // Full signed URL to VNPAY hosted page
  checkoutDraftId: string;      // UUID (store in sessionStorage)
  txnRef: string;              // VNPAY transaction reference (store in sessionStorage)
  amount: number;              // VND (display to customer)
  currency: string;            // "VND"
  expiresAtUtc: string;        // ISO 8601 (store in sessionStorage)
}
```

**Validation**:
- `paymentUrl` starts with `https://sandbox.vnpayment.vn/` or `https://vnpayment.vn/`
- `amount` > 0
- `expiresAtUtc` is future date
- All fields non-null

---

### Order (Enhanced)

**Location**: `src/types/api.ts` (existing entity, extended)

**New Fields** (VNPAY support):
```typescript
export interface Order {
  // ... existing fields
  
  paymentMethod: PaymentMethod;   // Now includes "VNPAY"
  paymentProvider: PaymentProvider; // "Stripe" | "Vnpay"
  paymentStatus: "Pending" | "Paid" | "Cancelled" | "Refunded";
  
  providerPaymentId?: string;     // VNPAY TransactionNo or Stripe PaymentIntentId
  providerTransactionId?: string; // VNPAY BankTranNo or Stripe ChargeId
  
  // Backward compat
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
}
```

---

## Relationships

```
PendingHostedCheckout (sessionStorage)
  └─ CheckoutDraftId ──> Backend CheckoutDraft (cached, expires 15 min)
  └─ ProviderSessionId ──> VNPAY TxnRef (unique per day)

Order
  └─ PaymentId ──> Payment
  └─ PaymentProvider ──> Payment.Provider
  └─ PaymentMethod ──> Payment.PaymentMethod

Payment
  └─ Provider ──> PaymentProvider enum
  └─ Status ──> "Paid" | "Failed" | "Refunding" | ...
```

---

## State Transitions

### PendingHostedCheckout Lifecycle

```
Created (sessionStorage)
   ↓
Retrieved (browser returns)
   ↓
Polling active (reconcile endpoint called repeatedly)
   ↓
Terminal: Paid (→ clear sessionStorage, navigate to order)
        │ Failed (→ clear sessionStorage, show error)
        │ Expired (→ clear sessionStorage, prompt retry)
        │ Timeout (→ clear sessionStorage, offer manual check)
```

### Payment Status Lifecycle

```
Pending (draft created, waiting for customer payment)
   ↓
Paid (IPN confirmed successful transaction)
   └─ Refunding (admin/customer initiated refund)
   └─ Refunded (refund completed)
   
Failed (customer cancelled or VNPAY declined)

Expired (draft expires, no payment attempt)
```

---

## Validation Rules

### PendingHostedCheckout Validation

- **expiresAtUtc**: Must be in future (otherwise treat checkout as expired)
- **checkoutDraftId**: Must be valid UUID format
- **providerSessionId**: Non-empty string
- All fields required (no partial storage)

### Payment Status Validation

- VNPAY payments: `provider === "Vnpay"` implies `responseCode` and `transactionStatus` are populated
- Stripe payments: `provider === "Stripe"` implies `stripeSessionId` populated (backward compat)
- Status transitions are one-way: Pending → Paid/Failed/Expired

### Order/Payment Consistency

- Order.paymentMethod must align with Order.paymentProvider (e.g., "VNPAY" payment method → "Vnpay" provider)
- Payment.paymentMethod same as Order.paymentMethod
- Order.paymentStatus must match Payment.status (denormalized for convenience)

---

## Frontend Storage & Caching

### sessionStorage

**Key**: `morii.pendingHostedCheckout`

**Value**: JSON string of `PendingHostedCheckout`

**Lifetime**: Browser session (cleared on tab close)

**Accessed by**:
- `src/app/checkout/page.tsx` (writes before redirect)
- `src/app/checkout/vnpay/return/page.tsx` (reads on return)

### Zustand Store (checkout)

**State**:
```typescript
interface CheckoutStore {
  cart: CartItem[];
  delivery: DeliveryInfo;
  shipping: ShippingQuote;
  paymentMethod: PaymentMethod;
  
  // New for VNPAY
  selectedProvider: PaymentProvider;
  pendingCheckoutDraftId?: string;  // Matches sessionStorage
}
```

**Persist**: Yes (localStorage, via persist middleware)

### React Query / SWR Cache

**Queries**:
- `GET /api/v1/payments/by-order/{orderId}` (payment history)
- `POST /api/v1/payments/vnpay/reconcile` (polling, no cache)

**Strategy**: No caching on reconcile (always fresh); cache payment history for order detail view.

---

## Migration & Backward Compatibility

### Type Extension (No Breaking Changes)

**Before**:
```typescript
export type PaymentMethod = "COD" | "MOMO" | "PAYPAL" | "STRIPE";
```

**After**:
```typescript
export type PaymentMethod = "COD" | "MOMO" | "PAYPAL" | "STRIPE" | "VNPAY";
```

**Backward Compat**: Existing code checking `if (method === "STRIPE")` continues to work.

### DTO Aliases

**Stripe Payment DTO**:
- `providerSessionId` ← `stripeSessionId` (backward compat alias)
- `providerPaymentId` ← `stripePaymentIntentId` (backward compat alias)

**Impact**: Stripe payment display code works with either field name; VNPAY always uses `providerSessionId`.

---

## Diagrams

### Data Flow: Checkout → VNPAY → Return

```
┌─────────────────┐
│   Checkout      │
│ (Customer info) │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ POST /vnpay/payment-url                 │
│ (Delivery + Shipping data)              │
│ Backend creates checkout draft          │
└────────┬────────────────────────────────┘
         │ Response: {paymentUrl, checkoutDraftId, txnRef, expiresAtUtc}
         ↓
┌─────────────────────────────────────────┐
│ sessionStorage.setItem(                 │
│  "morii.pendingHostedCheckout",         │
│  {provider, checkoutDraftId, ...}       │
│ )                                       │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ window.location.assign(paymentUrl)      │
│ → VNPAY Hosted Page                     │
└────────┬────────────────────────────────┘
         │
      ╔══════════════════════╗
      ║  CUSTOMER PAYMENT    ║
      ║ Completes / Cancels  ║
      ╚──────────┬───────────╝
         │
         ↓
┌─────────────────────────────────────────┐
│ VNPAY Return                            │
│ GET /api/vnpay/return?txnRef=...       │
│ Backend verifies, redirects             │
└────────┬────────────────────────────────┘
         │ Redirect to: /checkout/vnpay/return?result=...
         ↓
┌─────────────────────────────────────────┐
│ /checkout/vnpay/return                  │
│ Load sessionStorage                     │
│ Begin polling reconcile                 │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ POST /vnpay/reconcile                   │
│ {checkoutDraftId, txnRef}               │
│ Poll every 2-3s, 300s timeout           │
└────────┬────────────────────────────────┘
         │ Response: {paymentStatus, orderId?, ...}
         ↓
    ╔════════════════════════════╗
    ║ paymentStatus === "Paid"?  ║
    ╚───────┬──────────────┬─────╝
            │ YES          │ NO
            ↓              ↓
       Clear cart     Continue polling
       Navigate       or show error
       to order
```

---

## Next Steps

- Data model is stable
- Proceed to Phase 1: Contracts definition (see `contracts/`)

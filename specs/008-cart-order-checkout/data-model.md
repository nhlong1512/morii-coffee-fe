# Data Model: Cart and Order Checkout

**Feature**: `008-cart-order-checkout`
**Date**: 2026-04-19
**Updated**: 2026-04-20 — status enum expanded from 4 to 7 values; stepper redesigned to 6 steps

## Existing Entities (Unchanged)

### CartItem (src/stores/cart-store.ts)

| Field | Type | Validation |
|-------|------|------------|
| productId | string | Non-empty |
| name | string | Non-empty |
| price | number | > 0 |
| quantity | number | ≥ 1 |
| size | string? | Optional |
| image | string | Non-empty (URL or path) |

**State transitions**: Items are added, quantity is adjusted (min 1), or removed. Removal is triggered when quantity drops to 0 via `updateQuantity`. Cart is cleared after successful order submission.

---

### Order (src/types/index.ts — EXTENDED)

The existing Order type is extended with fields needed for the detail view and to mirror the expected real API response shape.

| Field | Type | Notes |
|-------|------|-------|
| id | string | UUID from backend |
| orderNumber | string | Human-readable (e.g., "#ORD-1001") |
| date | string | ISO date string |
| status | `"PENDING" \| "CONFIRMED" \| "READY_TO_PICKUP" \| "IN_DELIVERY" \| "DELIVERED" \| "REVIEWED" \| "CANCELLED"` | SCREAMING_SNAKE_CASE, matches backend contract |
| items | OrderItem[] | Snapshot of cart items at order time |
| delivery | DeliveryInfo | Delivery address used for this order |
| paymentMethod | PaymentMethod | Payment option selected at checkout |
| subtotal | number | Sum of line items before tax/shipping |
| tax | number | Tax amount applied |
| shipping | number | Shipping fee applied |
| discount | number | Discount applied (0 if none) |
| total | number | Grand total in VND |
| trackingNumber | string \| null | Null until dispatched |

---

### OrderItem (src/types/index.ts — existing)

| Field | Type | Notes |
|-------|------|-------|
| productId | string | — |
| name | string | — |
| price | number | Price at time of order |
| quantity | number | — |
| size | string | — |
| image | string | — |

---

## New Entities

### PriceSummary (derived, no persistence)

Computed from cart state + constants. Not stored; recalculated on render.

| Field | Type | Derivation |
|-------|------|-----------|
| subtotal | number | `sum(item.price * item.quantity)` |
| tax | number | `subtotal * TAX_RATE` (TAX_RATE = 0.10) |
| shipping | number | `SHIPPING_FEE` (15,000 VND flat) |
| discount | number | `0` for this phase (no coupon mechanism) |
| total | number | `subtotal + tax + shipping - discount` |

---

### DeliveryInfo (form state, not persisted)

Captured in local component state on the Checkout page. Submitted as part of the order payload.

| Field | Type | Validation |
|-------|------|-----------|
| fullName | string | Required, non-empty |
| phoneNumber | string | Required, Vietnamese mobile format: 10 digits, prefix 03/05/07/08/09 |
| address | string | Required, non-empty |

**Validation regex for phoneNumber**: `/^(03|05|07|08|09)\d{8}$/`

---

### PaymentMethod (new enum, src/types/index.ts)

```
'COD' | 'MOMO' | 'PAYPAL'
```

Default: `'COD'`

MoMo and PayPal are selectable UI options only; no payment gateway logic is triggered in this phase.

---

### CreateOrderRequest (new type, src/types/index.ts)

Payload sent to the order service / API.

| Field | Type | Notes |
|-------|------|-------|
| items | CartItem[] | Snapshot of current cart items |
| delivery | DeliveryInfo | Customer-provided delivery details |
| paymentMethod | PaymentMethod | Selected payment option |
| subtotal | number | Pre-tax, pre-shipping subtotal |
| tax | number | Calculated tax amount |
| shipping | number | Flat shipping fee |
| discount | number | Discount amount (0 for this phase) |
| total | number | Grand total |

---

### OrderStatusStep (derived, no persistence)

Drives the `<OrderStatusProgress>` stepper component. Computed from `order.status`.

| Step Index | Status Value | i18n Label (VI) | Icon (Lucide) |
|---|---|---|---|
| 0 | `PENDING` | Đơn hàng đã đặt | `Clock` |
| 1 | `CONFIRMED` | Đã xác nhận thông tin thanh toán | `CreditCard` |
| 2 | `READY_TO_PICKUP` | Chờ lấy hàng | `Package` |
| 3 | `IN_DELIVERY` | Đang giao | `Truck` |
| 4 | `DELIVERED` | Đã giao thành công | `Home` |
| 5 | `REVIEWED` | Đã đánh giá | `Star` |

**Step state logic**:
- `completed`: step index < current status index → filled primary circle + checkmark icon
- `active`: step index === current status index → filled primary circle + step icon
- `upcoming`: step index > current status index → outline/muted circle + muted icon
- `CANCELLED`: `order.status === "CANCELLED"` → 6-step row replaced entirely with red X icon + "Đã hủy" label

**Status index mapping**:
```
PENDING          → index 0
CONFIRMED        → index 1
READY_TO_PICKUP  → index 2
IN_DELIVERY      → index 3
DELIVERED        → index 4
REVIEWED         → index 5
CANCELLED        → terminal (no index; replaces progress row)
```

---

## Constants (new, src/lib/constants.ts or src/lib/pricing.ts)

| Constant | Value | Notes |
|----------|-------|-------|
| TAX_RATE | 0.10 | 10% applied to subtotal |
| SHIPPING_FEE | 15000 | Flat fee in VND |

---

## State Transitions: Order Fulfilment Lifecycle

```
[Placed]
  └─→ PENDING
        └─→ CONFIRMED
              └─→ READY_TO_PICKUP
                    └─→ IN_DELIVERY
                          └─→ DELIVERED
                                └─→ REVIEWED  (terminal: success + reviewed)
        └─→ CANCELLED             (terminal: failure — can occur at any step before DELIVERED)
```

The client UI reads `order.status` as a snapshot — there is no real-time update in this phase. Status changes appear only when the page is refreshed or the API is re-called.

---

## State Transitions: Checkout Flow

```
Cart (items > 0)
  → [Click Checkout] →
Checkout Page (delivery form + payment selection)
  → [Click Place Order] →
  → [API call in-flight] → button disabled, loading spinner
  → [Success] → clearCart() → redirect to /orders
  → [Failure] → button re-enabled, toast error shown, form data preserved
```

---

## Entity Relationships

```
CartItem (n) ──belongs to──> Cart (1)
CartItem ──snapshot at order time──> OrderItem (n) ──belongs to──> Order (1)
Order ──has──> DeliveryInfo (1), PaymentMethod (1)
CreateOrderRequest ──contains──> DeliveryInfo (1), CartItem[] (n), PaymentMethod (1)
PriceSummary ──derived from──> CartItem[] (cart context) OR Order fields (history context)
OrderStatusStep[] ──derived from──> Order.status
```

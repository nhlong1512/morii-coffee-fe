# Data Model: Cart and Order Checkout

**Feature**: `008-cart-order-checkout`
**Date**: 2026-04-19

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
| status | `"delivered" \| "in-transit" \| "processing" \| "cancelled"` | — |
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

| Step Index | Label | Icon | Active When Status Is |
|---|---|---|---|
| 0 | Processing | Clock / Package | processing |
| 1 | In Transit | Truck | in-transit |
| 2 | Delivered | CheckCircle | delivered |

**Step state logic**:
- `completed`: step index < current status index
- `active`: step index === current status index
- `upcoming`: step index > current status index
- `cancelled`: `order.status === "cancelled"` — all steps muted, Cancelled label shown as terminal node

**Status index mapping**:
```
processing  → index 0
in-transit  → index 1
delivered   → index 2
cancelled   → terminal (no index; shown after last reached step)
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
  └─→ processing
        └─→ in-transit
              └─→ delivered  (terminal: success)
        └─→ cancelled        (terminal: failure, can occur at processing or in-transit)
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

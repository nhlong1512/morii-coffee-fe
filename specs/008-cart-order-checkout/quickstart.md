# Quickstart: Cart and Order Checkout

**Feature**: `008-cart-order-checkout`
**Branch**: `008-cart-order-checkout`

## Overview

This feature enhances the existing Cart page and adds a new Checkout page. The primary happy path is: Customer views cart → clicks Checkout → fills delivery info + selects COD → clicks Place Order → redirected to Order History.

## Key Files

| File | Role |
|------|------|
| `src/app/cart/page.tsx` | Enhanced cart page (thumbnails, shipping fee, wired Checkout button) |
| `src/app/checkout/page.tsx` | New checkout page (delivery form, payment selection, place order) |
| `src/app/orders/page.tsx` | Enhanced order history page (status stepper, "View Details" link) |
| `src/app/orders/[id]/page.tsx` | New order detail page (full order info, status stepper, price breakdown) |
| `src/components/checkout/price-summary.tsx` | Shared price summary panel (cart + checkout + order detail) |
| `src/components/checkout/delivery-form.tsx` | Delivery info form with validation |
| `src/components/checkout/payment-method-selector.tsx` | COD/MoMo/PayPal radio buttons |
| `src/components/orders/order-status-progress.tsx` | Status stepper: Processing → In Transit → Delivered / Cancelled |
| `src/components/orders/order-detail-card.tsx` | Reusable order detail layout (items + delivery + payment) |
| `src/services/order-service.ts` | Mock order submission service |
| `src/data/orders.ts` | Extended mock order data (with delivery, payment, pricing fields) |
| `src/types/index.ts` | Add `DeliveryInfo`, `PaymentMethod`, `CreateOrderRequest`; extend `Order` |
| `src/i18n/messages/en.json` | Add `checkout` + `orderDetail` namespace keys |
| `src/i18n/messages/vi.json` | Same as en.json (Vietnamese) |

## New Constants

Add to `src/lib/constants.ts` (or create `src/lib/pricing.ts`):

```typescript
export const TAX_RATE = 0.10;        // 10% tax on subtotal
export const SHIPPING_FEE = 15000;   // 15,000 VND flat shipping fee
```

## i18n Keys to Add

**Namespace: `checkout`** (add to both `en.json` and `vi.json`):

```json
"checkout": {
  "title": "Order Details",
  "deliveryTitle": "Delivery Information",
  "fullName": "Full Name",
  "fullNamePlaceholder": "Enter your full name",
  "phoneNumber": "Phone Number",
  "phoneNumberPlaceholder": "e.g. 0901234567",
  "address": "Delivery Address",
  "addressPlaceholder": "Enter your delivery address",
  "paymentTitle": "Payment Method",
  "cod": "Cash on Delivery",
  "momo": "MoMo",
  "paypal": "PayPal",
  "placeOrder": "Place Order",
  "placing": "Placing Order...",
  "shipping": "Shipping Fee",
  "discount": "Discount",
  "orderSummary": "Order Summary",
  "subtotal": "Subtotal",
  "tax": "Tax (10%)",
  "total": "Total",
  "errorRequired": "This field is required",
  "errorPhone": "Please enter a valid Vietnamese phone number",
  "errorOrderFailed": "Failed to place order. Please try again.",
  "backToCart": "Back to Cart"
}
```

Also update `cart` namespace to add missing keys:
```json
"orderSummary": "Order Summary",
"shipping": "Shipping Fee",
"tax": "Tax (10%)",
"clearCart": "Clear Cart"
```

## Running the Feature

```bash
pnpm dev    # Start dev server, navigate to /cart then /checkout
pnpm lint   # Verify no linting errors
```

## i18n Keys to Add — orderDetail Namespace

```json
"orderDetail": {
  "title": "Order Detail",
  "backToOrders": "Back to Orders",
  "orderNumber": "Order Number",
  "orderDate": "Order Date",
  "deliveryInfo": "Delivery Information",
  "paymentMethod": "Payment Method",
  "items": "Items Ordered",
  "notFound": "Order not found",
  "notFoundHint": "The order you're looking for doesn't exist or has been removed.",
  "cod": "Cash on Delivery",
  "momo": "MoMo",
  "paypal": "PayPal",
  "tracking": "Tracking Number",
  "statusProcessing": "Processing",
  "statusInTransit": "In Transit",
  "statusDelivered": "Delivered",
  "statusCancelled": "Cancelled"
}
```

## Testing the Cart Happy Path

1. Open `/products`, add an item to cart.
2. Navigate to `/cart` — verify thumbnail, price summary with shipping, Checkout button.
3. Click "Checkout" — verify redirect to `/checkout`.
4. Fill delivery form with valid data, select COD, click "Place Order".
5. Verify redirect to `/orders` and cart is cleared.

## Testing the Cart Error Path

1. In `src/services/order-service.ts`, temporarily set `shouldFail = true`.
2. Click "Place Order" — verify toast error, button re-enables, form data preserved.

## Testing the Empty Cart Guard

1. Clear cart or use a fresh session.
2. Navigate directly to `/checkout` — verify redirect to `/cart` with empty state shown.

## Testing Order History

1. Navigate to `/orders` — verify all mock orders shown with status steppers.
2. Verify each status variant renders correctly:
   - processing → step 1 active, steps 2-3 upcoming
   - in-transit → step 1 complete, step 2 active, step 3 upcoming
   - delivered → all 3 steps complete
   - cancelled → muted steps, Cancelled terminal node shown
3. Click "View Details" on any order — verify navigation to `/orders/[id]`.

## Testing Order Detail

1. Navigate to `/orders/[valid-id]` — verify full detail renders (stepper, items with thumbnails, delivery, payment, price breakdown).
2. Navigate to `/orders/invalid-id` — verify not-found state shown with back link.

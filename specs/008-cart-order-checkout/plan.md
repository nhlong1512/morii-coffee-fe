# Implementation Plan: Cart and Order Checkout

**Branch**: `008-cart-order-checkout` | **Date**: 2026-04-19 | **Updated**: 2026-04-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-cart-order-checkout/spec.md`

## Summary

Enhance the existing Cart page to show product thumbnails, a complete price summary (subtotal + tax + shipping + discount), and a wired Checkout button. Create a new `/checkout` page with a delivery information form, COD/MoMo/PayPal payment selection, and a "Place Order" button that calls a mock order service and redirects to Order History on success. Enhance the Order History page with a 6-step visual status progress stepper (PENDING → CONFIRMED → READY_TO_PICKUP → IN_DELIVERY → DELIVERED → REVIEWED / CANCELLED) and create a new Order Detail page (`/orders/[id]`) showing full order information. Order status values use SCREAMING_SNAKE_CASE aligned with the backend API contract. All data is mock-only this phase; the mock structure mirrors the real API shape for clean next-phase integration. All strings are externalized via next-intl (VI/EN).

## Technical Context

**Language/Version**: TypeScript 5.x + Next.js 16.1.6 (App Router)
**Primary Dependencies**: React 19.2.3, Zustand 5.0.11, next-intl 4.8.3, Tailwind CSS v4, Lucide React, next/image
**Storage**: Client-side localStorage via Zustand persist (cart state); no server-side persistence in this phase
**Testing**: Jest 30.3.0, @testing-library/react 16
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Next.js web application (App Router, `src/` directory)
**Performance Goals**: Page render under standard connection; no specific latency targets for mock phase
**Constraints**: UI-only (mock data acceptable); no real payment gateway integration; cart state is client-only (no SSR access)
**Scale/Scope**: 4 pages (2 enhanced, 2 new), 5 shared components, 1 service, 1 mock data update, 1 type update, 2 i18n files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution file is an unfilled template — no formal gates are defined. No violations to evaluate. Proceeding per CLAUDE.md principles: Simplicity First, Minimal Impact, No Laziness.

- [x] Only touches files necessary for this feature
- [x] No new npm dependencies introduced
- [x] Follows existing patterns (Zustand store, next-intl, App Router pages, service layer)
- [x] Shared component (`PriceSummary`) justified by avoiding duplication across two pages

## Project Structure

### Documentation (this feature)

```text
specs/008-cart-order-checkout/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — all decisions documented
├── data-model.md        # Phase 1 — entities, types, state transitions
├── quickstart.md        # Phase 1 — developer onboarding guide
├── contracts/
│   └── create-order.md  # POST /api/orders contract + mock spec
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code Changes

```text
src/
├── app/
│   ├── cart/
│   │   └── page.tsx                    ← MODIFY: thumbnails, shipping, wired Checkout btn
│   ├── checkout/                       ← CREATE NEW
│   │   └── page.tsx                    ← Checkout page (route guard, form, place order)
│   └── orders/
│       ├── page.tsx                    ← MODIFY: add status progress stepper, "View Details" link
│       └── [id]/                       ← CREATE NEW
│           └── page.tsx                ← Order Detail page (full order info, status stepper)
│
├── components/
│   ├── checkout/                       ← CREATE NEW directory
│   │   ├── price-summary.tsx           ← Shared price summary panel
│   │   ├── delivery-form.tsx           ← Delivery info form with validation
│   │   └── payment-method-selector.tsx ← COD/MoMo/PayPal radio buttons
│   └── orders/                         ← CREATE NEW directory
│       ├── order-status-progress.tsx   ← Status stepper: Processing → In Transit → Delivered / Cancelled
│       └── order-detail-card.tsx       ← Reusable order detail layout (items + delivery + payment + price)
│
├── services/
│   └── order-service.ts                ← CREATE NEW: mock createOrder()
│
├── data/
│   └── orders.ts                       ← MODIFY: extend mock data with delivery, paymentMethod, pricing fields
│
├── types/
│   └── index.ts                        ← MODIFY: add DeliveryInfo, PaymentMethod, CreateOrderRequest; extend Order type
│
├── lib/
│   └── constants.ts                    ← MODIFY: add TAX_RATE, SHIPPING_FEE
│
└── i18n/
    └── messages/
        ├── en.json                     ← MODIFY: add "checkout" + "orderDetail" namespaces; fix cart/orders keys
        └── vi.json                     ← MODIFY: same as en.json
```

**Structure Decision**: Flat top-level routes following existing pattern. Feature-specific components grouped in `src/components/checkout/` and `src/components/orders/`. No `src/features/` directory — matches current codebase structure.

## Implementation Order

Tasks are ordered by dependency. Each task is independently deliverable.

### Task Group 1: Foundation (no UI yet)

**T1** — Add pricing constants to `src/lib/constants.ts`
- Add `TAX_RATE = 0.10` and `SHIPPING_FEE = 15000`

**T2** — Add new types to `src/types/index.ts`
- Add `DeliveryInfo`, `PaymentMethod`, `CreateOrderRequest`

**T3** — Create mock order service `src/services/order-service.ts`
- `createOrder(request: CreateOrderRequest): Promise<Order>`
- 1000ms simulated delay, mock Order response
- Throws on simulated failure for error path testing

**T4** — Add i18n keys to `en.json` and `vi.json`
- Add `checkout` namespace
- Fix missing/hardcoded keys in `cart` namespace (`orderSummary`, `shipping`, `tax`, `clearCart`)

### Task Group 2: Shared Components

**T5** — Create `src/components/checkout/price-summary.tsx`
- Props: `{ subtotal, tax, shipping, discount, total, actionLabel?, onAction?, isLoading? }`
- Renders line items; conditionally renders discount only when `discount > 0`
- Reusable on both Cart and Checkout pages

**T6** — Create `src/components/checkout/delivery-form.tsx`
- Props: `{ values, errors, onChange }`
- Fields: Full Name, Phone Number, Address
- Uses existing `<FormField>` from `src/components/ui/form-field.tsx`
- Displays inline validation errors

**T7** — Create `src/components/checkout/payment-method-selector.tsx`
- Props: `{ value, onChange }`
- Three radio options: COD (default), MoMo, PayPal
- MoMo and PayPal labeled as "Coming soon" or visually distinct but selectable

### Task Group 3: Page Updates

**T8** — Enhance `src/app/cart/page.tsx`
- Replace Coffee icon placeholder with `<Image>` using `item.image`
- Replace `PriceSummary` inline code with shared `<PriceSummary>` component
- Use TAX_RATE and SHIPPING_FEE constants
- Wire Checkout button: change `<button>` to `<Link href="/checkout">`
- Fix all hardcoded strings to use i18n keys

**T9** — Create `src/app/checkout/page.tsx`
- `"use client"` page
- Empty cart guard: `useEffect` checks `items.length === 0` → `router.replace('/cart')`
- Renders `<DeliveryForm>`, `<PaymentMethodSelector>`, `<PriceSummary>` with "Place Order" action
- Submit handler: validates form → calls `createOrder()` → on success: `clearCart()` + `router.push('/orders')` → on failure: toast error

### Task Group 4: Order History & Detail

**T10** — Extend mock order data (`src/data/orders.ts`)
- Add `delivery: DeliveryInfo`, `paymentMethod: PaymentMethod`, `subtotal`, `tax`, `shipping`, `discount` fields to each mock order
- Ensure at least one order per status (processing, in-transit, delivered, cancelled)
- Structure mirrors expected API response shape

**T11** — Create `src/components/orders/order-status-progress.tsx`
- Props: `{ status: OrderStatus }`
- 6-step linear stepper: PENDING → CONFIRMED → READY_TO_PICKUP → IN_DELIVERY → DELIVERED → REVIEWED
- Icons: Clock, CreditCard, Package, Truck, Home, Star (Lucide)
- CANCELLED: terminal state — replaces stepper row entirely with red X icon + "Đã hủy" label
- Step states: completed (filled primary + checkmark) / active (filled primary + step icon) / upcoming (outline + muted icon)
- Horizontally scrollable on small screens via `overflow-x-auto` wrapper + `min-w-[480px]` inner container

**T12** — Enhance `src/app/orders/page.tsx`
- Replace status badge with `<OrderStatusProgress>` stepper inside each card
- Add "View Details" link to `/orders/[id]` on each card
- Replace Coffee icon placeholders with actual item thumbnails in the expanded section
- Fix hardcoded strings to use i18n keys (empty state message, "Items" label)

**T13** — Create `src/app/orders/[id]/page.tsx`
- Load order from mock data by ID; show "not found" state if ID unknown
- Render `<OrderStatusProgress>` at top
- Items section: thumbnail + name + size + quantity + line price (using `<OrderDetailCard>` or inline)
- Delivery section: name, phone, address
- Payment section: method label
- Price breakdown: subtotal, tax, shipping, discount (conditional), total
- Back link to `/orders`

**T14** — Add i18n keys for Order Detail namespace
- New `orderDetail` namespace in `en.json` and `vi.json`
- Fix missing keys in existing `orders` namespace (empty state strings, "Items" label)

### Task Group 5: Verification

**T15** — Manual UI verification
- Cart happy path: add item → cart → checkout → COD → place order → orders page
- Cart error path: mock failure → toast shown → form preserved
- Empty cart guard: direct `/checkout` URL → redirect to `/cart`
- Back-navigation: checkout → back → cart contents intact
- Order History: all 4 status steppers render correctly
- Order Detail: click "View Details" → full detail page with all sections populated
- Order not found: navigate to `/orders/invalid-id` → not found state shown
- i18n: toggle locale, verify all strings translate on all pages

## Complexity Tracking

No constitution violations. No complexity justification required.

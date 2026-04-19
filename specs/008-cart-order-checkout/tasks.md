# Tasks: Cart and Order Checkout

**Input**: Design documents from `/specs/008-cart-order-checkout/`
**Branch**: `008-cart-order-checkout`
**Tests**: Not requested — no test tasks generated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project initialization needed — Next.js project already bootstrapped. This phase creates the shared foundations all user stories depend on.

- [X] T001 Add `TAX_RATE = 0.10` and `SHIPPING_FEE = 15000` constants to `src/lib/constants.ts`
- [X] T002 Extend `src/types/index.ts`: add `DeliveryInfo` interface, `PaymentMethod` type (`'COD' | 'MOMO' | 'PAYPAL'`), `CreateOrderRequest` interface, and extend the existing `Order` interface with `delivery: DeliveryInfo`, `paymentMethod: PaymentMethod`, `subtotal`, `tax`, `shipping`, `discount` number fields
- [X] T003 [P] Add `checkout` namespace keys to `src/i18n/messages/en.json` (title, deliveryTitle, fullName, fullNamePlaceholder, phoneNumber, phoneNumberPlaceholder, address, addressPlaceholder, paymentTitle, cod, momo, paypal, placeOrder, placing, shipping, discount, orderSummary, subtotal, tax, total, errorRequired, errorPhone, errorOrderFailed, backToCart) and fix missing cart namespace keys (orderSummary, shipping, tax, clearCart)
- [X] T004 [P] Mirror all changes from T003 into `src/i18n/messages/vi.json` with Vietnamese translations
- [X] T005 [P] Extend mock order data in `src/data/orders.ts`: add `delivery: DeliveryInfo`, `paymentMethod: PaymentMethod`, `subtotal`, `tax`, `shipping`, `discount` fields to each existing mock order; ensure at least one order per status (`processing`, `in-transit`, `delivered`, `cancelled`); sort orders descending by date
- [X] T006 Create `src/services/order-service.ts` exporting `createOrder(request: CreateOrderRequest): Promise<Order>` — simulates 1000ms network delay, returns a mock `Order` with generated `id`, `orderNumber` (`#ORD-XXXX`), `date`, `status: "processing"`, `items` from request, `trackingNumber: null`

**Checkpoint**: Foundation complete — all types, constants, i18n, mock data, and order service are ready. User stories can now be implemented.

---

## Phase 2: Foundational Components (Blocking Prerequisites)

**Purpose**: Shared UI components used across multiple user stories. Must be complete before cart or checkout pages are modified.

**⚠️ CRITICAL**: US1, US2, US3 all depend on `<PriceSummary>`. US4 and US5 both depend on `<OrderStatusProgress>`.

- [X] T007 Create `src/components/checkout/price-summary.tsx` — a `"use client"` component accepting props `{ subtotal: number, tax: number, shipping: number, discount: number, total: number, actionLabel?: string, onAction?: () => void, isLoading?: boolean }`. Renders a sticky card with labeled rows for each value; discount row renders only when `discount > 0`; renders an action button when `actionLabel` is provided; uses `formatVND` from `src/lib/utils` and i18n keys from the `checkout` namespace (or `cart` namespace — accept a `namespace` prop defaulting to `"checkout"`)
- [X] T008 Create `src/components/orders/order-status-progress.tsx` — a component accepting `{ status: "processing" | "in-transit" | "delivered" | "cancelled" }`. Renders a horizontal 3-step stepper (Processing → In Transit → Delivered) with: circle nodes connected by a progress line; completed steps show filled primary-color circle with a Lucide `Check` icon; active step is highlighted; upcoming steps show an outline/muted circle; each node has a Lucide illustrative icon below it (e.g. `PackageCheck` for Processing, `Truck` for In Transit, `Home` for Delivered) and a bold label; connecting line is filled primary between completed steps and muted grey for upcoming; for `cancelled` status all steps are muted and a red `X` / Cancelled label appears as a terminal indicator; on screens `≤375px` the component compresses in place (smaller nodes, tighter spacing, labels wrap) — no horizontal scroll. Use `cn` from `src/lib/utils` for conditional classes.

**Checkpoint**: Shared components ready — user story phases can proceed.

---

## Phase 3: User Story 1 — View and Manage Cart (Priority: P1) 🎯 MVP

**Goal**: Customers see product thumbnails, a complete price summary with shipping, and a working Checkout button on the Cart page.

**Independent Test**: Add an item to cart via Zustand store, navigate to `/cart`. Verify thumbnail image renders, price summary shows subtotal + tax (10%) + shipping (15,000 VND), Checkout button navigates to `/checkout`. Toggle locale (VI/EN) and verify all strings translate.

- [X] T009 [US1] Enhance `src/app/cart/page.tsx`: (1) Replace the `<div>` gradient/Coffee icon placeholder with `<Image>` from `next/image` using `item.image`, width=96, height=96, with `alt={item.name}`; (2) Replace the inline order summary block with the shared `<PriceSummary>` component (compute subtotal via `totalPrice()`, tax via `subtotal * TAX_RATE`, shipping via `SHIPPING_FEE`, discount=0, total=subtotal+tax+shipping); (3) Change the Checkout `<button>` to a `<Link href="/checkout">` using `next/link`; (4) Fix all hardcoded strings (`"Clear Cart"`, `"Browse Products"`, `"Order Summary"`, `"Estimated Tax"`, `"Total"`) to use `useTranslations("cart")` with the corrected i18n keys from T003; (5) Import `TAX_RATE` and `SHIPPING_FEE` from `src/lib/constants`

**Checkpoint**: Cart page shows thumbnails, full price summary, and wired Checkout button. US1 is independently testable.

---

## Phase 4: User Story 2 — Fill Delivery and Payment Details (Priority: P1)

**Goal**: A new `/checkout` page with delivery form, payment selection, and price summary.

**Independent Test**: With cart items in Zustand state, navigate to `/checkout`. Verify form renders with Full Name, Phone, Address fields and COD pre-selected. Submit with empty fields — verify inline errors appear. Switch to MoMo/PayPal — verify selection updates visually. Navigate to `/checkout` with empty cart — verify redirect to `/cart`.

- [X] T010 [US2] Create `src/components/checkout/delivery-form.tsx` — accepts props `{ values: DeliveryInfo, errors: Partial<Record<keyof DeliveryInfo, string>>, onChange: (field: keyof DeliveryInfo, value: string) => void }`. Renders three fields using `src/components/ui/form-field.tsx`: Full Name (type text), Phone Number (type tel), Address (type text). Displays `errors[field]` as inline error messages below each field. Uses `useTranslations("checkout")` for labels and placeholders.
- [X] T011 [US2] Create `src/components/checkout/payment-method-selector.tsx` — accepts props `{ value: PaymentMethod, onChange: (method: PaymentMethod) => void }`. Renders three radio button options: COD, MoMo, PayPal. Each option has a label (from `useTranslations("checkout")`). COD is the default. Uses native `<input type="radio">` styled with Tailwind.
- [X] T012 [US2] Create `src/app/checkout/page.tsx` as a `"use client"` page: (1) Empty cart guard — `useEffect` that calls `router.replace('/cart')` when `items.length === 0` (read from `useCartStore`); (2) Local state: `deliveryInfo: DeliveryInfo` (fullName, phoneNumber, address all empty string), `paymentMethod: PaymentMethod` defaulting to `'COD'`, `errors: Partial<Record<keyof DeliveryInfo, string>>`; (3) Layout: two-column on desktop (lg:grid-cols-3) — left column (lg:col-span-2) contains page title, `<DeliveryForm>`, `<PaymentMethodSelector>`; right column contains `<PriceSummary>` with `actionLabel="checkout.placeOrder"` and `isLoading` state; (4) Validation function: checks fullName non-empty, phoneNumber matches `/^(03|05|07|08|09)\d{8}$/`, address non-empty — sets `errors` state and returns false if any fail; (5) Submit handler (implemented in US3 / T013 — leave as a no-op stub `handleSubmit` for now)

**Checkpoint**: Checkout page renders with form, payment selector, and price summary. Empty cart guard works. Form validates on submit attempt. US2 is independently testable.

---

## Phase 5: User Story 3 — Place Order and Confirm (Priority: P2)

**Goal**: Clicking "Place Order" calls the mock order service, shows loading state, redirects to `/orders` on success, and shows a toast on failure.

**Independent Test**: Fill all delivery fields with valid data, select COD, click "Place Order". Verify button disables with loading state, then redirects to `/orders` and cart is cleared. Temporarily set mock service to fail — verify toast appears, button re-enables, form data is preserved.

- [X] T013 [US3] Implement `handleSubmit` in `src/app/checkout/page.tsx`: (1) Add `isLoading: boolean` state; (2) On submit: run validation (from T012) — return early if invalid; set `isLoading = true`; call `createOrder({ items, delivery: deliveryInfo, paymentMethod, subtotal, tax, shipping, discount: 0, total })` from `src/services/order-service`; on success: call `clearCart()` from `useCartStore` then `router.push('/orders')`; on failure: show toast using the existing toast mechanism from `src/components/ui/toast.tsx` with the error message from `useTranslations("checkout")("errorOrderFailed")`; set `isLoading = false`; (3) Pass `isLoading` to `<PriceSummary>` so the action button shows a spinner/disabled state; (4) Ensure the button is disabled while `isLoading` is true to prevent double-submission

**Checkpoint**: Full checkout flow works end-to-end with mock data. US3 is independently testable.

---

## Phase 6: User Story 4 — Browse Order History with Status Progress (Priority: P2)

**Goal**: Order History page shows all past orders sorted by most recent first, each with an always-visible status progress stepper and a "View Details" link.

**Independent Test**: Navigate to `/orders`. Verify orders sorted most recent first. Verify each card shows the stepper (not just on expand). Verify stepper correctly renders all 4 status variants (processing/in-transit/delivered/cancelled). Click "View Details" — verify navigation to `/orders/[id]`. Expand a card — verify accordion still works and shows item thumbnails.

- [X] T014 [P] [US4] Add `orderDetail` namespace keys to `src/i18n/messages/en.json` (title, backToOrders, orderNumber, orderDate, deliveryInfo, paymentMethod, items, notFound, notFoundHint, cod, momo, paypal, tracking, statusProcessing, statusInTransit, statusDelivered, statusCancelled) and fix remaining hardcoded strings in the `orders` namespace (empty state text, "Items" label, "No orders yet" message)
- [X] T015 [P] [US4] Mirror all T014 changes into `src/i18n/messages/vi.json`
- [X] T016 [US4] Enhance `src/app/orders/page.tsx`: (1) Sort orders descending by date before rendering: `[...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())`; (2) Add `<OrderStatusProgress status={order.status} />` to each card, positioned below the header row and above the accordion expand area (always visible, not hidden behind accordion); (3) Add a `<Link href={`/orders/${order.id}`}>` "View Details" button to the card header row alongside the existing chevron toggle — use `e.stopPropagation()` so the link click doesn't toggle the accordion; (4) In the expanded accordion items list, replace the Coffee icon `<div>` placeholder with `<Image>` from `next/image` using `item.image`, width=56, height=56; (5) Fix all hardcoded strings to use `useTranslations("orders")` keys

**Checkpoint**: Order History shows stepper on every card without expanding, "View Details" navigates to detail page, items show real thumbnails. US4 is independently testable.

---

## Phase 7: User Story 5 — View Full Order Detail (Priority: P2)

**Goal**: Dedicated `/orders/[id]` page showing the complete order: status stepper, items with thumbnails, delivery info, payment method, price breakdown.

**Independent Test**: Navigate to `/orders/[valid-mock-id]` — verify all sections render (stepper, items with thumbnails, delivery info, payment, price breakdown with correct totals). Navigate to `/orders/invalid-id` — verify "not found" state with link back to `/orders`. Verify i18n strings translate on locale switch.

- [X] T017 [US5] Create `src/app/orders/[id]/page.tsx` as a `"use client"` page: (1) Read `params.id` and find the matching order: `orders.find(o => o.id === params.id)`; (2) If not found, render a "not found" state (Package icon, not-found heading, hint text, link back to `/orders`) using `useTranslations("orderDetail")` keys; (3) If found, render: (a) Back link to `/orders` at the top; (b) Page title with `order.orderNumber` highlighted; (c) `<OrderStatusProgress status={order.status} />` prominently below the title; (d) Items section — each item as a row with `<Image>` thumbnail (width=64, height=64), name, size, quantity, and `formatVND(item.price * item.quantity)`; (e) Delivery section — full name, phone number, delivery address from `order.delivery`; (f) Payment section — label for `order.paymentMethod` using i18n keys (cod/momo/paypal); (g) Price breakdown card — subtotal, tax, shipping, discount (render only when `order.discount > 0`), total using `formatVND`; all using `useTranslations("orderDetail")` keys; (4) Use a two-column layout on desktop (main content left, price summary right) matching the checkout page layout

**Checkpoint**: Order Detail page fully populates from mock data for all statuses, not-found state works. US5 is independently testable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all pages and components.

- [X] T018 [P] Run `pnpm lint` and fix any ESLint errors introduced across all modified and created files
- [X] T019 [P] Audit all new and modified files for remaining hardcoded strings not covered by i18n keys — move any found to `en.json` / `vi.json` and replace with `useTranslations()` calls
- [X] T020 Manual UI verification — run through all scenarios in `specs/008-cart-order-checkout/quickstart.md`: cart happy path, cart error path, empty cart guard, back-navigation cart retention, all 4 order status stepper variants, order detail full render, order not-found state, locale switch on all new pages

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. T003, T004, T005, T006 can all run in parallel after T001 and T002 complete.
- **Phase 2 (Foundational Components)**: Depends on Phase 1 (T001–T002 for types/constants, T003–T004 for i18n). T007 and T008 can run in parallel.
- **Phase 3 (US1)**: Depends on T007 (`<PriceSummary>`). T009 can start as soon as T007 is done.
- **Phase 4 (US2)**: Depends on T007 (`<PriceSummary>`) and T006 (order-service types). T010 and T011 can run in parallel; T012 depends on T010 and T011.
- **Phase 5 (US3)**: Depends on T012 (checkout page stub from US2) and T006 (order service).
- **Phase 6 (US4)**: Depends on T008 (`<OrderStatusProgress>`) and T005 (extended mock data). T014 and T015 can run in parallel with T016.
- **Phase 7 (US5)**: Depends on T008 (`<OrderStatusProgress>`) and T005 (extended mock data). Can run in parallel with US4 (different files).
- **Phase 8 (Polish)**: Depends on all user story phases complete.

### User Story Dependencies

- **US1 (P1)**: Requires T001, T002, T003–T004 (i18n), T007 (PriceSummary)
- **US2 (P1)**: Requires T001, T002, T003–T004 (i18n), T006 (order-service types), T007 (PriceSummary)
- **US3 (P2)**: Requires US2 complete (T012), T006 (order-service implementation)
- **US4 (P2)**: Requires T001–T002 (types), T005 (extended mock data), T008 (OrderStatusProgress), T014–T015 (i18n)
- **US5 (P2)**: Requires T001–T002 (types), T005 (extended mock data), T008 (OrderStatusProgress), T014–T015 (i18n)
- **US4 and US5** can be implemented in parallel (completely different files)

### Parallel Opportunities

```bash
# Phase 1 parallel group (after T001, T002):
T003  # en.json updates
T004  # vi.json updates
T005  # extend mock data
T006  # order service

# Phase 2 parallel group (after T001-T004):
T007  # PriceSummary component
T008  # OrderStatusProgress component

# Phase 4 parallel group:
T010  # DeliveryForm component
T011  # PaymentMethodSelector component

# Phase 6 parallel group:
T014  # orderDetail i18n en.json
T015  # orderDetail i18n vi.json
# T016 (orders page) can start once T008 and T014 are done

# US4 and US5 fully parallel (different page files):
T016  # orders list page enhancement
T017  # orders/[id] detail page creation
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1 (T001–T006)
2. Complete Phase 2 (T007–T008)
3. Complete Phase 3/US1 (T009) — Cart page enhanced
4. **STOP and VALIDATE**: Cart thumbnails, price summary, Checkout button work
5. Complete Phase 4/US2 (T010–T012) — Checkout page with form
6. **STOP and VALIDATE**: Delivery form, payment selection, empty cart guard work

### Incremental Delivery

1. Setup + Foundational (T001–T008) → Shared foundation ready
2. US1 (T009) → Enhanced cart — demo-able ✓
3. US2 (T010–T012) → Checkout form — demo-able ✓
4. US3 (T013) → Full order placement flow — demo-able ✓
5. US4 (T014–T016) → Order history with stepper — demo-able ✓
6. US5 (T017) → Order detail page — demo-able ✓
7. Polish (T018–T020) → Production-ready ✓

---

## Notes

- No tests generated (not requested in spec)
- [P] tasks operate on different files — safe to run concurrently
- Each user story phase produces a independently navigable and testable UI increment
- `formatVND` utility is already available at `src/lib/utils`
- `useCartStore` is already available at `src/stores/cart-store`
- Existing `src/components/ui/form-field.tsx`, `button.tsx`, `toast.tsx` are used as-is — no new UI primitives introduced
- Tax rate in existing cart page (8%) is corrected to 10% via `TAX_RATE` constant in T009
- Mock order service (T006) is structured to be drop-in replaced with a real `fetch()` call in the next phase

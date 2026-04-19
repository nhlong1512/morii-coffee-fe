# Research: Cart and Order Checkout

**Feature**: `008-cart-order-checkout`
**Date**: 2026-04-19

## Decision 1: Cart Item Thumbnail Display

**Decision**: Replace the Coffee icon gradient placeholder in `src/app/cart/page.tsx` with `next/image` using `item.image` from the existing `CartItem` store shape.

**Rationale**: The `CartItem` type already carries an `image: string` field. Using `next/image` with `fill` or fixed dimensions (e.g., 96×96) is the idiomatic pattern in this Next.js 16 codebase (see `src/components/ui/product-image.tsx`).

**Alternatives considered**: Keep the placeholder until real assets are available — rejected because the `image` field is already populated by the store and spec explicitly requires thumbnails.

---

## Decision 2: Checkout Route Location

**Decision**: Create the checkout page at `src/app/checkout/page.tsx`.

**Rationale**: Matches the flat, top-level routing convention used throughout the app (`/cart`, `/orders`, `/profile`, `/wishlist`). Keeping it as `/checkout` is semantically clear and maps cleanly to the URL the user expects.

**Alternatives considered**: `/cart/checkout` (nested) — rejected because it implies cart is a section hub, which it isn't; `/order-details` — rejected as less intuitive.

---

## Decision 3: Tax Rate Standardization

**Decision**: Update the tax rate from 8% (current cart page) to 10% as specified in the feature spec, and extract it as a named constant (`TAX_RATE = 0.10`).

**Rationale**: The spec explicitly documents 10% as the mock rate. Using a named constant makes future business-driven changes trivial. The discrepancy in the existing code is an oversight from an earlier implementation.

**Alternatives considered**: Keep 8% — rejected because spec and feature description must be authoritative; defer to business — deferred, but 10% is the agreed mock value for this phase.

---

## Decision 4: Shipping Fee

**Decision**: Add a flat 15,000 VND shipping fee (`SHIPPING_FEE = 15000`) shown as a separate line in the price summary on both Cart and Checkout pages.

**Rationale**: The spec defines a fixed flat fee as the mock value. Delivery zone logic is explicitly out of scope. A named constant keeps it easy to update later.

**Alternatives considered**: No shipping line until zone logic is ready — rejected because FR-002 requires the line to appear; variable fee — out of scope for this phase.

---

## Decision 5: Discount / Promotion Line

**Decision**: Show the discount line in the price summary only when a non-zero discount is present. For this phase, discount is always 0 (no coupon mechanism exists). The line is conditionally rendered to avoid cluttering the summary with a zero row.

**Rationale**: FR-002 says discount appears "when applicable." The spec's Suggested Improvements section explicitly defers the coupon entry mechanism. Conditional rendering avoids showing a pointless 0 VND discount row.

**Alternatives considered**: Always show discount row with 0 — rejected as UI noise; implement coupon input now — deferred per spec scope.

---

## Decision 6: Shared PriceSummary Component

**Decision**: Extract a `<PriceSummary>` component at `src/components/checkout/price-summary.tsx`, shared by both the Cart page and the Checkout page.

**Rationale**: Both pages display the exact same price breakdown panel. Extracting it prevents duplication and ensures the Cart and Checkout panels are always in sync. This is a straightforward, justified extraction — not premature abstraction.

**Alternatives considered**: Inline the summary in both pages — rejected because two diverging copies would be a maintenance hazard; put it in `src/components/ui/` — rejected because it is feature-specific, not a general UI primitive.

---

## Decision 7: Order Service (Mock)

**Decision**: Create `src/services/order-service.ts` with a `createOrder(payload: CreateOrderRequest): Promise<Order>` function that simulates a 1-second network delay and returns a mock successful Order, consistent with the existing service pattern.

**Rationale**: The spec scopes this phase to UI only with mock data. All other services (`products-service.ts`, `auth-service.ts`) follow the same async/await pattern with the project's API base URL. The mock makes it trivially swappable for the real API endpoint later.

**Alternatives considered**: Inline the mock fetch inside the component — rejected because it couples UI to data layer; use MSW (Mock Service Worker) — overkill for this phase.

---

## Decision 8: Form Validation Approach

**Decision**: Use React `useState` for delivery form state and validate on submit only (per FR-011). Inline error messages appear below each field using the existing `<FormField>` component from `src/components/ui/form-field.tsx`, which already supports error display.

**Rationale**: The existing `<FormField>` component handles label, input, and error display. Using it avoids introducing a form library (React Hook Form, Zod) for a 3-field form — YAGNI. On-submit validation matches FR-011 without adding blur-event complexity (real-time validation is in the Suggested Improvements as a future enhancement).

**Alternatives considered**: React Hook Form + Zod — rejected as overkill for 3 fields in UI-only scope; blur-time validation — deferred per spec (Suggested Improvements, not in-scope requirements).

---

## Decision 9: Toast for Order Errors

**Decision**: Use the existing `toast.tsx` component from `src/components/ui/toast.tsx` for displaying order submission errors (FR-014).

**Rationale**: Toast is already in the design system and confirmed in clarification Q4. No new dependency required.

**Alternatives considered**: Custom inline error — rejected per clarification session answer.

---

## Decision 10: Empty Cart Guard on Checkout Route

**Decision**: Implement the empty cart guard inside the Checkout page component using `useEffect` + `router.replace('/cart')`. This is a client-side redirect because the cart state lives in localStorage (Zustand persist) and cannot be read server-side without SSR changes.

**Rationale**: The Zustand store uses `persist` middleware with `localStorage`, which is client-only. A server-side redirect via Next.js middleware would have no access to this state. A client-side `useEffect` guard is the correct pattern for localStorage-backed auth/state guards in this codebase (see `auth-store.ts` pattern).

**Alternatives considered**: Middleware-based redirect — rejected because cart state is client-only; disable the Checkout button on empty cart — already done via FR-005 (button only appears when cart has items), but direct URL access still needs the guard.

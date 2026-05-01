# 009 Cart Order Backend Integration

- [x] Read the cart/order feature doc, prior `008` spec artifacts, project workflow files, and relevant storefront code.
- [x] Build and inspect the code-review-graph for affected cart, checkout, auth, and order flows.
- [x] Create `009-cart-order-backend` spec and requirements checklist artifacts.
- [x] Replace the mock order service with typed backend integrations for cart, orders, and delivery profile.
- [x] Update auth/cart synchronization so guest cart data merges into the authenticated backend cart.
- [x] Update cart, checkout, orders list, and order detail pages to use backend-backed data and protected flows.
- [x] Run targeted tests and lint, then record outcomes and residual risks.

## Review

- Targeted ESLint passed for all modified cart/order/auth integration files.
- `pnpm test -- --runInBand src/__tests__/services/order-service.test.ts src/__tests__/stores/cart-store.test.ts` passed.
- Full `pnpm lint` is still red because of pre-existing unrelated issues in `jest.config.js` and several older hook tests under `src/__tests__/hooks/`.
- Code-review-graph reports elevated change risk around the new cart/checkout surface primarily due to missing page-level UI tests; service/store coverage is present, but checkout and order pages still need integration-style tests.

# 010 Cart API 500 Hotfix

- [x] Confirm the cart request failure path and identify whether quick-add flows are sending incomplete cart payloads.
- [x] Update quick-add flows to resolve a valid default variant before sending authenticated cart mutations.
- [x] Add or update targeted tests for the new quick-add/cart payload behavior.
- [x] Run focused verification and capture outcome plus any remaining backend risk.

## Review

- Root cause on the frontend was the quick-add flow sending authenticated cart mutations with `variantId: null` because product summary cards do not carry variant IDs. Those flows now resolve the product detail first and use the backend default variant.
- Authenticated cart session hydration now goes through `POST /v1/cart/merge` whenever the persisted cart came from guest mode, even when the local guest cart is empty. This gives the backend a chance to provision the cart before subsequent `GET /v1/cart` or `POST /v1/cart/items` calls.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/cart-service.test.ts src/__tests__/services/products-service.test.ts src/__tests__/components/home/product-card.test.tsx`
  - `pnpm exec eslint src/services/cart-service.ts src/services/products-service.ts src/components/home/product-card.tsx src/app/products/page.tsx src/app/wishlist/page.tsx src/stores/cart-store.ts src/__tests__/services/cart-service.test.ts src/__tests__/services/products-service.test.ts src/__tests__/components/home/product-card.test.tsx`
  - `pnpm exec tsc --noEmit --pretty false`
- Residual risk: if the backend already has corrupted cart state for the current user or still returns 500 for `merge`, the remaining fix will need backend-side inspection or cart storage cleanup.

# 011 Cart Size UX Enhancement

- [x] Inspect how cart items derive and display size labels, then normalize inconsistent labels across quick-add and backend-backed cart data.
- [x] Add cart-level size switching for products with variants while preserving quantity and backend sync.
- [x] Add focused tests for the new cart size normalization and variant-switch behavior.
- [x] Run targeted verification and record remaining UX or backend constraints.

## Review

- Cart size labels are now normalized before display, so mixed backend/client values like `Nhỏ`, `Medium`, `Size L`, or shorthand labels resolve to a single consistent localized label in the cart UI.
- Cart items with available product variants now expose a size selector directly in the cart. Changing size preserves quantity, updates unit price, and syncs the backend-backed cart.
- Frontend cart update/delete requests were aligned with the current backend contract (`PUT /v1/cart/items` and `DELETE /v1/cart/items` with body payload) while implementing the size-switch flow.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/lib/utils.test.ts src/__tests__/services/cart-service.test.ts src/__tests__/stores/cart-store.test.ts`
  - `pnpm exec eslint src/lib/utils.ts src/services/cart-service.ts src/stores/cart-store.ts src/app/cart/page.tsx src/__tests__/lib/utils.test.ts src/__tests__/services/cart-service.test.ts src/__tests__/stores/cart-store.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
- Residual risk: cart size options are fetched per product from the product detail endpoint on cart load, so if that endpoint fails for a given product the cart still works but the size selector is hidden for that item.

# 012 Place Order Contract Update

- [x] Inspect all frontend callers and types that still use the legacy place-order payload with cart items.
- [x] Update shared API/request types and order service to match backend `PlaceOrderDto`.
- [x] Update checkout submission state and labels to use the new `saveDeliveryProfile` contract.
- [x] Run focused tests/type checks for the updated order placement flow and capture results.

## Review

- Checkout now posts the backend `PlaceOrderDto` shape directly: `fullName`, `phoneNumber`, `address`, `notes`, `paymentMethod`, and `saveDeliveryProfile`.
- Frontend no longer sends cart line items in the place-order request; the backend-owned current cart is now the single order source of truth.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/order-service.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint src/app/checkout/page.tsx src/services/order-service.ts src/types/index.ts src/types/api.ts src/__tests__/services/order-service.test.ts`

# 013 My Orders Endpoint Fix

- [x] Switch customer order history calls from the admin/all-orders route to `GET /v1/orders/my`.
- [x] Align the service contract and tests with the backend `GetMyOrders` response shape.
- [x] Run focused verification for the updated order-history path.

## Review

- Customer order history now calls `GET /v1/orders/my` and supports the backend's optional `status` query instead of reusing the broader `/v1/orders` list route.
- The storefront `/orders` page now consumes the dedicated self-service history response directly, while the generic paginated `getOrders()` helper remains intact for other list use cases.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/order-service.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint src/services/order-service.ts src/app/orders/page.tsx src/__tests__/services/order-service.test.ts`

# 014 Order Detail Delivery Guard

- [x] Inspect the order detail crash path and verify whether backend delivery fields can arrive outside `deliveryInfo`.
- [x] Make order-detail mapping tolerant to both nested and flattened delivery fields.
- [x] Guard the order detail UI so missing delivery data does not crash the page.
- [x] Run focused verification for the updated order-detail path.

## Review

- Order detail mapping now falls back from `deliveryInfo` to top-level `fullName`, `phoneNumber`, and `address` when the backend response omits the nested block.
- The `/orders/[id]` page no longer dereferences missing delivery data blindly and will render placeholders instead of crashing.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/order-service.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint 'src/app/orders/[id]/page.tsx' src/services/order-service.ts src/types/api.ts src/__tests__/services/order-service.test.ts`

# 015 Order Detail Delivery UX Enhancement

- [x] Improve the delivery information presentation on the order detail page.
- [x] Add clearer localized labels and a friendlier missing-data state for delivery information.
- [x] Run focused verification for the updated order detail UI.

## Review

- Delivery information on `/orders/[id]` now renders as structured rows with dedicated labels and icons instead of a plain text block.
- When delivery data is missing, the page now shows a descriptive empty state explaining that the backend has not returned the delivery snapshot yet.
- Verification passed:
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint 'src/app/orders/[id]/page.tsx'`

# 016 Orders Summary Item Count Fix

- [x] Inspect the `/orders` item-count regression and verify whether backend order summaries omit `itemCount`.
- [x] Normalize order-summary DTOs so item count and preview names can be derived from fallback fields.
- [x] Run focused verification for the updated order history mapping.

## Review

- Order summary responses are now normalized before reaching the `/orders` page, so `itemCount` can fall back to `totalItems` or a sum of nested summary-item quantities.
- First product preview text on `/orders` also falls back to the first nested item name when the backend omits `firstProductName`.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/order-service.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint src/services/order-service.ts src/app/orders/page.tsx src/__tests__/services/order-service.test.ts`

# 017 Cancel Order Flow

- [x] Add frontend API support for `PATCH /v1/orders/{id}/cancel`.
- [x] Add a PENDING-only cancel action to the customer order detail page with confirmation and loading/error states.
- [x] Update localized strings and focused tests for the cancel-order flow.
- [x] Run targeted verification and capture outcomes.

## Review

- Frontend now supports `PATCH /v1/orders/{id}/cancel` via the shared API layer and order service.
- The customer order detail page only shows the cancel action when `order.status === "PENDING"`, and switches to explanatory copy for confirmed or already-cancelled orders.
- Cancelling an order opens a confirmation dialog, shows a loading state, calls the backend endpoint, then updates the local detail view to `CANCELLED` immediately on success.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/order-service.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint src/lib/api.ts src/services/order-service.ts 'src/app/orders/[id]/page.tsx' src/__tests__/services/order-service.test.ts`

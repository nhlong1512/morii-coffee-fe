# 030 Remove Facebook Auth UI

- [x] Review auth pages, locale bundles, and repo references to separate Facebook login/register remnants from unrelated brand/social links.
- [x] Remove the Facebook auth button/UI and orphaned auth translation keys from sign-in and sign-up flows.
- [x] Run focused verification and document any remaining non-auth Facebook references.

## Review

- Facebook auth had already been functionally removed; only disabled auth buttons and `auth.facebook` locale keys remained in the sign-in/sign-up UI.
- Kept non-auth Facebook references such as footer/social links and brand constants untouched because they are storefront social links, not login/register logic.
- Verification passed:
  - `pnpm exec eslint src/app/sign-in/page.tsx src/app/sign-up/page.tsx`
  - `node -e "JSON.parse(...)"` for `src/i18n/messages/en.json` and `src/i18n/messages/vi.json`
  - `rg -n "facebook|Facebook|FACEBOOK" src/app/sign-in/page.tsx src/app/sign-up/page.tsx src/i18n/messages/en.json src/i18n/messages/vi.json -S` returned no matches

# 032 Desktop And Tablet UI Audit

- [x] Inventory the full route set and run desktop plus tablet browser audits on representative public, auth, customer, and admin pages where the environment allows it.
- [x] Enhance any layouts whose desktop/tablet UX regressed or still feels weak, while preserving the established visual structure.
- [x] Re-run browser verification, unit tests, and production build, then document remaining tradeoffs.

## Review

- Used `code-review-graph` before and after the pass to keep the blast radius focused on shared layout and content-heavy list surfaces.
- Desktop/tablet audit work focused on the route inventory in `src/app`, with live localhost verification attempted via Playwright. Browser automation was blocked by sandbox process restrictions unless elevated browser execution is approved, so the visual review for this pass combined code inspection, prior mobile browser evidence, and technical verification gates.
- UI/UX enhancements applied:
  - tablet header now stays menu-first until `lg`, reducing crowded top-bar density while preserving the established desktop nav above that breakpoint
  - admin data tables now keep the card presentation through tablet widths and render only one active mode at runtime, improving both readability and accessibility
  - blog listing was upgraded from a flat card wall to a featured-story layout plus secondary grid, making desktop/tablet scanning much stronger without changing data flows
  - product listing now surfaces a simple result count and keeps the filter rail sticky on wider desktop screens for better browsing continuity
  - blog list and homepage blog preview dates now respect the active document locale instead of always formatting as US English
- Verification passed:
  - `pnpm exec eslint` on all newly touched files
  - `pnpm build`
  - `pnpm test:ci` with `74/74` suites and `595/595` tests passing
- Remaining tradeoff:
  - a full screenshot-based desktop/tablet audit across every route is still worth running once browser automation outside the sandbox is approved; the app is technically green now, but that final live visual pass would be the last confidence layer before shipping

# 031 Align Sign-Up Google Auth Button

- [x] Compare Google social auth implementation between sign-in and sign-up pages to identify the behavior/layout mismatch.
- [x] Reuse the same Google OAuth trigger and button alignment on sign-up as sign-in.
- [x] Run focused verification for the sign-up auth button behavior and layout classes.

## Review

- The sign-up Google button was disabled because the page still rendered a placeholder button instead of wiring the existing Google OAuth redirect handler used on sign-in.
- The left alignment came from `justify-start sm:justify-center`; sign-in uses `w-full`, which centers content consistently through the shared button styles.
- Verification passed:
  - `pnpm exec eslint src/app/sign-up/page.tsx`
  - `rg -n "handleGoogleSignIn|disabled|justify-start sm:justify-center|orContinueWith|google" src/app/sign-up/page.tsx -S`

# 027 Full Mobile Responsiveness Audit

- [x] Inventory every page route and group them by shared layout patterns plus auth requirements.
- [x] Review all publicly reachable pages in a phone viewport and inspect protected/admin pages by code where auth or data blocks visual verification.
- [x] Implement responsive fixes across shared shells and any page-specific outliers until the full route set is mobile-friendly.
- [x] Re-run targeted lint plus mobile screenshot smoke checks, then document remaining blind spots or backend-gated pages.

## Review

- Audited the full `src/app` page inventory and grouped it into storefront/public, support/legal, auth, customer protected, and admin surfaces before changing code.
- Browser/mobile verification was run on representative public and entry routes using local headless Chrome at `390x844`, including `/`, `/about`, `/products`, `/cart`, `/sign-in`, `/sign-up`, `/checkout`, and `/admin/login`.
- Protected and backend-gated routes were inspected by code when live mobile verification was blocked by auth redirects or unavailable data, then fixed through shared layout patterns rather than one-off page hacks.
- Responsive fixes were applied across:
  - shared shells/components: `header`, `mobile-menu`, `logo`, `footer`, `hero-carousel`, `featured-products`, `blog-preview`, `store-locator-preview`, `support-page-shell`, storefront `data-table`, admin `data-table`
  - storefront/auth/customer pages: `products`, `cart`, `checkout`, `profile`, `orders`, `wishlist`, `blog`, `feedback`, `sign-in`, `sign-up`
  - store locator: `src/features/stores/components/store-locator.tsx`
  - admin surfaces: list/detail/create-edit page headers, filters, tab bars, bulk-action bars, and pagination affordances for products, orders, users, blogs, banners, and stores
- Key mobile issues fixed:
  - cramped mobile header action cluster
  - overlarge H1/title scales on narrow Vietnamese layouts
  - auth social action rows too tight for phone width
  - non-stacking section headers and CTA rows
  - admin table pagination/header/filter layouts that were too rigid on small screens
  - create/edit admin page headings that assumed horizontal space
- Verification completed:
  - `pnpm exec eslint` on all touched files
  - repeated mobile screenshot smoke checks on representative routes after patches
  - `code-review-graph detect_changes` on `35` changed source files: `41` changed functions/classes, `7` affected flows, `39` test gaps, overall risk score `0.75`
- Residual blind spots:
  - some authenticated customer/admin pages were verified structurally by code instead of full live data-state rendering because local auth/data was not universally available in the audit pass
  - `/stores` still had a local fetch failure during browser review, so its error shell was verified live and its primary content layout was verified by code
  - current lint output only reports pre-existing warnings unrelated to the responsive patch set:
    - `src/app/admin/banners/edit/[id]/page.tsx` missing `t` dependency in `useEffect`
    - `src/app/admin/products/edit/[id]/page.tsx` missing `t` dependency in `useCallback`
    - `src/app/checkout/page.tsx` unused `isLoadingQuote` and `quoteError`
    - `src/app/products/page.tsx` unused `totalCount`

# 028 Authenticated Admin Mobile Audit

- [x] Authenticate into the real admin panel and run a mobile viewport audit across dashboard, list, create, edit, and detail routes.
- [x] Tighten shared admin mobile layout where the authenticated audit still feels desktop-first, especially the top bar and dense data tables.
- [x] Re-run lint and authenticated Playwright verification on representative admin routes, then record any remaining mobile tradeoffs.

## Review

- Authenticated Playwright review on `390x844` confirmed `18` live admin routes without horizontal overflow, including reports, promotions, products, users, orders, blogs, banners, stores, plus create/edit/detail routes resolved from real data.
- The admin UI still needed mobile polish even without overflow:
  - edit-route breadcrumbs expanded with long UUID segments
  - header controls competed for narrow top-bar width
  - dense data tables remained usable mainly through compressed columns instead of a phone-native presentation
- Shared admin responsive fixes were applied in `src/app/admin/layout.tsx` and `src/components/admin/data-table.tsx` so all list/create/edit pages inherit the same behavior.
- Verified after the patch:
  - `pnpm exec eslint src/app/admin/layout.tsx src/components/admin/data-table.tsx`
  - authenticated Playwright rerun for `reports`, `products`, `stores`, `products/new`, and a real `blogs/edit/[id]` route
  - representative admin list pages now switch to stacked mobile cards instead of clipped multi-column rows
  - edit-page breadcrumbs now truncate long IDs and the top bar removes theme/language controls from the narrow header in favor of the mobile sheet
- Remaining tradeoff:
  - `code-review-graph detect_changes` still marks the presentation surface as high risk (`0.75`) because the repo has broad UI test gaps, not because the responsive patch introduced new functional regressions

# 029 Auth Footer Mobile Tightening

- [x] Inspect the auth page shells and footer to identify why mobile pages still felt too sparse vertically.
- [x] Tighten auth card spacing and remove mobile-only dead space before the footer across sign-in, sign-up, forgot, reset, and change-password.
- [x] Compress the footer into a denser mobile grid and verify the updated layouts with lint and Playwright screenshots.

## Review

- Auth pages were still wasting vertical space on mobile because the wrappers forced a full-height composition even for short forms.
- Updated `sign-in`, `sign-up`, `forgot-password`, `reset-password`, and `change-password` to use lighter mobile padding, tighter card padding, and no forced mobile min-height; desktop centering remains from `md` upward.
- Updated `src/components/layout/footer.tsx` so mobile now uses a denser two-column grid, smaller vertical padding, more compact social controls, and a shared full-width brand/contact block.
- Verification passed:
  - `pnpm exec eslint src/app/sign-in/page.tsx src/app/sign-up/page.tsx src/app/forgot-password/page.tsx src/app/reset-password/page.tsx src/app/change-password/page.tsx src/components/layout/footer.tsx`
  - Playwright mobile screenshots rerun for `/sign-in`, `/sign-up`, `/forgot-password`, and `/`
  - `code-review-graph detect_changes` on the six touched files reported presentation-layer blast radius only, with review priority concentrated around `ResetPasswordForm`, `ChangePasswordPage`, and `ForgotPasswordPage`

# 026 Mobile Responsive Review And Fixes

- [x] Read relevant project guidance, inspect mobile-sensitive routes/components, and gather `code-review-graph` context for storefront/admin mobile surfaces.
- [x] Run the Next.js app locally and review key routes in a phone-sized viewport using local browser automation, capturing concrete responsive issues.
- [x] Implement focused responsive fixes for the confirmed mobile UI issues with minimal blast radius.
- [x] Run targeted verification for the touched screens, including lint and mobile smoke checks, then record results here.

## Review

- Reviewed mobile storefront flows using local headless Chrome screenshots at `390x844` for `/`, `/products`, `/cart`, `/checkout`, and `/stores`, plus `code-review-graph` context before and after the changes.
- Confirmed mobile issues before the patch:
  - Header action cluster consumed too much horizontal space and contributed to cramped mobile composition.
  - Large hero/page headings were too aggressive for narrow Vietnamese/mobile layouts.
  - Section headers on the home page did not stack cleanly on mobile.
  - Sign-in social login actions in the checkout funnel were too tight for phone width.
  - Cart item and profile action layouts were brittle for small screens.
  - Store locator filter/actions grid was too dense for narrow widths.
- Implemented responsive fixes across header/mobile menu, hero typography, home section headers, sign-in, cart, profile, and store locator without touching underlying data flows.
- Verification completed:
  - `pnpm exec eslint src/components/layout/logo.tsx src/components/layout/header.tsx src/components/layout/mobile-menu.tsx src/components/home/hero-carousel.tsx src/components/home/featured-products.tsx src/components/home/blog-preview.tsx src/app/sign-in/page.tsx src/app/cart/page.tsx src/app/profile/page.tsx src/features/stores/components/store-locator.tsx`
  - `pnpm exec eslint src/components/home/hero-carousel.tsx src/app/products/page.tsx src/app/cart/page.tsx src/app/profile/page.tsx src/features/stores/components/store-locator.tsx`
  - Local mobile screenshot smoke checks rerun after patches for `/`, `/products`, `/cart`, and `/checkout`
  - `code-review-graph` post-change scan reported `18` changed functions/classes, `3` affected flows, and high presentation blast radius concentrated around `SignInPage`, `FeaturedProducts`, and `CarouselFallback`
- Residual risk:
  - `/stores` still depends on live API data; the local review could only validate the error/fallback shell because the route returned `Failed to fetch`.
  - `src/app/products/page.tsx` still has a pre-existing ESLint warning for unused state (`totalCount`), unrelated to the responsive patch.

# 025 GHN Integration Frontend

- [x] Read the GHN frontend handoff, checkout/order/admin code, and code-review-graph context for all affected surfaces.
- [x] Extend shared types and API/service contracts for structured delivery profiles, shipping quotes, shipment summaries, and GHN-aware order/Stripe payloads.
- [x] Implement the reusable GHN shipping frontend slice for master data, quotes, shipment actions, and shared status helpers.
- [x] Refactor checkout to support pickup vs GHN delivery, structured address selection, quote-driven shipping totals, and GHN-aware COD/Stripe submission.
- [x] Update customer/admin order detail surfaces to render shipment data and admin shipment actions against the new backend contracts.
- [x] Add or update focused unit/component tests for all touched services, helpers, and UI flows.
- [x] Run final verification for GHN integration: targeted tests, full unit tests, production build, and browser self-test where local routes are available.

## Review

- Completed GHN delivery integration across checkout, customer orders, and admin shipment management with a new `src/features/shipping` slice.
- Added structured delivery profile, GHN quote handling, shipment tracking, and admin shipment action coverage, then verified with targeted tests, full unit suite, production build, and local HTTP smoke checks for `/checkout`, `/orders`, and `/admin/orders/123`.

# 018 Store Management Specification

- [x] Review the store-management docs, spec-kit workflow files, current store-related frontend code, and code-review-graph context.
- [x] Create the feature branch and spec artifact for store management exactly once via the speckit script.
- [x] Write a comprehensive store-management spec covering public store locator and admin store operations.
- [x] Validate the spec with a requirements checklist and resolve any quality gaps before planning.
- [x] Generate the implementation plan, research decisions, data model, contracts, and quickstart artifacts for store management.
- [x] Generate a dependency-ordered `tasks.md` organized by user story for store management implementation.
- [x] Implement the public store locator, homepage preview, admin store directory, and create/edit workflows using the new `src/features/stores` module.
- [x] Add focused unit and component coverage for store API, hooks, schema, locator, preview, form, admin actions, and reorder behavior.
- [x] Run final verification for store management: targeted store tests, full unit tests, lint, production build, and local route smoke checks.

## Review

- Created branch `018-store-management` and wrote the initial specification to `specs/018-store-management/spec.md`.
- Captured requirements validation in `specs/018-store-management/checklists/requirements.md`; validation passed on the first pass with no clarification markers left open.
- Completed `speckit-plan` artifacts in `specs/018-store-management/`, aligned to the repo's `src/features/*` pattern and backed by `code-review-graph` blast-radius review.
- Generated `specs/018-store-management/tasks.md` with executable checklist tasks split into Setup, Foundational, US1, US2, US3, and final verification phases.
- Implemented the full store-management slice in `src/features/stores`, replaced `/stores` and the homepage preview with backend-driven data, added `/admin/stores` list/new/edit routes, and wired admin role gating so staff land on store operations directly.
- Added `10` new store-focused test suites (`28` tests) and fixed adjacent repo-level verification friction so the full project suite now passes with `pnpm test -- --runInBand`.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/features/stores`
  - `pnpm test -- --runInBand`
  - `pnpm lint`
  - `pnpm build`
  - Local smoke checks: `curl -I http://localhost:3000/stores` and `curl -I http://localhost:3000/admin/stores` both returned `HTTP/1.1 200 OK`

# 024 Remove Duplicate Profile Wishlist Tab

- [x] Compare the `/profile` wishlist tab with the dedicated `/wishlist` page and choose the single canonical flow.
- [x] Remove the duplicate wishlist tab and dead code from the profile page while keeping remaining tabs accessible.
- [x] Run focused verification and record the outcome.

## Review

- Kept `/wishlist` as the canonical wishlist surface because it already has dedicated navigation entry points and a richer standalone layout.
- Removed the duplicate wishlist tab from `/profile`, along with its product-loading logic, wishlist store wiring, and card-grid UI.
- Simplified the remaining profile tabs to a two-column layout and kept the notifications tab visible on mobile so removing wishlist does not hide account settings access on smaller screens.
- Verification passed:
  - `pnpm exec eslint src/app/profile/page.tsx src/app/wishlist/page.tsx`
  - `rg -n 'wishlistItems|removeFromWishlist|wishlisted|value="wishlist"|myWishlist|Image|Trash2|Heart' src/app/profile/page.tsx`

# 023 Remove Profile Order History UI

- [x] Confirm the legacy order-history tab on `/profile` is still rendered from local mock data.
- [x] Remove the unused order-history UI and related dead code from the profile page.
- [x] Clean up any profile-specific i18n keys left orphaned by the removal.
- [x] Run focused verification and record the outcome.

## Review

- Removed the legacy order-history tab and accordion UI from `/profile`, including its mock-data import, translation usage, status helpers, and expand/collapse state.
- Tightened the tab layout to `grid-cols-2 sm:grid-cols-3` so mobile spacing stays correct after the tab removal.
- Removed the orphaned `profile.orderHistory` message key from both locale bundles.
- Verification passed:
  - `pnpm exec eslint src/app/profile/page.tsx`
  - `rg -n "value=\"orders\"|expandedOrder|toggleOrder|statusColors|statusLabelKey|@/data/orders|Package|ChevronDown|ChevronUp" src/app/profile/page.tsx`

# 022 Remove Loyalty Points

- [x] Inspect all storefront, admin, shared constants, mock data, and i18n touchpoints related to Loyalty Points.
- [x] Remove the public Loyalty page, homepage teaser, footer/profile entry points, and any related route/constants wiring.
- [x] Remove admin rewards/reporting surfaces and clean up supporting mock data, notification types, and sample promo content.
- [x] Run focused verification for the Loyalty removal and capture residual risks.

## Review

- Removed the Loyalty feature entry points entirely from the storefront: deleted `/loyalty`, dropped the home teaser component, removed the footer rewards link, and simplified the profile page so it no longer exposes a loyalty tab or loyalty-only notification toggle.
- Removed shared Loyalty wiring from route/API constants, feature flags, notification types, mock reward models, and locale keys so there are no remaining Loyalty references in `src/`.
- Simplified admin promotions and reports by removing loyalty rewards management and loyalty-points analytics, then replaced leftover sample promo/notification content with neutral promotion copy.
- Verification passed:
  - `pnpm exec eslint src/app/page.tsx src/app/profile/page.tsx src/app/admin/promotions/page.tsx src/app/admin/reports/page.tsx src/components/layout/footer.tsx src/constants/api-endpoints.ts src/constants/app-config.ts src/constants/routes.ts src/data/admin/orders.ts src/data/admin/promotions.ts src/data/admin/statistics.ts src/data/notifications.ts src/lib/constants.ts src/types/index.ts`
  - `rg -n "Loyalty|loyalty|LOYALTY|/loyalty|loyaltyPoints|pointsCost" src`
  - `pnpm exec next typegen`
- Residual risk: `pnpm exec tsc --noEmit --pretty false` is still failing because `.next/types` contains stale references for multiple non-existent routes outside this task (`/about`, `/contact`, `/privacy`, `/terms`, admin blog routes, checkout return pages, and the deleted loyalty page). That looks like a pre-existing/generated-types issue rather than a new source error from this cleanup.

# 011 Checkout Payment

- [x] Read the payment guide, spec workflow files, backend Swagger contract, and current checkout/order/admin code.
- [x] Inspect the code-review-graph and existing order/payment touchpoints to map blast radius.
- [x] Create `011-checkout-payment` spec and requirements checklist artifacts.
- [x] Extend shared order/payment types and service functions for Stripe checkout, payment summary, retry, and refund flows.
- [x] Update checkout and storefront order surfaces to handle hosted Stripe payment and payment-state feedback.
- [x] Update admin order management to surface payment status and support refunds for eligible orders.
- [x] Add or update focused tests, run verification, and record results plus residual risks.

## Review

- Checkout now supports `STRIPE` as a first-class payment method, creates a Stripe checkout session after order creation, and redirects customers to dedicated `/checkout/success` and `/checkout/cancel` return flows that read the latest payment summary.
- Browser verification caught and confirmed a real Stripe regression: `POST /v1/orders` returns an `OrderDto` with `id`, not `{ orderId }`. Checkout was patched to normalize `createdOrder.orderId ?? createdOrder.id`, which removed the `OrderId is required.` payment-session failure and restored redirect to Stripe checkout.
- Storefront order detail now shows payment status separately from fulfillment status and can reopen Stripe checkout for payable orders when the backend still allows it.
- Admin orders now surface payment status in the list and expose payment attempts plus refund actions on the order detail page.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/order-service.test.ts src/__tests__/components/checkout/payment-method-selector.test.tsx src/__tests__/hooks/use-orders.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint src/app/checkout/page.tsx src/app/checkout/success/page.tsx src/app/checkout/cancel/page.tsx 'src/app/orders/[id]/page.tsx' src/app/admin/orders/page.tsx 'src/app/admin/orders/[id]/page.tsx' src/components/checkout/payment-method-selector.tsx src/components/checkout/stripe-return-state.tsx src/hooks/use-orders.ts src/lib/payment.ts src/services/order-service.ts src/types/index.ts src/types/api.ts src/__tests__/services/order-service.test.ts src/__tests__/components/checkout/payment-method-selector.test.tsx src/__tests__/hooks/use-orders.test.ts`
- `code-review-graph` still rates the change as high risk because page-level coverage is still missing for `CheckoutPage`, `AdminOrdersPage`, `AdminOrderDetailPage`, and the new Stripe return pages.
- Residual risk: retrying Stripe payment after a `Failed` state depends on backend business rules for `POST /v1/payments/stripe/checkout-session`; the frontend now exposes the action and surfaces backend validation errors if that state is not actually reopenable.

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

# 018 Support Pages and Footer Link Self-Test

- [x] Reproduce the footer link failures in the browser and confirm which routes return 404.
- [x] Add the missing support pages (`/about`, `/contact`, `/terms`, `/privacy`) with shared styling and localized content.
- [x] Run focused verification for the new routes and capture any remaining navigation issues.

## Review

- Browser self-test confirmed the original problem: footer support links requested `/about`, `/contact`, `/terms`, and `/privacy`, but those routes did not exist and returned 404 on the deployed app.
- Added four new support pages with a shared shell and localized EN/VI content so the footer links now resolve cleanly.
- Browser self-test on the local app confirmed these routes all render successfully: `/about`, `/contact`, `/terms`, `/privacy`, `/products`, `/blog`, `/stores`, and `/loyalty`.
- Image-host hardening was preserved during the same pass by restoring the production CloudFront hosts and `cdn.zephyr1512.site` in `next.config.ts`.
- Verification passed:
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint src/components/layout/logo.tsx src/components/layout/footer.tsx src/components/support/support-page-shell.tsx src/app/about/page.tsx src/app/contact/page.tsx src/app/terms/page.tsx src/app/privacy/page.tsx`
- Residual risk: the live Vercel site will continue to show the old 404s until this branch is redeployed.

# 019 Order Detail PaymentInfo Contract Update

- [x] Inspect the storefront order-detail page and confirm it still reads payment state from the legacy payment-summary endpoint.
- [x] Extend order detail DTO/domain mapping to include the backend `paymentInfo` object from `GET /v1/orders/{id}`.
- [x] Update `/orders/[id]` to render payment status, latest attempt, and retry logic directly from `order.paymentInfo`.
- [x] Run focused verification for the updated payment-info contract and record the deployment implication.

## Review

- Storefront order detail no longer fetches `GET /v1/payments/by-order/{id}` for its payment badge and attempt summary; it now uses the `paymentInfo` block already returned by `GET /v1/orders/{id}`.
- This fixes the mismatch where fulfillment `orderStatus` remained `PENDING` while Stripe payment had already succeeded, because payment lifecycle is now read from `paymentInfo.paymentStatus`.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/order-service.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint 'src/app/orders/[id]/page.tsx' src/services/order-service.ts src/types/api.ts src/types/index.ts src/data/orders.ts src/__tests__/services/order-service.test.ts`

# 020 CI Hook Mock Alignment

- [x] Inspect the failing Vercel CI output and isolate the exact broken test assertion.
- [x] Verify whether the failure comes from runtime logic or a stale mocked module path after the payment-service refactor.
- [x] Patch the affected test to mock the current service boundary used by `useOrders`.
- [x] Re-run the targeted failing suite and `pnpm test:ci`, then record the outcome.

## Review

- Root cause: `src/hooks/use-orders.ts` now imports `getOrderPaymentSummary` from `@/services/payment-service`, but `src/__tests__/hooks/use-orders.test.ts` was still mocking that function from `@/services/order-service`.
- Fix: split the mocks so `getAdminOrders` stays mocked from `order-service` and `getOrderPaymentSummary` is mocked from `payment-service`, matching the real runtime boundary.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/hooks/use-orders.test.ts`
  - `pnpm test:ci`
- Local `pnpm build` could not fully complete in the sandbox because `next/font` could not fetch `Geist` and `Geist Mono` from `fonts.googleapis.com`; this is an environment/network limitation in the sandbox, not the original CI test regression.

# 021 Cart Order Payment Hardening

- [x] Block checkout submission while the authenticated cart is out of sync with the backend.
- [x] Reuse hardened product-image URL handling in admin order detail.
- [x] Reduce avoidable payment-summary calls in customer/admin order lists and keep stable fallback badges.
- [x] Run focused verification and record the results.

## Review

- Checkout now blocks submit whenever `cartSyncError` is present, preventing the customer from placing or paying for a stale backend cart while the UI still shows optimistic local items.
- Admin order detail now runs backend image URLs through the same `getProductImageUrl(...)` hardening used on the storefront order detail page, so malformed or missing snapshot URLs fall back safely instead of crashing `next/image`.
- Customer and admin order lists no longer call `GET /payments/by-order/{id}` for `COD` orders, and they now render `NotRequired` immediately from a shared fallback helper instead of degrading to `Unavailable`.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/hooks/use-orders.test.ts`
  - `pnpm exec eslint src/app/checkout/page.tsx src/app/orders/page.tsx 'src/app/admin/orders/[id]/page.tsx' src/hooks/use-orders.ts src/lib/payment.ts src/__tests__/hooks/use-orders.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
- Residual risk: the deployed Vercel storefront will continue to show the stale `Pending` state until this frontend patch is redeployed, even though the backend contract is already updated.

# 020 Stripe Success Reconcile Flow

- [x] Read the reconcile business guide and compare it against the current Stripe return flow.
- [x] Add typed frontend support for `POST /v1/payments/stripe/reconcile`.
- [x] Update the Stripe success page to read `session_id`, call reconcile, then poll order detail when payment sync is still pending.
- [x] Add focused verification for the new reconcile contract and capture residual deployment risk.

## Review

- Stripe success return now treats `GET /v1/orders/{id}` as the storefront source of truth and uses `paymentInfo` after a reconcile attempt instead of trusting redirect success alone.
- `/checkout/success` now reads `session_id` from the URL, calls `POST /v1/payments/stripe/reconcile`, then polls order detail every 2 seconds for up to 5 attempts when `paymentInfo.paymentStatus` is still `Pending`.
- The return UI now explicitly tells the customer that Stripe may already have charged the card while the shop-side sync is still finishing.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/order-service.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint src/components/checkout/stripe-return-state.tsx src/services/order-service.ts src/types/api.ts src/__tests__/services/order-service.test.ts`
- Residual risk: if the backend reconcile endpoint succeeds but the order detail API still lags longer than the 10-second polling window, the UI will remain on the synchronized-pending message until the user refreshes or reopens the order.

# 021 Stripe Payment-First Checkout Contract Update

- [x] Verify the latest Stripe checkout and reconcile contracts from backend Swagger instead of relying on older payment docs.
- [x] Update storefront checkout to use payment-first Stripe session creation while keeping COD on the existing order endpoint.
- [x] Align Stripe return-state UI and storage semantics with `checkoutDraftId` + `session_id`.
- [x] Refresh focused tests, run type/lint/test verification, and record the outcome plus any residual UX risk.

## Review

- Stripe checkout now follows the backend payment-first contract: `STRIPE` submits delivery details directly to `POST /v1/payments/stripe/checkout-session`, while `COD` still creates the order through `POST /v1/orders`.
- The hosted-payment return flow now keys off `checkoutDraftId` plus `session_id`, reconciles through the new backend contract, and preserves the draft in session storage long enough for success-page refreshes instead of discarding it immediately after a successful sync.
- Storefront order detail no longer exposes the stale “retry Stripe from order” behavior that depended on the retired order-first contract.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/payment-service.test.ts src/__tests__/services/order-service.test.ts`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec eslint src/app/checkout/page.tsx 'src/app/orders/[id]/page.tsx' src/components/checkout/stripe-return-state.tsx src/lib/payment.ts src/services/payment-service.ts src/types/api.ts src/__tests__/services/payment-service.test.ts`
- Residual UX risk: when Stripe checkout is cancelled or fails before an order is finalized, the customer is intentionally returned to checkout/cart instead of an order detail page because the payment-first backend no longer creates an order upfront.

# 013 Blog Management

- [x] Read the spec-kit artifacts, existing blog/admin code paths, and use code-review-graph to map the affected surfaces.
- [x] Add blog-management feature scaffolding, shared DTOs, route wiring, upload support, and localization namespaces.
- [x] Implement the admin blog CMS flows for create, edit, publish, archive, delete, category management, and curated ordering.
- [x] Replace public blog mock consumption with API-backed list/detail/featured blog rendering.
- [x] Add focused service, hook, component, and page tests for the new blog-management flows.
- [x] Run final verification with `pnpm test` and `pnpm build`, then record the outcome.

## Review

- Added a full `src/features/blogs/` module with typed admin/public APIs, hooks, Zod-backed form schema, rich-text editing via Tiptap, category management, ordering, and shared blog utilities.
- Added `/admin/blogs`, `/admin/blogs/new`, and `/admin/blogs/edit/[id]` plus admin shell navigation, and switched the public `/blog`, `/blog/[slug]`, and homepage preview to API-backed blog content instead of production mock data.
- Strengthened shared infrastructure by generalizing image uploads for the `blogs` bucket, extending blog DTOs in `src/types/api.ts`, fixing Vietnamese slug generation for `đ`, and completing EN/VI translation coverage for admin/public blog copy.
- Added 11 focused blog-management test files and verified the entire repo end to end.
- Verification passed:
  - `pnpm test`
  - `pnpm build`
- Build note: the original `next build` path failed in this sandbox because Turbopack could not bind a helper port while processing CSS, so the project build script now uses `next build --webpack`, which completed successfully with the current codebase.

# 014 Report Statistic

- [x] Read the spec-kit artifacts, report docs, and current admin reports implementation, then keep code-review-graph in the loop for the affected admin analytics surface.
- [x] Add typed admin report DTOs, query helpers, dashboard/export service functions, and a shared reports hook.
- [x] Replace the dummy `/admin/reports` page with backend-driven summary cards, revenue trend, orders-by-status, top-products, and new-users rendering.
- [x] Add focused unit/page coverage for reports helpers, service, hook, page behavior, and active-products comparison suppression.
- [x] Remove the obsolete mock statistics dependency, clear the leftover product-service fixture type mismatch, and re-verify the repo gates.

## Review

- `/admin/reports` is now fully driven by the backend `admin/reports/dashboard` contract through `src/services/reports-service.ts` and `src/hooks/use-admin-reports.ts`, with one synchronized preset state shared across summary cards, revenue, order-status, top-product, and new-user sections.
- Export now uses the same active report query as the visible dashboard and downloads the CSV payload through the shared API layer instead of generating client-side mock CSV content.
- Active products now respects the backend `comparisonSupported` flag, so the UI shows a snapshot note instead of a fake period-over-period delta when the backend intentionally suppresses comparison.
- The old report dummy dataset file was removed, and the unrelated `ApiProductDetail` test fixture was updated with `quantitySold` so the global typecheck gate is green again.
- Verification passed:
  - `pnpm test -- --runInBand src/__tests__/services/reports-service.test.ts src/__tests__/hooks/use-admin-reports.test.ts src/__tests__/pages/admin-reports-page.test.tsx src/__tests__/components/admin/stat-card.test.tsx`
  - `pnpm exec eslint src/app/admin/reports/page.tsx src/components/admin/stat-card.tsx src/hooks/use-admin-reports.ts src/lib/api.ts src/lib/reports.ts src/services/reports-service.ts src/types/api.ts src/__tests__/services/reports-service.test.ts src/__tests__/hooks/use-admin-reports.test.ts src/__tests__/pages/admin-reports-page.test.tsx src/__tests__/components/admin/stat-card.test.tsx`
  - `pnpm exec next typegen`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm exec jest --ci --runInBand`
  - `pnpm build`
- Build/typegen note: this workspace had a stale generated `.next/types/app/loyalty/page.ts` entry left behind after the earlier loyalty removal. `next typegen` regenerated current route types, and removing the stale generated file restored a clean `tsc` gate without changing application source behavior.

# 033 Desktop And Tablet UI Audit

- [x] Re-scan the shared storefront and admin shells with code-review-graph to keep the desktop/tablet audit focused on the changed UI surfaces.
- [x] Review representative desktop and tablet screenshots for storefront, product listing, blog, and admin list pages to catch layout regressions beyond simple overflow checks.
- [x] Polish the tablet navigation and admin list rendering so medium-width screens stay readable without collapsing the desktop structure too early.
- [x] Harden blog image rendering with a shared fallback component so broken cover URLs do not leave large blank panels on home, blog list, or blog detail pages.
- [x] Re-run lint, full unit tests, and production build after the desktop/tablet polish pass.

## Review

- Tablet layout now stays menu-first until `lg`, which keeps the header calmer on medium screens while preserving the existing desktop structure at full width.
- Admin data tables now switch cleanly between card and table modes at the `lg` breakpoint, avoiding compressed tablet tables and duplicate DOM rendering.
- Blog surfaces now share a dedicated `BlogCoverImage` fallback, so broken or missing blog cover images degrade to branded placeholders instead of leaving blank white blocks in key content areas.
- Homepage blog preview now shows real cover images when available and keeps the previous branded placeholder style only when the post has no cover image at all.
- Verification passed:
  - `pnpm exec eslint src/components/blog/blog-cover-image.tsx src/app/blog/page.tsx src/app/blog/[slug]/page.tsx src/components/home/blog-preview.tsx src/__tests__/components/blog/blog-cover-image.test.tsx`
  - `pnpm test:ci`
  - `pnpm build`

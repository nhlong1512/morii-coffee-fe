# Phase 0 Research: GHN Delivery Experience

## Decision 1: Keep GHN integration behind Morii backend contracts only

- **Decision**: The frontend will consume only Morii backend delivery, quote, order, payment, and shipment endpoints. No UI surface will call GHN directly.
- **Rationale**: The approved handoff explicitly states that GHN token, shop configuration, quote logic, shipment lifecycle, and webhook handling are backend-owned concerns. This also keeps authentication, retries, provider quirks, and environment handling out of the browser.
- **Alternatives considered**:
  - Call GHN directly from the frontend: rejected because it leaks credentials and bypasses backend orchestration.
  - Build a parallel frontend-only adapter layer that simulates GHN behavior: rejected because it would diverge from the backend source of truth.

## Decision 2: Model delivery choice explicitly as pickup vs GHN delivery

- **Decision**: Checkout will distinguish between `PICKUP` and `GHN_DELIVERY` as first-class delivery methods.
- **Rationale**: The spec requires self-pickup to remain available while home delivery requires quote validation. An explicit delivery mode prevents quote rules from leaking into pickup flow and allows the UI to enforce different requirements cleanly.
- **Alternatives considered**:
  - Infer delivery from the presence of address fields: rejected because structured delivery profiles can still exist even when a user chooses pickup.
  - Treat all orders as delivery-capable and optionally skip shipping fee: rejected because it blurs business rules and complicates validation.

## Decision 3: Store quote snapshot data in shared frontend order/payment request models

- **Decision**: The frontend will preserve quote snapshot fields such as quote fingerprint, service identifiers, service label, fee, quote expiry, and provider environment and send them back during delivery checkout submission.
- **Rationale**: The handoff states that the backend validates the shipping snapshot before creating an order or Stripe checkout session. Persisting the returned snapshot in the browser state for the active checkout keeps the submission deterministic and minimizes recomputation in the UI.
- **Alternatives considered**:
  - Re-request the quote during submit and ignore the existing snapshot: rejected because it introduces unnecessary race conditions and weakens the user-visible fee confirmation.
  - Send only the fee and selected service id: rejected because the backend contract expects the full verification snapshot.

## Decision 4: Introduce a reusable `src/features/shipping` slice

- **Decision**: Add a dedicated `src/features/shipping` module for master-data types, quote types, shipment summary types, request builders, hooks, and shared UI helpers.
- **Rationale**: GHN-related logic now spans checkout, customer order detail, customer order history, and admin order detail. Concentrating shipping concerns into one feature slice keeps those pages thinner and matches the repo's newer `src/features/*` pattern used for stores and blogs.
- **Alternatives considered**:
  - Put all GHN types directly into existing pages: rejected because it would increase duplication and make tests harder to localize.
  - Extend only `src/services/*` without a feature slice: rejected because the UI state, view helpers, and selection behavior need a cohesive home.

## Decision 5: Preserve existing shared service boundaries for order, payment, and user profile APIs

- **Decision**: Existing `src/services/order-service.ts`, `src/services/payment-service.ts`, and `src/services/user-service.ts` will remain the main integration points for order creation, Stripe checkout session creation, and saved delivery profile persistence, but their contracts will be expanded for delivery-specific fields.
- **Rationale**: These files are already the canonical boundary for those backend domains and are covered by targeted tests. Extending them keeps migration small and avoids parallel contract sources for the same backend endpoints.
- **Alternatives considered**:
  - Move order and payment APIs entirely into `src/features/shipping`: rejected because those services are already used outside GHN delivery.
  - Duplicate delivery-aware order creation in new shipping-only APIs: rejected because it would fragment the order workflow.

## Decision 6: Use backend-provided shipment summary as the single tracking source of truth

- **Decision**: Customer order detail, customer order history, and admin order detail will treat `shipment` or the dedicated shipment-summary endpoint as the source of truth for delivery tracking information.
- **Rationale**: The handoff explicitly says the frontend should treat `order.shipment` as the source of truth for tracking UI. This avoids deriving shipment state indirectly from fulfillment status or payment status.
- **Alternatives considered**:
  - Derive tracking UI from order status only: rejected because shipment creation and shipment delivery can lag behind fulfillment state.
  - Combine shipment summary with local heuristics for display state: rejected because it invites inconsistency between customer and admin views.

## Decision 7: Make admin shipment operations live on the existing admin order detail page

- **Decision**: Admin shipment create/retry, requote, sync, cancel, and note update actions will be integrated into the current admin order detail surface rather than a new dedicated admin shipping page.
- **Rationale**: The spec and handoff both frame shipment recovery as an order-detail workflow. This minimizes navigation overhead and aligns shipment actions with the order context administrators are already using.
- **Alternatives considered**:
  - Add a separate admin shipping dashboard: rejected for v1 because it expands scope and duplicates order context.
  - Hide shipment actions behind only backend automation: rejected because the feature explicitly requires manual operational recovery.

## Decision 8: Quote freshness should be enforced through UI invalidation, not optimistic submission

- **Decision**: The frontend will clear or mark quote state invalid whenever the cart or shipping-relevant address fields change and will block delivery submission until a fresh quote exists.
- **Rationale**: The handoff requires requoting when cart items, quantities, or user address changes, and says expired quotes can be rejected server-side. Invalidating client-side first produces clearer UX and reduces avoidable failed submissions.
- **Alternatives considered**:
  - Allow submit with stale quote and rely entirely on backend rejection: rejected because it creates preventable checkout frustration.
  - Keep the quote even when delivery field changes are partial: rejected because it risks showing mismatched fee or ETA information.

## Decision 9: Verification must emphasize service and UI contract tests before browser smoke checks

- **Decision**: Planning assumes the main verification stack will be targeted unit/component tests, full unit suite, and production build, with browser smoke checks used for route-level confidence when local pages are available.
- **Rationale**: Existing code-review-graph context highlights that page surfaces are higher-risk, while the repo already has strong service and component test patterns. This feature changes multiple contracts, so fast test feedback at service/helper/component level is the most reliable first line of defense.
- **Alternatives considered**:
  - Rely mostly on browser walkthroughs: rejected because the change breadth across types/services would leave regressions harder to isolate.
  - Only test service contracts: rejected because checkout and order pages need visible state-branch coverage.

# Tasks: GHN Delivery Experience

**Input**: Design documents from `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/019-ghn-integration/`
**Prerequisites**: `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/019-ghn-integration/plan.md`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/019-ghn-integration/spec.md`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/019-ghn-integration/research.md`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/019-ghn-integration/data-model.md`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/019-ghn-integration/contracts/`

**Tests**: Include targeted unit and component tests for every touched contract, then finish with full unit suite and production build verification.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared delivery/shipment contracts and copy before user-story work starts.

- [X] T001 Create the shipping feature slice entry points in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/index.ts`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/types.ts`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/api.ts`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/hooks.ts`, and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/utils.ts`
- [X] T002 [P] Extend shared delivery and shipment domain types in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/types/index.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/types/api.ts`
- [X] T003 [P] Add checkout, shipment, and admin delivery copy keys in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/i18n/messages/en.json` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/i18n/messages/vi.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared backend-facing contracts and helpers that all delivery experiences depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Extend delivery-profile read/write contracts in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/services/user-service.ts`
- [X] T005 [P] Extend delivery-aware order and Stripe checkout payload contracts in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/services/order-service.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/services/payment-service.ts`
- [X] T006 [P] Implement GHN master-data, quote, shipment-summary, and shipment-action request clients in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/api.ts`
- [X] T007 Implement shipping request builders, quote invalidation helpers, and shipment state formatters in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/utils.ts`
- [X] T008 Implement reusable shipping hooks for address cascades, quote lifecycle, and shipment refresh orchestration in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/hooks.ts`

**Checkpoint**: Shared delivery/shipment infrastructure is ready for story-level UI work.

---

## Phase 3: User Story 1 - Complete Delivery Checkout With A Valid Shipping Quote (Priority: P1) 🎯 MVP

**Goal**: Let customers choose pickup vs GHN delivery, manage a structured address, fetch a valid quote, and submit COD or Stripe checkout with the quote snapshot.

**Independent Test**: Sign in as a customer, choose `GHN_DELIVERY`, select province/district/ward, get a quote, verify quote invalidation after address/cart changes, and submit both COD and Stripe flows; repeat with `PICKUP` and confirm no quote is required.

### Tests for User Story 1

- [X] T009 [P] [US1] Add delivery-profile and quote payload regression tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/services/user-service.test.ts`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/services/order-service.test.ts`, and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/services/payment-service.test.ts`
- [X] T010 [P] [US1] Add quote-helper and shipping-hook tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/shipping/utils.test.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/shipping/hooks.test.ts`
- [X] T011 [P] [US1] Add checkout delivery UI regression tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/components/checkout/delivery-form.test.tsx`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/components/checkout/payment-method-selector.test.tsx`, and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/components/checkout/price-summary.test.tsx`

### Implementation for User Story 1

- [X] T012 [P] [US1] Build reusable delivery-method, address-select, and quote-summary UI components in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/components/delivery-method-selector.tsx`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/components/address-selects.tsx`, and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/components/shipping-quote-card.tsx`
- [X] T013 [US1] Refactor checkout state to load and save structured delivery profiles in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/checkout/page.tsx`
- [X] T014 [US1] Wire province/district/ward master-data cascading and quote requests into `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/checkout/page.tsx` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/hooks.ts`
- [X] T015 [US1] Enforce quote invalidation, pickup-vs-delivery validation, and stale-quote blocking in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/checkout/page.tsx` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/utils.ts`
- [X] T016 [US1] Submit GHN quote snapshots through COD and Stripe checkout flows in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/checkout/page.tsx`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/services/order-service.ts`, and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/services/payment-service.ts`
- [X] T017 [US1] Update checkout presentation components for delivery fee, ETA, and pickup fallback states in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/components/checkout/delivery-form.tsx` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/components/checkout/price-summary.tsx`

**Checkpoint**: User Story 1 is independently functional when customers can complete pickup and GHN delivery checkout with correct quote behavior.

---

## Phase 4: User Story 2 - Manage Delivery Shipments From Admin Order Detail (Priority: P2)

**Goal**: Let administrators recover and manage delivery shipments directly from the existing admin order detail workflow.

**Independent Test**: Open an eligible delivery order in admin order detail, create or retry a shipment, refresh shipment state, requote the order, update shipment notes, and cancel when the shipment is in a cancellable state.

### Tests for User Story 2

- [X] T018 [P] [US2] Add shipment-management service and API client tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/services/order-service.test.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/shipping/api.test.ts`
- [X] T019 [P] [US2] Add admin shipment action UI coverage in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/app/admin/orders/[id]/page.test.tsx`

### Implementation for User Story 2

- [X] T020 [P] [US2] Extend shipment action types, command payloads, and status guards in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/types.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/utils.ts`
- [X] T021 [US2] Implement shipment create, retry, requote, sync, cancel, and note-update orchestration in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/hooks.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/api.ts`
- [X] T022 [US2] Render admin shipment summary, operational controls, and action feedback in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/admin/orders/[id]/page.tsx`
- [X] T023 [US2] Localize admin shipment action states, failure messaging, and cancellable-state copy in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/i18n/messages/en.json` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/i18n/messages/vi.json`

**Checkpoint**: User Story 2 is independently functional when admins can manage shipment recovery without leaving the order detail page.

---

## Phase 5: User Story 3 - Track Shipment Progress After Order Creation (Priority: P3)

**Goal**: Show customers clear delivery and shipment visibility after checkout without exposing shipment controls.

**Independent Test**: Open customer order history and order detail for a delivery order and confirm delivery method, shipment status, tracking reference, and pending-shipment messaging are all visible and distinct from payment/order status.

### Tests for User Story 3

- [X] T024 [P] [US3] Add customer delivery visibility tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/app/orders/[id]/page.test.tsx` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/hooks/use-orders.test.ts`
- [X] T025 [P] [US3] Add shipment summary formatter and pending-state tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/shipping/utils.test.ts`

### Implementation for User Story 3

- [X] T026 [P] [US3] Build reusable customer shipment-summary view components in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/shipping/components/shipment-summary-card.tsx`
- [X] T027 [US3] Show delivery method, shipment summary, and pending-shipment messaging in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/orders/[id]/page.tsx`
- [X] T028 [US3] Add compact delivery and shipment indicators to customer order history in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/orders/page.tsx`

**Checkpoint**: User Story 3 is independently functional when customers can understand delivery progress from order history and order detail alone.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the whole GHN delivery feature and leave the shared surfaces consistent.

- [X] T029 [P] Add cross-surface regression coverage for shipping exports and page wiring in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/shipping/index.test.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/app/orders/page.test.tsx`
- [X] T030 Run the targeted GHN delivery test suites from `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/services/`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/components/checkout/`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/hooks/`, `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/shipping/`, and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/app/`
- [X] T031 Run full unit-test and production build verification against `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no dependencies and starts immediately.
- **Phase 2: Foundational** depends on Phase 1 and blocks all story work.
- **Phase 3: US1** depends on Phase 2 and is the MVP delivery slice.
- **Phase 4: US2** depends on Phase 2 and reuses the shared shipment contracts established for US1.
- **Phase 5: US3** depends on Phase 2 and can begin after shipment summary contracts exist, though it is safest after US1 delivery read models settle.
- **Phase 6: Polish** depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundational work.
- **US2 (P2)**: Depends on shared shipment contracts from Phase 2 and benefits from order payload/read-model changes completed for US1.
- **US3 (P3)**: Depends on shared shipment summary contracts from Phase 2 and should consume the same read models used by US2.

### Within Each User Story

- Tests should be written first and fail before implementation.
- Shared types and helpers should land before page wiring.
- Service and hook changes should land before page-level action orchestration.
- Each story is complete only when its independent test passes without relying on unfinished later stories.

### Parallel Opportunities

- `T002` and `T003` can run in parallel after `T001`.
- `T005` and `T006` can run in parallel after `T004`.
- `T009`, `T010`, and `T011` can run in parallel for US1.
- `T012` can run while `T013` prepares checkout state for US1.
- `T018` and `T019` can run in parallel for US2.
- `T024` and `T025` can run in parallel for US3.
- `T029` can run in parallel with verification prep before `T030` and `T031`.

---

## Parallel Example: User Story 1

```text
Task: "T009 [US1] Add delivery-profile and quote payload regression tests in src/__tests__/services/user-service.test.ts, src/__tests__/services/order-service.test.ts, and src/__tests__/services/payment-service.test.ts"
Task: "T010 [US1] Add quote-helper and shipping-hook tests in src/__tests__/features/shipping/utils.test.ts and src/__tests__/features/shipping/hooks.test.ts"
Task: "T011 [US1] Add checkout delivery UI regression tests in src/__tests__/components/checkout/delivery-form.test.tsx, src/__tests__/components/checkout/payment-method-selector.test.tsx, and src/__tests__/components/checkout/price-summary.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T018 [US2] Add shipment-management service and API client tests in src/__tests__/services/order-service.test.ts and src/__tests__/features/shipping/api.test.ts"
Task: "T019 [US2] Add admin shipment action UI coverage in src/__tests__/app/admin/orders/[id]/page.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T024 [US3] Add customer delivery visibility tests in src/__tests__/app/orders/[id]/page.test.tsx and src/__tests__/hooks/use-orders.test.ts"
Task: "T025 [US3] Add shipment summary formatter and pending-state tests in src/__tests__/features/shipping/utils.test.ts"
Task: "T026 [US3] Build reusable customer shipment-summary view components in src/features/shipping/components/shipment-summary-card.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) end to end.
3. Run the US1-specific tests plus checkout smoke verification.
4. Stop and validate pickup and GHN delivery checkout before moving on.

### Incremental Delivery

1. Ship shared delivery/shipment contracts first.
2. Add US1 for customer checkout and validate COD + Stripe flows.
3. Add US2 for admin shipment recovery and validate operational actions.
4. Add US3 for customer shipment visibility and validate read-only tracking.
5. Finish with cross-surface regression, full unit suite, and build verification.

### Parallel Team Strategy

1. One engineer completes Phase 1 and Phase 2.
2. After the foundation is stable:
   - Engineer A takes US1 checkout UI and submit wiring.
   - Engineer B takes US2 admin shipment actions.
   - Engineer C takes US3 customer shipment visibility.
3. Rejoin for Phase 6 verification and cleanup.

---

## Notes

- `[P]` tasks are limited to work that can proceed on separate files or after a stable prerequisite.
- Every user story includes explicit test tasks because the feature request requires updated unit tests before shipping.
- `T030` and `T031` are mandatory exit gates for the final implementation pass.

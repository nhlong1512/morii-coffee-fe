# Implementation Plan: GHN Delivery Experience

**Branch**: `019-ghn-integration` | **Date**: 2026-05-24 | **Spec**: [spec.md](/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/019-ghn-integration/spec.md)
**Input**: Feature specification from `/specs/019-ghn-integration/spec.md`

**Note**: This plan is based on the approved feature specification, the GHN frontend handoff, and codebase analysis from `code-review-graph`.

## Summary

Implement a quote-driven GHN delivery flow across checkout, order history/detail, and admin order detail by extending Morii's delivery contracts, introducing a reusable shipping feature slice, and wiring shipment visibility and shipment operations into the existing storefront and admin order surfaces without allowing the frontend to call GHN directly.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.1.6 with React 19  
**Primary Dependencies**: Next.js App Router, next-intl, Zustand, project `apiGet/apiPost/apiPut/apiPatch` helpers, Tailwind CSS v4, Lucide React, Jest 30, React Testing Library  
**Storage**: Remote Morii backend APIs as source of truth; browser `sessionStorage` for pending Stripe draft id; existing Zustand/local persistence for auth and cart state  
**Testing**: Jest + React Testing Library via `pnpm test -- --runInBand`, targeted service/component tests, full unit test suite, production build verification  
**Target Platform**: Responsive web storefront and admin web application  
**Project Type**: Frontend web application  
**Performance Goals**: Checkout shipping quote interactions should feel near-immediate in normal usage, and admin shipment actions should complete with visible feedback in a single page interaction  
**Constraints**: Frontend must never call GHN directly; quote data must refresh when address or cart changes; delivery, payment, and shipment states must remain separate; all updated code must pass full unit tests and production build before handoff  
**Scale/Scope**: Multi-surface feature spanning checkout, customer order history/detail, admin order detail, shared types/services, i18n, and new shipping-focused tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository's `.specify/memory/constitution.md` is still an unfilled template with placeholder principle markers and no ratified project-specific gates. No enforceable constitution rules are currently defined in that file.

Practical checks applied for this plan:

- Preserve existing repo patterns instead of introducing a second API/client architecture.
- Keep customer-facing and admin-facing responsibilities separated.
- Require test and build verification as non-negotiable exit criteria.
- Keep GHN integration frontend-only from the app's perspective and avoid leaking provider-specific direct calls into UI code.

Gate result: PASS

## Project Structure

### Documentation (this feature)

```text
specs/019-ghn-integration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── checkout-delivery.md
│   ├── shipment-management.md
│   └── order-read-models.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── checkout/page.tsx
│   ├── orders/page.tsx
│   ├── orders/[id]/page.tsx
│   └── admin/orders/[id]/page.tsx
├── components/
│   └── checkout/
├── features/
│   └── shipping/
│       ├── api.ts
│       ├── hooks.ts
│       ├── index.ts
│       ├── types.ts
│       ├── utils.ts
│       └── components/
├── services/
│   ├── order-service.ts
│   ├── payment-service.ts
│   └── user-service.ts
├── types/
│   ├── api.ts
│   └── index.ts
└── i18n/messages/

src/__tests__/
├── services/
├── components/checkout/
├── hooks/
└── features/shipping/
```

**Structure Decision**: Use the existing single-project Next.js frontend structure and add a dedicated `src/features/shipping/` slice for reusable GHN delivery contracts, service wrappers, hooks, helpers, and UI pieces. Preserve the current shared `src/services/*` layer where order/payment/user flows already live, and extend the existing page surfaces rather than creating a second checkout or admin workflow.

## Complexity Tracking

No constitution violations require justification.

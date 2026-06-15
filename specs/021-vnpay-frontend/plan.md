# Implementation Plan: VNPAY Frontend Integration

**Branch**: `021-vnpay-frontend` | **Date**: June 15, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from [spec.md](./spec.md)

**Note**: This plan decomposes VNPAY frontend integration into architectural phases: types/enums → checkout flow → return/polling → payment history → i18n → testing.

## Summary

Add VNPAY as a prepaid payment method alongside existing Stripe and COD options in the Morii Coffee Next.js frontend. Customers select VNPAY during checkout, frontend requests a signed payment URL from the backend, redirects to VNPAY's hosted page, then polls the backend to confirm payment state upon return. Admin and customer order views display VNPAY-specific transaction identifiers. All VNPAY UI strings are externalized as i18n keys for EN/VI support. Implementation preserves backward compatibility with existing Stripe payment flows by extending provider-neutral types and payment service methods.

## Technical Context

**Language/Version**: TypeScript 5.x + Next.js 16.1.6 with React 19.2.3, App Router, `src/` directory  
**Primary Dependencies**: Zustand 5.0.11 (state + persist), next-intl 4.8.3 (i18n), Radix UI + shadcn/ui patterns, Tailwind CSS v4, Framer Motion, Lucide React  
**Storage**: Client-side sessionStorage (pending checkout) + Zustand persist (cart/wishlist)  
**Testing**: Jest 30.3.0 + @testing-library/react v16 for unit tests; no end-to-end test framework required (backend E2E verification completed)  
**Target Platform**: Web browser (modern desktop + mobile, no IE support required)  
**Project Type**: Next.js web application frontend  
**Performance Goals**: Checkout to VNPAY redirect <3s; payment confirmation polling <10s for 95% of transactions  
**Constraints**: sessionStorage reliability (all modern browsers); no localStorage for pending checkout (security: use sessionStorage); TypeScript strict mode; zero VNPAY signing in frontend  
**Scale/Scope**: ~800-line frontend feature spanning 6 files + 1 return page + i18n translations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Morii Coffee Frontend Principles** (from CLAUDE.md):
1. **Plan Mode**: Always enter plan mode for non-trivial tasks (3+ steps) ✅ *Currently in plan mode*
2. **Verification Before Done**: Never mark complete without proving it works ✅ *Will verify each phase with integration tests*
3. **No Laziness**: Find root causes, no band-aids ✅ *Using backend-first approach; no client-side signing*
4. **Simplicity First**: Minimal impact, minimal code ✅ *Extending existing payment service, not refactoring*
5. **Demand Elegance**: For non-trivial changes, ask "is there a more elegant way?" ✅ *Leveraging provider-neutral backend contract*
6. **Autonomous Execution**: Fix bugs, verify CI without hand-holding ✅ *Will build locally, run tests, verify linting*
7. **Skill Usage**: Use implement-feature skill at implementation phase (not during planning) ✅ *Deferred to /speckit.implement*

**All gates pass**. Feature aligns with existing Next.js architecture, reuses payment service patterns, and maintains strict type safety.

## Project Structure

### Documentation (this feature)

```text
specs/021-vnpay-frontend/
├── plan.md                 # This file
├── research.md             # Phase 0 output (no research needed - backend contract stable)
├── data-model.md           # Phase 1 output (entity definitions)
├── quickstart.md           # Phase 1 output (implementation walkthrough)
├── contracts/              # Phase 1 output (API contracts + schema references)
├── checklists/requirements.md  # Spec validation (already created)
└── tasks.md                # Phase 2 output (/speckit.tasks command)
```

### Source Code Changes (morii-coffee-fe repository)

```text
src/
├── types/
│   ├── index.ts                    # Add PaymentMethod = "..." | "VNPAY"
│   └── api.ts                      # Add VNPAY payment DTOs
│
├── lib/
│   └── payment.ts                  # Add VNPAY status mapper, payment provider enum
│
├── stores/
│   └── checkout.ts                 # Extend with pending VNPAY checkout state
│
├── services/
│   └── payment-service.ts          # Add createVnpayPaymentUrl(), reconcileVnpayPayment()
│
├── components/checkout/
│   ├── payment-method-selector.tsx # Add VNPAY option
│   ├── vnpay-return-state.tsx      # New: Return page polling & status display
│   └── stripe-return-state.tsx     # (existing, keep unchanged)
│
├── app/checkout/
│   ├── page.tsx                    # Extend with VNPAY payment URL creation
│   └── vnpay/return/page.tsx       # New: VNPAY return endpoint landing page
│
├── app/orders/
│   └── [id]/page.tsx               # Display VNPAY payment method + transaction IDs
│
├── app/admin/orders/
│   ├── page.tsx                    # Extend payment method display
│   └── [id]/page.tsx               # Display VNPAY refund capability & status
│
├── i18n/messages/
│   ├── en.json                     # Add VNPAY labels (9 keys)
│   └── vi.json                     # Add VNPAY labels (9 keys)
│
└── __tests__/
    ├── services/payment-service.test.ts         # VNPAY API calls
    ├── components/payment-method-selector.test.tsx
    ├── checkout/vnpay.integration.test.ts       # Checkout → redirect flow
    └── checkout/vnpay-return.integration.test.ts # Return polling behavior
```

**Structure Decision**: Web application (frontend-only for this feature). Changes are localized to payment-related modules. No refactoring of existing Stripe flow—only extension with VNPAY as parallel provider. New files: `vnpay-return-state.tsx`, `checkout/vnpay/return/page.tsx`. Modified files: types, services, components, stores, i18n. Tests added for new and modified behavior.

## Design Decisions

### 1. Provider-Neutral Payment Types (No Refactoring of Stripe)

**Decision**: Extend existing Stripe-centric types with provider fields instead of renaming all properties.

**Rationale**: 
- Backend already supports provider-neutral fields; frontend can map backward-compatibly
- Risk of breaking Stripe flow if we rename `StripeSessionId` → `ProviderSessionId` everywhere
- Simpler: Add type `PaymentProvider = "Stripe" | "Vnpay"` and new fields; keep Stripe names as aliases

**Implementation**:
```typescript
// src/types/api.ts
export type PaymentProvider = "Stripe" | "Vnpay";
export interface Payment {
  id: string;
  provider: PaymentProvider;
  paymentMethod: PaymentMethod;
  providerSessionId?: string;  // txnRef for VNPAY, sessionId for Stripe
  providerPaymentId?: string;  // TransactionNo for VNPAY
  providerTransactionId?: string;
  stripeSessionId?: string;    // Backward compat alias
  // ... existing fields
}
```

---

### 2. sessionStorage for Pending Checkout (Not localStorage)

**Decision**: Use `sessionStorage` (session-scoped, expires on tab close) for pending VNPAY checkout.

**Rationale**:
- sessionStorage is cleared when tab closes → automatic cleanup if user abandons payment
- Payment draft token `expiresAtUtc` provides explicit expiration (additional safety)
- Aligns with Stripe's existing session storage pattern
- No credentials stored; only draft ID and provider session ID

**Implementation**:
```typescript
// src/lib/payment.ts
const PENDING_CHECKOUT_KEY = "morii.pendingHostedCheckout";
export interface PendingHostedCheckout {
  provider: "Stripe" | "Vnpay";
  checkoutDraftId: string;
  providerSessionId: string;  // txnRef for VNPAY
  expiresAtUtc: string;        // ISO 8601
}
```

---

### 3. Polling with Exponential Backoff + Hard Timeout

**Decision**: Poll every 2-3 seconds for up to 300 seconds (5 minutes), stop on terminal state or timeout.

**Rationale**:
- IPN typically confirms within 1-5 seconds; 300s covers network delays and backend processing
- Frequent polling (2-3s) improves perceived responsiveness
- Hard timeout prevents infinite polling if backend hangs
- User can manually check order history if polling times out

**Implementation**:
```typescript
// src/components/checkout/vnpay-return-state.tsx
const poll = async () => {
  const elapsed = Date.now() - startTime;
  if (elapsed > 300_000) { // 5 minutes
    showError("reconcile_timeout");
    return;
  }
  
  if (isExpired(expiresAtUtc)) {
    showError("vnpay_expired");
    return;
  }
  
  const response = await reconcileVnpayPayment(checkoutDraftId, txnRef);
  if (response.paymentStatus === "Paid") {
    clearCart();
    navigateToOrder(response.orderId);
    return;
  }
  
  if (response.paymentStatus !== null) {
    // Failed or NotRequired
    return;
  }
  
  // Still pending, schedule next poll
  setTimeout(poll, 2000 + Math.random() * 1000);
};
```

---

### 4. No Client-Side VNPAY Secret or Signing

**Decision**: All VNPAY signing happens in backend. Frontend only reads/stores URLs and responses.

**Rationale**:
- Backend VNPAY gateway provides signed payment URL
- Backend verifies IPN signatures and return checksums
- Frontend never sees hash secret or HMAC logic
- Matches Stripe model: frontend requests session, backend signs

**Implementation**: 
- `payment-service.ts` calls `POST /api/v1/payments/vnpay/payment-url` → backend returns signed URL
- `vnpay-return-state.tsx` calls `POST /api/v1/payments/vnpay/reconcile` → backend verifies and returns state
- Zero crypto, zero VNPAY-specific imports in frontend

---

### 5. Shared Payment Return Component Pattern

**Decision**: Create `vnpay-return-state.tsx` component; reuse patterns from existing `stripe-return-state.tsx` where applicable.

**Rationale**:
- Stripe already has a return page with polling logic
- VNPAY polling is similar: fetch state, handle terminal/pending/timeout cases
- Component can be isolated: `<VnpayReturnState pending={pendingCheckout} onSuccess={...} />`
- Future: could be generalized to `<HostedPaymentReturn>` with provider-specific handlers

**Implementation**:
```typescript
// src/components/checkout/vnpay-return-state.tsx
export interface VnpayReturnStateProps {
  pendingCheckout: PendingHostedCheckout;
  onSuccess: (order: Order) => void;
  onFailure: (reason: string) => void;
  onExpired: () => void;
}

export const VnpayReturnState: React.FC<VnpayReturnStateProps> = ({ ... }) => {
  // Polling logic, UI for pending/success/failed/expired states
};
```

---

### 6. i18n Keys Over Hardcoded Strings

**Decision**: All VNPAY-specific UI text goes in `en.json` / `vi.json` with namespaced keys.

**Rationale**:
- Spec requirement (FR-023): Required i18n keys for VNPAY
- Aligns with morii-coffee i18n patterns (next-intl)
- Supports EN/VI from day 1
- Support team can localize without code changes

**Implementation**:
```json
// en.json
{
  "payment": {
    "method": {
      "vnpay": "VNPAY"
    }
  },
  "checkout": {
    "vnpay_pending_verification": "Verifying payment...",
    "vnpay_success": "Payment successful.",
    "vnpay_failed": "Payment failed.",
    ...
  }
}
```

---

## Complexity Tracking

**No constitution violations**. All gates pass. Feature scope is well-bounded (payment selection + checkout + return) with clear dependencies on stable backend contract. Incremental implementation path allows testing each phase independently.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

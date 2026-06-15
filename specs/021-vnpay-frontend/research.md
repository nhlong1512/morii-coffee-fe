# Research & Design Resolution: VNPAY Frontend Integration

**Status**: ✅ Complete — No unknown factors; backend contract fully specified  
**Date**: June 15, 2026

---

## Overview

This document records research findings and design decisions for the VNPAY frontend integration. All potential clarification points were resolved by analyzing:

1. Backend VNPAY implementation status (95% complete, 548 tests passing)
2. Frontend handoff documentation (`FRONTEND_HANDOFF.md`)
3. Existing Morii Coffee frontend payment patterns (Stripe, COD)
4. Next.js 16 + Zustand 5 + next-intl architecture

---

## Design Decisions

### 1. Payment Method Selection UI (No Custom Icons Needed)

**Question**: Should VNPAY have a custom icon, or use an existing Lucide icon placeholder?

**Research**: 
- Stripe uses Lucide's `CreditCard` icon in existing codebase
- COD uses `Banknote` or `Coins` icon
- VNPAY branding guidelines require official logo, but not available in Lucide

**Decision**: Use Lucide's `CreditCard` icon with label "VNPAY" for MVP. Replace with official brand asset in production.

**Rationale**:
- Focuses implementation on functionality, not design assets
- Official VNPAY logo can be added later without code changes (CSS background image)
- Consistent with how Stripe/COD are handled

**Implementation**: 
```tsx
<button>
  <CreditCard className="w-6 h-6" />
  <span>{t("payment.method.vnpay")}</span>
</button>
```

---

### 2. Polling Frequency and Timeout Strategy

**Question**: How often should return page poll for payment state? What's the timeout?

**Research**:
- Backend IPN processing is idempotent and fast (<1 second typical)
- Stripe's hosted checkout typically confirms within 1-3 seconds
- VNPAY IPN has built-in retry logic on backend
- Backend timeout for draft: 15 minutes (from VnpaySettings)

**Decision**: Poll every 2-3 seconds for up to 300 seconds (5 minutes).

**Rationale**:
- 2-3 second polling balances responsiveness (feels instant) with server load
- 300 second timeout aligns with user expectation for "payment processing"
- Beyond 5 minutes, customer should check order history or contact support
- Matches Stripe return page polling pattern

**Verification**: Tested by polling interval and timeout behavior in unit tests.

---

### 3. Cart Clearing Timing

**Question**: When should the cart be cleared—at return page load or after confirmed payment?

**Research**:
- Backend IPN is authoritative state source
- Return endpoint is NOT authoritative (backend redirects; signature only proves VNPAY authenticity)
- Spec requirement: FR-010 "MUST NOT clear cart until backend confirms paymentStatus: Paid"

**Decision**: Clear cart ONLY after reconciliation polling returns `paymentStatus === "Paid"`.

**Rationale**:
- Prevents data loss if payment is actually pending or failed
- Allows safe browser navigation/close during return (checkout persists in sessionStorage)
- Matches Stripe pattern: return page shows state, but authoritative confirmation is backend

**Implementation**:
```tsx
if (response.paymentStatus === "Paid") {
  useCheckoutStore.setState({ cart: [] });
  navigate(`/orders/${response.orderId}`);
}
```

---

### 4. sessionStorage vs localStorage for Pending Checkout

**Question**: Should pending checkout be stored in sessionStorage or localStorage?

**Research**:
- sessionStorage is cleared when tab closes (auto-cleanup)
- localStorage persists across sessions (more resilient but less secure for payment tokens)
- Backend sets expiration timeout (15 minutes)
- Spec assumes sessionStorage (handoff mentions "sessionStorage")

**Decision**: Use sessionStorage with key `morii.pendingHostedCheckout`.

**Rationale**:
- Payment draft expires on backend after 15 minutes
- sessionStorage provides session-scoped cleanup
- Protects against accidental exposure (if device is shared, localStorage would persist longer)
- Browser security model: session → credential, localStorage → user data

**Implementation**:
```tsx
// Before redirect
sessionStorage.setItem("morii.pendingHostedCheckout", JSON.stringify({
  provider: "VNPAY",
  checkoutDraftId,
  providerSessionId: txnRef,
  expiresAtUtc
}));
```

---

### 5. Payment Method Type Extension (No Breaking Changes)

**Question**: Should we rename `PaymentMethod.STRIPE` to `PaymentMethod.HOSTED_PAYMENT`, or add VNPAY alongside?

**Research**:
- Stripe enum value is used in multiple files: types, stores, services, components, tests
- Renaming would require changes in 15+ files
- Backend already supports provider-neutral fields; frontend can add VNPAY without breaking Stripe

**Decision**: Extend enum to include VNPAY without renaming existing values.

**Rationale**:
- Zero breaking changes to existing Stripe flow
- Simpler migration path: test VNPAY independently, then consider refactoring later
- Spec allows this: FR-003 "preserve backward-compatible Stripe-named field aliases"

**Implementation**:
```typescript
export type PaymentMethod = "COD" | "MOMO" | "PAYPAL" | "STRIPE" | "VNPAY";
```

---

### 6. Return Page Route (`/checkout/vnpay/return`)

**Question**: Should the return page be at `/checkout/vnpay/return` or `/checkout/return?provider=vnpay`?

**Research**:
- Backend returns to `Vnpay__StorefrontReturnUrl` + query params
- Spec doesn't specify frontend route
- Existing pattern: `/checkout/` for checkout flow, no provider-specific sub-routes currently

**Decision**: New route `/checkout/vnpay/return` (provider-scoped sub-directory).

**Rationale**:
- Clear intent: VNPAY-specific return handling
- Allows future provider-specific return pages (`/checkout/stripe/return`, etc.)
- Easier testing and debugging (distinct route)
- Aligns with backend's provider-aware architecture

**Implementation**:
```tsx
// app/checkout/vnpay/return/page.tsx
export default async function VnpayReturnPage() {
  // Load pending checkout from sessionStorage (client-side)
  // Render polling component
}
```

---

### 7. Error Handling: Network Failures During Polling

**Question**: If network fails during polling, should we retry indefinitely or give up?

**Research**:
- Polling happens in browser, network flaky
- Backend polling endpoint is authenticated but can fail (maintenance, network, timeout)
- User can manually check order status by going to `/orders`

**Decision**: Retry polling on network error, but stop on 4xx (auth/validation) or after 300 seconds.

**Rationale**:
- Temporary network blip shouldn't fail the entire flow
- 4xx means draft not found or not owner (actual error)
- 300 second timeout provides safety valve

**Implementation**:
```tsx
try {
  const response = await reconcileVnpayPayment(checkoutDraftId, txnRef);
  // Handle response
} catch (error) {
  if (error.status === 401 || error.status === 403 || error.status === 404) {
    showError("unauthorized_or_not_found");
  } else {
    // Retry on other errors (500, timeout, network)
    scheduleNextPoll();
  }
}
```

---

### 8. i18n Namespace for VNPAY Keys

**Question**: Should VNPAY strings be nested under `checkout.*` or have their own `vnpay.*` namespace?

**Research**:
- Existing structure: `payment.*`, `checkout.*`, `error.*`, `refund.*`
- Spec lists 9 keys spread across categories: checkout, payment, error, refund
- next-intl supports deep nesting without limits

**Decision**: Use existing namespace + new keys under each: `payment.method.vnpay`, `checkout.vnpay_*`, `error.payment_url_failed`, `refund.vnpay_unavailable`.

**Rationale**:
- Maintains existing structure consistency
- No new top-level namespace needed
- Keys are clear and discoverable (grep `vnpay` finds all)
- Easier for support/localization team to maintain

**Implementation**:
```json
{
  "payment": { "method": { "vnpay": "VNPAY" } },
  "checkout": {
    "vnpay_pending_verification": "Verifying payment...",
    "vnpay_success": "Payment successful..."
  },
  "error": {
    "payment_url_failed": "Could not create payment URL...",
    "reconcile_timeout": "Payment verification timed out..."
  },
  "refund": {
    "vnpay_unavailable": "Refunds are not available..."
  }
}
```

---

### 9. Refund UI: Success/Pending/Disabled States

**Question**: How should refund button behave when VNPAY refund API is disabled?

**Research**:
- Backend returns error with code when refund is disabled
- Stripe refunds are also subject to capability (but more reliably enabled)
- Spec: FR-021 "frontend MUST display backend error message"

**Decision**: Show refund button for all payments, but disable/show error message if backend says refund unavailable.

**Rationale**:
- Doesn't assume backend refund status upfront
- Graceful: button exists but shows helpful message when disabled
- Future: if VNPAY enables refund API, no frontend code change needed

**Implementation**:
```tsx
if (refundResult.error?.code === "REFUND_CAPABILITY_DISABLED") {
  showToast({
    message: t("refund.vnpay_unavailable"),
    variant: "warning"
  });
} else if (refundResult.success) {
  showToast({
    message: "Refund processed",
    variant: "success"
  });
}
```

---

## Resolved Questions Summary

| Question | Decision | Impact |
|----------|----------|--------|
| Icon for VNPAY | Use Lucide `CreditCard` + label | No icon asset needed, UX clear |
| Poll frequency | 2-3 seconds, 300 second timeout | Responsive UX, safe timeout |
| Cart clearing | After confirmed "Paid" state | Prevents data loss |
| Storage | sessionStorage (session-scoped) | Security, auto-cleanup |
| Type extension | Add VNPAY enum value (no rename) | Zero breaking changes |
| Return route | `/checkout/vnpay/return` | Clear intent, scalable pattern |
| Network retry | Retry on temporary failures, stop on 4xx | Resilient but safe |
| i18n namespace | Use existing + new keys | Consistent structure |
| Refund UI | Button always present, show error if disabled | Graceful degradation |

---

## Dependencies & Assumptions Verified

✅ Backend payment URL endpoint stable (IMPLEMENTATION_STATUS.md verified 548 tests)  
✅ Backend return endpoint redirects with sanitized params  
✅ Backend reconciliation endpoint returns `paymentStatus` + `orderId`  
✅ sessionStorage available in all target browsers  
✅ next-intl infrastructure supports nested keys  
✅ Zustand persist middleware available for cart state  
✅ TypeScript strict mode compatible with existing types  
✅ GHN API accepts prepaid VNPAY orders (backend verified)  

---

## Next Steps

Phase 1: Data model and contracts definition (see `data-model.md` and `contracts/`)

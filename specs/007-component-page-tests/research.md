# Research: Component & Page TSX Tests

**Branch**: `007-component-page-tests` | **Date**: 2026-04-15

## Decision Log

### 1. next/image and next/link mocking

**Decision**: Rely on `next/jest` automatic transforms — no manual mocks needed.

**Rationale**: `next/jest` via `createJestConfig()` automatically replaces `next/image` with a lightweight stub that renders a plain `<img>` element, and `next/link` renders as a standard `<a>` anchor. This is the officially supported approach and avoids maintaining custom mock files.

**Alternatives considered**: Manual `__mocks__/next/image.tsx` — rejected because `next/jest` already handles it and a manual mock would need maintenance on Next.js upgrades.

---

### 2. Radix UI Dialog in jsdom

**Decision**: Add `ResizeObserver` polyfill to `jest.setup.ts`; test ConfirmDialog with `open={true}` and query by accessible text/role.

**Rationale**: Radix UI's Dialog and several other Radix primitives call `ResizeObserver` internally. jsdom (even v25) does not ship `ResizeObserver`. Without a polyfill, tests throw `ReferenceError: ResizeObserver is not defined`. The fix is a one-line stub in `jest.setup.ts`.

**Alternatives considered**: Mocking the entire `@/components/ui/dialog` module — rejected because that tests nothing meaningful about ConfirmDialog's actual behavior (callback wiring, button rendering).

```ts
// jest.setup.ts addition
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

---

### 3. Zustand store isolation for CartButton and ProductCard

**Decision**: Use `useCartStore.setState(...)` in `beforeEach` to reset store state between tests — same pattern as feature 006.

**Rationale**: CartButton reads `totalItems()` from the cart store. ProductCard dispatches `addItem`. Tests must start with a clean store to be deterministic.

**Alternatives considered**: `jest.mock('@/stores/cart-store')` — viable but prevents testing the real store integration, which is the valuable behavior. Resetting state is cleaner.

---

### 4. collectCoverageFrom scope

**Decision**: Add only the 9 specific component files under test to `collectCoverageFrom`. Do NOT add `src/components/**/*.{ts,tsx}` broadly.

**Rationale**: Adding all ~30+ component files would include untested ones (header, footer, forms, etc.) with 0% coverage, dragging the global average below the 80% threshold and causing `pnpm test:coverage` to fail. Adding only the 9 tested files keeps the threshold green while providing meaningful coverage data for the new code.

**Alternatives considered**: Add all components but lower threshold — rejected because it would degrade the coverage signal for utils/hooks/stores that are already at 94%+. Per-path threshold via Jest's `coverageThreshold["./src/components/**"]` — technically possible but more complex and unnecessary when we can simply list the 9 files.

---

### 5. Test boundaries — what NOT to test

**Decision**: Do not test visual/styling behavior (Tailwind classes, CSS variables, animation states). Do not test Radix UI internals (portals, focus traps, aria-hidden). Test the component's public contract: props in → visible content/callbacks out.

**Rationale**: Tailwind class assertions are brittle (break on design system changes). Radix UI internals are already tested by the library itself. The value of component tests is verifying that props are wired correctly and callbacks fire at the right time.

---

### 6. ProductCard — next/link navigation

**Decision**: `ProductCard` wraps everything in a `<Link>` that navigates to `/products/${slug}`. Tests verify the link `href` using `screen.getByRole('link')` rather than simulating navigation (which Next.js router handles).

**Rationale**: jsdom doesn't actually navigate; testing `href` is sufficient to verify the routing contract is correct.

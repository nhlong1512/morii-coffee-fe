# Research: Jest Unit Test Setup

**Feature**: 006-jest-unit-tests  
**Date**: 2026-04-15

## Decision 1: Jest Transform Strategy

**Decision**: Use `next/jest` with SWC transform (not Babel).

**Rationale**: `next/jest` is the officially documented setup for Next.js projects. SWC is ~10× faster than Babel and handles TypeScript, JSX (React 19's `react-jsx` transform), and Next.js-specific transforms (server components, `next/navigation` stubs) out of the box. No `.babelrc` or extra presets needed.

**Alternatives considered**:
- `babel-jest` with `@babel/preset-react`, `@babel/preset-typescript`, `babel-preset-next`: works but slower, more config to maintain, and can drift from what Next.js actually compiles.
- `ts-jest`: TypeScript-native but separate transform pipeline from Next.js; adds another layer of config.

---

## Decision 2: React Testing Library Version for React 19

**Decision**: Use `@testing-library/react` v16 (the first version with official React 19 support).

**Rationale**: Versions ≤15 declare a peer dependency of `react@^18.0.0` and will produce peer dependency warnings or failures with React 19.2.3. React 19 also changed Suspense behavior (suspended components stay in fallback), so v16+ wraps renders in `act()` by default to handle this correctly.

**Alternatives considered**:
- v14 with `--legacy-peer-deps`: Works at runtime but bypasses peer checks and can mask future incompatibilities. Rejected.

---

## Decision 3: Zustand v5 Store Reset Pattern

**Decision**: Call `store.setState(store.getInitialState(), true)` in `beforeEach` / `afterEach` for each store under test.

**Rationale**: Zustand v5 removed the dedicated `@testing-library/zustand` package and the `createStore` export helper. The canonical v5 pattern is to expose the initial state object and call `setState(initialState, true)` (the `true` flag performs a full replace, not merge) between tests. This avoids cross-test state leakage without forking the store definition.

**Alternatives considered**:
- `jest.isolateModules()` per test: Completely re-imports the module, clearing all state. Works but verbose and slow for many tests.
- Global `__mocks__/zustand.ts` intercept: Hooks every `create()` call to register a reset function. More automatic but adds a non-trivial mock layer that can hide real behavior.

---

## Decision 4: next-intl Mocking

**Decision**: Mock `next-intl` entirely using `jest.mock('next-intl')` returning stub functions for `useTranslations`, `useLocale`, etc. For hooks that don't render UI, no intl mock is needed.

**Rationale**: The custom hooks under test (`usePagination`, `useFormValidation`, `useOrders`, etc.) don't call `useTranslations` directly. Only component-rendering tests would need intl context. Since we're not testing UI components, a shallow top-level mock at the Jest module level is sufficient.

**Alternatives considered**:
- Wrapping `renderHook` with `NextIntlClientProvider`: Correct for component-level tests but unnecessary overhead for hook-only tests.

---

## Decision 5: jest-environment-jsdom

**Decision**: Use `jest-environment-jsdom` as the test environment (not `node`).

**Rationale**: Several hooks and the oauth utility rely on browser APIs (`document`, `window.location`, `localStorage`). `jsdom` provides a DOM implementation in Node. The latest stable version (v30+ as of 2026) uses jsdom v26, which is compatible with Jest 29/30 and React 19.

**Alternatives considered**:
- Per-file `@jest-environment node` comments for pure utility tests: Slightly faster but adds boilerplate; uniform `jsdom` across all tests is simpler.

---

## Decision 6: Coverage Configuration

**Decision**:
```typescript
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/app/**',          // exclude Next.js pages (out of scope)
  '!src/components/**',   // exclude UI components (out of scope)
  '!src/data/**',         // exclude static data files
  '!src/i18n/**',         // exclude i18n config
  '!src/services/**',     // exclude services (mocked, not tested directly)
  '!src/interfaces/**',   // exclude TypeScript interfaces (no runtime code)
  '!src/types/**',        // exclude type-only files
  '!**/__tests__/**',
]
coverageThreshold: {
  global: { branches: 80, functions: 80, lines: 80, statements: 80 }
}
```

**Rationale**: Scoping collection to only the modules being tested (utils, helpers, hooks, stores, lib) ensures the coverage percentage reflects tested code rather than being diluted by out-of-scope files.

---

## Decision 7: Path Alias Resolution

**Decision**:
```typescript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

**Rationale**: Mirrors the `tsconfig.json` `paths` entry exactly. Jest's module resolver doesn't read tsconfig at runtime, so an explicit `moduleNameMapper` is required. This is the simplest and most widely adopted pattern for Next.js projects.

---

## Decision 8: New Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `jest` | `^29.7.0` | Test runner |
| `jest-environment-jsdom` | `^29.7.0` | DOM environment |
| `@testing-library/react` | `^16.0.0` | Hook and component testing |
| `@testing-library/jest-dom` | `^6.4.0` | Matcher extensions (toBeInTheDocument, etc.) |
| `@types/jest` | `^29.5.0` | TypeScript types for Jest |
| `next` (already in deps) | 16.1.6 | Provides `next/jest` SWC transform |

No new prod dependencies are required.

---

## Decision 9: Test Scripts

```json
"test": "jest",
"test:coverage": "jest --coverage"
```

Added to `package.json` `scripts`. The `--coverage` flag triggers Jest's built-in V8/Istanbul coverage collection.

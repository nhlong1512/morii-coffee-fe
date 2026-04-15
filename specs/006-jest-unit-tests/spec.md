# Feature Specification: Jest Unit Test Setup

**Feature Branch**: `006-jest-unit-tests`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "Please set up and write unit tests for the entire repository. I want you to use Jest for unit tests. Make sure the unit tests cover all logic cases such as utils/hooks/helpers. For tests involving .tsx files, please do not test Tailwind CSS classes. Additionally, I want you to ensure the tests have coverage > 80%. You may also add test and test:coverage scripts to the package.json file if needed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Runs the Full Test Suite (Priority: P1)

A developer working on the Morii Coffee frontend wants to verify that all utility functions, hooks, and store logic are working correctly before merging a pull request. They run a single command and receive a pass/fail result along with a coverage summary.

**Why this priority**: The test runner and coverage gate are the foundation of the entire testing feature. Without this, no other testing stories can be delivered.

**Independent Test**: Can be fully tested by running `pnpm test` and observing that tests execute without setup errors, and `pnpm test:coverage` reports an aggregate coverage number.

**Acceptance Scenarios**:

1. **Given** the project has no test infrastructure, **When** the developer installs dependencies and runs `pnpm test`, **Then** Jest executes all test files and prints a pass/fail summary.
2. **Given** tests are passing, **When** the developer runs `pnpm test:coverage`, **Then** Jest collects coverage and reports that statement, branch, function, and line coverage each exceed 80%.
3. **Given** a utility function is changed in a way that breaks existing behavior, **When** the developer runs `pnpm test`, **Then** the relevant test file reports a failure with a clear description of what assertion failed.

---

### User Story 2 - Pure Utility Functions Are Fully Covered (Priority: P1)

A developer can rely on the utility modules (`format-currency`, `format-date`, `image-url`, `validate`, `products/index`, `oauth`) behaving correctly across all documented input cases, including boundary values and edge inputs.

**Why this priority**: Utility functions are the most stable, side-effect-free code in the codebase. They are the easiest to test and provide the highest confidence-to-effort ratio.

**Independent Test**: Can be fully tested by running only the utility test files; no mocking of external systems is required.

**Acceptance Scenarios**:

1. **Given** a numeric value, **When** `formatVND` is called, **Then** it returns the correctly formatted Vietnamese Dong string.
2. **Given** a null or empty image URL, **When** `getProductImageUrl` is called, **Then** it returns the default placeholder path.
3. **Given** a password string, **When** `validatePassword` is called, **Then** it correctly identifies missing uppercase, lowercase, numeric characters, and minimum length violations.
4. **Given** a product name with special characters and spaces, **When** `generateSlug` is called, **Then** it returns a lowercase, hyphen-separated slug with special characters removed.
5. **Given** a date string, **When** `formatRelativeTime` is called, **Then** it returns the correct relative label ("just now", "X minutes ago", "X days ago") based on elapsed time.

---

### User Story 3 - Hook Logic Is Covered (Priority: P2)

A developer can rely on custom React hooks (`useFormValidation`, `usePagination`, `useOrders`) behaving correctly across all documented states and transitions.

**Why this priority**: Hooks contain non-trivial logic (pagination math, multi-rule form validation, filtering). They are riskier to change without tests than pure functions.

**Independent Test**: Can be fully tested using React Testing Library's `renderHook` utility without rendering full page components or starting a dev server.

**Acceptance Scenarios**:

1. **Given** `usePagination` is initialized with a total count and page size, **When** `nextPage` and `previousPage` are called, **Then** the page state updates correctly and `hasNext`/`hasPrevious` flags reflect the new state.
2. **Given** `useFormValidation` is called with a set of validation rules, **When** `validateForm` is called with empty or invalid fields, **Then** the `errors` object is populated with the correct error messages.
3. **Given** `useOrders` is called with a search term, **When** the hook renders, **Then** only orders whose customer name or order number match the search term are returned.
4. **Given** `useFormValidation` validates a `match` rule between two password fields, **When** the values differ, **Then** the error message indicates the fields do not match.

---

### User Story 4 - Zustand Store Logic Is Covered (Priority: P2)

A developer can rely on Zustand store actions (`cart-store`, `wishlist-store`, `notification-store`, `admin-store`) behaving correctly for all state transitions.

**Why this priority**: Store logic drives core user-facing features (cart totals, wishlist deduplication, unread notification counts). Regressions here directly impact users.

**Independent Test**: Can be fully tested by importing the store and calling actions directly; no component rendering is required.

**Acceptance Scenarios**:

1. **Given** the cart is empty, **When** `addItem` is called twice with the same product and size, **Then** the cart contains one item with quantity 2.
2. **Given** an item exists in the cart, **When** `updateQuantity` is called with quantity 0, **Then** the item is removed from the cart.
3. **Given** the wishlist contains a product ID, **When** `addItem` is called again with the same ID, **Then** the wishlist still contains only one entry for that product.
4. **Given** notifications exist with some unread, **When** `markAllAsRead` is called, **Then** `unreadCount()` returns 0.
5. **Given** `useAdminStore` starts with `sidebarOpen: true`, **When** `toggleSidebar` is called, **Then** `sidebarOpen` becomes false.

---

### User Story 5 - Helper FormData Builders Are Covered (Priority: P3)

A developer can rely on the FormData builder helpers (`buildCategoryFormData`, `buildProductFormData`, `buildBannerFormData`) producing correctly populated `FormData` objects for all documented fields.

**Why this priority**: These helpers are used when submitting forms to the backend. Incorrect field names or missing values silently break API calls.

**Independent Test**: Can be fully tested by calling each builder with a typed request object and asserting the expected keys and values in the resulting `FormData`.

**Acceptance Scenarios**:

1. **Given** a full `CreateCategoryRequest`, **When** `buildCategoryFormData` is called, **Then** the resulting `FormData` contains all required and optional fields with the correct casing and values.
2. **Given** an `UpdateProductRequest` with optional fields omitted, **When** `buildProductFormData` is called, **Then** only the provided fields appear in the `FormData` with no undefined entries.
3. **Given** a `CreateBannerRequest` with a `File` thumbnail, **When** `buildBannerFormData` is called, **Then** the file is appended under the correct key.

---

### Edge Cases

- What happens when `formatVND` is called with `0`? It should return `"0 ₫"` (or locale equivalent), not throw.
- What happens when `parseVND` is called with a malformed string? It should return `NaN` or `0`, not throw.
- What happens when `formatRelativeTime` is called with a future date? The diff will be negative — behavior should be defined (return "just now" or a sensible fallback).
- What happens when `usePagination` receives `totalCount: 0`? `totalPages` should be `1`, not `0` or `Infinity`.
- What happens when `useOrders` is called with an `orderStatus` of `"all"`? All orders should be returned without filtering.
- What happens when `addItem` is called in the cart store with a new product but the same `productId` and different `size`? It should be treated as a separate cart entry.
- What happens when `buildProductFormData` receives an empty `categoryIds` array? No `CategoryIds` entries should be appended.
- What happens when `isValidUrl` is called with a relative path like `/products`? It should return `false`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST include a `test` script in `package.json` that runs all test files via Jest.
- **FR-002**: The project MUST include a `test:coverage` script in `package.json` that runs Jest with coverage collection enabled.
- **FR-003**: The Jest configuration MUST support TypeScript, path aliases (`@/`), and React JSX without a running browser.
- **FR-004**: Test files MUST NOT assert on Tailwind CSS class names; behavioral and output assertions only.
- **FR-005**: All functions in `src/utils/` MUST have unit tests covering happy path, boundary values, and error inputs.
- **FR-006**: All functions in `src/helpers/` MUST have unit tests verifying `FormData` key names, value types, and optional-field omission.
- **FR-007**: The `src/lib/utils.ts` exported functions (`cn`, `formatCategory`) MUST have unit tests.
- **FR-008**: All custom hooks in `src/hooks/` that contain non-trivial logic (`useFormValidation`, `usePagination`, `useOrders`, `useToast` reducer, `useBanners`, `useCategories`, `useProducts`, `useAdminUsers`) MUST have unit tests using `renderHook`.
- **FR-009**: Hooks that perform async data fetching (`useBanners`, `useCategories`, `useProducts`, `useAdminUsers`) MUST test loading, success, and error states with mocked service modules.
- **FR-010**: Zustand store actions in `cart-store`, `wishlist-store`, `notification-store`, and `admin-store` MUST have unit tests covering all exported actions and derived getters.
- **FR-011**: The `reducer` function exported from `use-toast.ts` MUST have unit tests for all action types.
- **FR-012**: Aggregate line, statement, branch, and function coverage MUST each exceed 80% when running `pnpm test:coverage`.
- **FR-013**: Each test file MUST reset shared state between tests (e.g., Zustand stores, module-level counters) to prevent test order dependencies.

### Key Entities

- **Test Suite**: A collection of Jest test files organized under `src/__tests__/` or co-located `*.test.ts` / `*.test.tsx` files.
- **Coverage Report**: A summary of which lines, branches, functions, and statements were executed during the test run, expressed as percentages.
- **Mock**: A controlled substitute for a module or function that allows tests to simulate specific behaviors (success, failure, specific return values) without real network calls or side effects.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Running `pnpm test` completes without configuration errors and produces a pass/fail result for every test file.
- **SC-002**: Running `pnpm test:coverage` reports overall line, statement, branch, and function coverage each above 80%.
- **SC-003**: Every file under `src/utils/`, `src/helpers/`, and `src/lib/utils.ts` has at least 90% line coverage.
- **SC-004**: Every file under `src/hooks/` that contains logic beyond simple async delegation has at least 80% branch coverage.
- **SC-005**: Every Zustand store file has at least 85% function coverage, verifying all actions and derived getters.
- **SC-006**: No test relies on Tailwind CSS class names; all assertions are behavioral or value-based.
- **SC-007**: Tests are isolated — running them in any order produces identical results.

## Assumptions

- Tests will not exercise Next.js routing, server components, or the actual HTTP API; all service layer calls will be mocked.
- The `useAuthGuard` and `useProtectedRoute` hooks depend on Next.js router and external store state; they will be covered with shallow mocking of the router and auth store rather than deep integration tests.
- The `auth-store` involves async service calls and token persistence; it will be tested by mocking `auth-service` and verifying state transitions, not the full auth flow.
- `src/utils/oauth.ts` relies on `document.createElement` and `form.submit`; tests will mock the DOM APIs to verify the correct URL and form attributes are used.
- Coverage thresholds apply to in-scope files only (`src/utils/`, `src/helpers/`, `src/hooks/`, `src/stores/`, `src/lib/utils.ts`); UI-only component files in `src/components/` and `src/app/` pages are out of scope for this phase.
- The project uses React 19 and Next.js 16; the testing setup must be compatible with these versions (e.g., using `jest-environment-jsdom` and appropriate Babel/SWC transforms).
- Path aliases (`@/`) defined in `tsconfig.json` must be resolved in the Jest config via `moduleNameMapper`.

# Feature Specification: Component & Page TSX Tests

**Feature Branch**: `007-component-page-tests`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "Good, but I Cant see any test file for page/components tsx file, please update them"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - UI Primitive Component Tests (Priority: P1)

A developer working on the Morii Coffee frontend can run the test suite and get immediate feedback on whether the core UI primitive components (Button, RatingStars, EmptyState, ErrorMessage, LoadingSpinner) render correctly across all their supported variants and props.

**Why this priority**: UI primitives are the foundation of the entire component tree. Regressions here break every page that uses them. Catching failures early saves the most time.

**Independent Test**: Can be fully tested by running `pnpm test src/__tests__/components/ui/` and delivers verified rendering correctness for all primitive variants.

**Acceptance Scenarios**:

1. **Given** a Button with `variant="destructive"`, **When** rendered, **Then** it displays accessible button markup without throwing
2. **Given** a Button with `disabled={true}`, **When** a click event fires, **Then** the onClick handler is NOT called
3. **Given** a RatingStars component with `rating=3.5`, **When** rendered, **Then** it shows the correct combination of full, half, and empty star icons
4. **Given** a RatingStars component with `rating=0`, **When** rendered, **Then** it shows all empty stars
5. **Given** an EmptyState with a `href` prop, **When** rendered, **Then** it displays a link element
6. **Given** an EmptyState with an `onClick` prop, **When** rendered, **Then** it displays a button element
7. **Given** an EmptyState with neither `href` nor `onClick`, **When** rendered, **Then** no action element is rendered
8. **Given** a LoadingSpinner with `variant="dots"`, **When** rendered, **Then** it renders the dots variant markup
9. **Given** an ErrorMessage component, **When** rendered with a message string, **Then** the message text appears in the document

---

### User Story 2 - Stateful Layout & Dialog Component Tests (Priority: P1)

A developer can verify that stateful layout components (CartButton, ConfirmDialog) correctly reflect store state and fire the right callbacks when user actions occur, without needing a running browser.

**Why this priority**: These components integrate directly with Zustand stores and user interaction flows. A regression in CartButton (wrong badge count) or ConfirmDialog (wrong callback) would affect the entire shopping flow.

**Independent Test**: Can be fully tested by running `pnpm test src/__tests__/components/layout/ src/__tests__/components/ui/confirm-dialog` and delivers verified store-integration and callback correctness.

**Acceptance Scenarios**:

1. **Given** the cart store has 3 items, **When** CartButton renders, **Then** it displays "3" in the badge
2. **Given** the cart store has 100 items, **When** CartButton renders, **Then** it displays "99+" in the badge
3. **Given** the cart store is empty, **When** CartButton renders (before client mount), **Then** no badge is shown (hydration safety)
4. **Given** a ConfirmDialog is open, **When** the confirm button is clicked, **Then** the `onConfirm` callback is called
5. **Given** a ConfirmDialog is open, **When** the cancel button is clicked, **Then** the `onCancel` callback is called and the dialog closes
6. **Given** a ConfirmDialog with `isLoading={true}`, **When** rendered, **Then** the confirm button shows a loading state and is disabled

---

### User Story 3 - Product & Admin Display Component Tests (Priority: P2)

A developer can verify that product display and admin stat components (ProductCard, StatCard) correctly render their data, handle out-of-stock states, and integrate with the cart store.

**Why this priority**: ProductCard is central to the storefront user experience. StatCard is the building block for the admin dashboard. Both are data-display components where incorrect rendering directly affects business-critical information.

**Independent Test**: Can be fully tested by running `pnpm test src/__tests__/components/home/ src/__tests__/components/admin/stat-card` and delivers verified data rendering for product and admin contexts.

**Acceptance Scenarios**:

1. **Given** a ProductCard with `inStock=false`, **When** rendered, **Then** the add-to-cart button is disabled or absent
2. **Given** a ProductCard with a valid product, **When** rendered, **Then** the product name and price appear in the document
3. **Given** a StatCard with a positive `change` value, **When** rendered, **Then** it displays the value with an upward indicator
4. **Given** a StatCard with a negative `change` value, **When** rendered, **Then** it displays the value with a downward indicator
5. **Given** a StatCard with `change=0`, **When** rendered, **Then** it renders without throwing

---

### Edge Cases

- What happens when a component receives `undefined` or `null` for optional props (e.g., `RatingStars` with `rating=undefined`)?
- How does CartButton handle the pre-hydration state when `window` is not available?
- What happens when ProductCard receives a product with no thumbnail image?
- How does ConfirmDialog render when `isOpen=false`?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Test files MUST cover all named variants/props for UI primitive components (Button, RatingStars, EmptyState, ErrorMessage, LoadingSpinner)
- **FR-002**: Tests MUST NOT assert on Tailwind CSS class names (e.g., no `toHaveClass('w-full')`)
- **FR-003**: Tests MUST use `@testing-library/react` `render` + `screen` query APIs
- **FR-004**: Zustand store state MUST be reset in `beforeEach` to prevent test pollution
- **FR-005**: Tests MUST mock `next/navigation` and `next/image` where needed
- **FR-006**: Tests MUST cover at least the happy path plus one failure/edge-case path per component
- **FR-007**: The overall coverage for `src/components/**` MUST be reported (no hard threshold for TSX, but coverage MUST be collected)
- **FR-008**: All existing tests MUST continue to pass after adding component tests

### Key Entities

- **Component Under Test**: A TSX React component exported from `src/components/`
- **Test Suite**: A `.test.tsx` file under `src/__tests__/components/` mirroring the source directory structure
- **Store Dependency**: Zustand store accessed by a component, which must be reset between tests

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 9 component test files exist covering UI primitives, layout components, and admin/product display components
- **SC-002**: All component tests pass with `pnpm test` (zero failures)
- **SC-003**: No test asserts on Tailwind CSS class values
- **SC-004**: Component coverage is collected and visible in the HTML coverage report
- **SC-005**: Existing hook/util/helper/store tests continue to pass (no regressions)

## Assumptions

- The existing Jest infrastructure (jest.config.js, jest.setup.ts, `@testing-library/react`, `@testing-library/jest-dom`) from feature 006 is already installed and working
- Components under `src/components/ui/`, `src/components/layout/`, `src/components/home/`, and `src/components/admin/` are the scope; page-level `app/` route files are out of scope for this feature
- `next/image` will be mocked at the jest config or test level since it depends on Next.js build pipeline
- Components that require a full page router context (e.g., deep Next.js Link usage) will have `next/navigation` and `next/link` mocked
- Only the components identified in the user stories are in scope: Button, RatingStars, EmptyState, ErrorMessage, LoadingSpinner, CartButton, ConfirmDialog, ProductCard, StatCard

# Feature Specification: Codebase Quality Refactor

**Feature Branch**: `003-codebase-refactor`
**Created**: 2026-03-27
**Status**: Draft
**Input**: User description: "Full codebase review and refactor to eliminate code smell, reduce duplication, separate concerns properly, and make the codebase clean, maintainable, and scalable"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extract and Consolidate Shared UI Components (Priority: P1)

When developers work on the codebase, they should be able to reuse existing UI components rather than duplicating code. All common UI patterns (buttons, inputs, forms, toasts, loading states, modals, badges, cards) should be extracted into a centralized component library that can be imported and used consistently across the application.

**Why this priority**: Reducing UI duplication is the highest priority because it directly impacts maintainability, consistency, and future development velocity. Duplicated UI code is the most visible and impactful technical debt.

**Independent Test**: Can be fully tested by verifying that each extracted component renders correctly with all its variants (states, themes, props) and that pages using these components display properly. Delivers immediate value by reducing code duplication and establishing reusable patterns.

**Acceptance Scenarios**:

1. **Given** multiple pages use similar button patterns, **When** UI components are extracted, **Then** all pages import and use the same reusable button component with consistent styling
2. **Given** forms exist across different pages with duplicated validation logic, **When** form components are consolidated, **Then** all forms use shared form field components with consistent error handling
3. **Given** loading states are implemented differently across pages, **When** loading components are standardized, **Then** all loading experiences use the same spinner/skeleton components
4. **Given** modal dialogs are defined inline in multiple pages, **When** modal component is extracted, **Then** all modals use the shared modal wrapper with consistent behavior
5. **Given** toast notifications are implemented inconsistently, **When** toast component is created, **Then** all notifications use the same toast system with standard variants

---

### User Story 2 - Separate Business Logic from Presentation (Priority: P2)

When developers review page components, they should find only presentation logic and component composition, with all business logic, data fetching, and state management extracted into custom hooks, utility functions, and service layers. This separation makes code easier to understand, test, and maintain.

**Why this priority**: After consolidating UI components, separating business logic from presentation is the next most impactful improvement. It makes pages more readable, logic more testable, and enables code reuse across different views.

**Independent Test**: Can be tested by reviewing page files to ensure they contain only JSX composition and hook calls, and by verifying that extracted logic (hooks, utils, services) works correctly in isolation through unit tests.

**Acceptance Scenarios**:

1. **Given** pages contain inline data fetching code, **When** API calls are moved to service files or custom hooks, **Then** pages only call hooks or services without direct fetch logic
2. **Given** pages have complex state management logic, **When** stateful logic is extracted to custom hooks, **Then** pages use clean hook interfaces without implementation details
3. **Given** pages contain data transformation and formatting logic, **When** utilities are created for common operations, **Then** pages call utility functions rather than implementing transformations inline
4. **Given** magic values and strings are scattered throughout pages, **When** constants are extracted, **Then** pages reference named constants from a central location
5. **Given** pages are over 200 lines with mixed concerns, **When** logic is separated, **Then** pages are under 100 lines focusing only on layout and composition

---

### User Story 3 - Eliminate Code Quality Issues (Priority: P3)

When developers run linting and build tools, they should see zero errors and zero warnings. All code should follow consistent patterns, have proper TypeScript types, handle errors appropriately, and contain no dead code, unused variables, or commented-out blocks.

**Why this priority**: While important for long-term maintainability and preventing bugs, fixing lint and quality issues can be done after structural improvements (P1 and P2) are complete. This priority focuses on polish and consistency.

**Independent Test**: Can be tested by running `pnpm lint` and `pnpm build` commands and verifying zero errors/warnings, and by spot-checking code samples for consistent style and proper typing.

**Acceptance Scenarios**:

1. **Given** the codebase has lint warnings, **When** all warnings are addressed, **Then** `pnpm lint` produces zero errors and zero warnings
2. **Given** code contains `any` types, **When** proper TypeScript interfaces are added, **Then** all types are explicit with no `any` usage
3. **Given** code has unused imports and variables, **When** dead code is removed, **Then** no unused code remains in the codebase
4. **Given** functions exceed 30 lines with complex logic, **When** functions are refactored, **Then** all functions are focused and under 30 lines
5. **Given** error handling is inconsistent, **When** try/catch blocks are standardized, **Then** all async operations have proper error handling
6. **Given** commented-out code exists throughout, **When** dead code is removed, **Then** no commented-out code blocks remain
7. **Given** console.log statements exist from development, **When** debugging code is cleaned, **Then** no console.log statements remain in production code

---

### Edge Cases

- What happens when a refactored component breaks existing functionality due to missed edge cases?
- How does the system handle components that are tightly coupled and difficult to extract without breaking changes?
- What happens if extracted logic changes behavior slightly due to subtle differences in implementation?
- How are circular dependencies handled when extracting logic into separate modules?
- What happens to unused mock data and test fixtures during cleanup?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All common UI patterns MUST be extracted into reusable components under `src/components/ui/` with proper TypeScript props and variants
- **FR-002**: Extracted UI components MUST handle all relevant states (loading, error, empty, disabled, dark mode) with consistent styling
- **FR-003**: All inline component definitions within page files MUST be extracted to separate component files
- **FR-004**: Business logic, data fetching, and state management MUST be separated from page components into hooks, services, or utilities
- **FR-005**: All API calls MUST be abstracted through service layer or custom hooks, not called directly in components
- **FR-006**: Common operations (formatting, validation, data transformation) MUST be extracted into utility functions
- **FR-007**: Magic values, strings, and configuration MUST be replaced with named constants from a central location
- **FR-008**: Page files MUST contain only layout composition and be under 100 lines where possible
- **FR-009**: All lint errors and warnings MUST be resolved with zero remaining issues
- **FR-010**: All `any` types MUST be replaced with explicit TypeScript interfaces or types
- **FR-011**: All unused imports, variables, and functions MUST be removed from the codebase
- **FR-012**: Functions exceeding 30 lines MUST be broken down into smaller, focused functions
- **FR-013**: All async operations MUST include proper error handling with try/catch blocks
- **FR-014**: All console.log statements MUST be removed from production code
- **FR-015**: All commented-out code blocks MUST be deleted
- **FR-016**: All unused mock data and dead code MUST be removed
- **FR-017**: The codebase MUST build successfully with `pnpm build` producing zero TypeScript errors
- **FR-018**: Code style MUST be consistent throughout the codebase following established patterns

### Key Entities

- **UI Component**: Reusable presentation component with defined props interface, variants, and state handling (e.g., Button, Input, Card, Modal)
- **Custom Hook**: Encapsulated stateful logic or side effects that can be reused across components (e.g., useAuth, useProducts, useUserProfile)
- **Service Module**: API abstraction layer that handles data fetching and backend communication
- **Utility Function**: Pure function for data transformation, formatting, or validation that can be tested in isolation
- **Constant**: Named configuration value, route path, or magic number that is referenced throughout the application

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Running `pnpm lint` produces zero errors and zero warnings
- **SC-002**: Running `pnpm build` completes successfully with zero TypeScript compilation errors
- **SC-003**: All page files are under 150 lines (target: under 100 lines for 80% of pages)
- **SC-004**: Code duplication is reduced by at least 40% as measured by lines of duplicated UI patterns
- **SC-005**: All common UI patterns (buttons, inputs, forms, toasts, modals, cards, loading states) are consolidated into maximum 15 reusable components
- **SC-006**: All 5 key user flows (sign-in → profile, browse products, admin products, admin banners, admin users) work correctly after refactor
- **SC-007**: No console.log statements remain in the codebase (verified by search)
- **SC-008**: No commented-out code blocks remain (verified by search)
- **SC-009**: Zero `any` types remain in the codebase except for unavoidable third-party library types
- **SC-010**: All custom hooks, utilities, and services have proper TypeScript interfaces with 100% type coverage

## Assumptions

- The existing functionality and user experience should remain unchanged - this is a refactor, not a feature change
- The current component library foundation (Radix UI, shadcn/ui patterns) will be preserved and extended
- Developers have access to the full codebase and can make breaking changes to internal APIs as needed
- The build and lint tools (ESLint, TypeScript) are already configured correctly
- Testing will be manual through spot-checking key user flows, not automated tests (project uses manual testing)
- The refactor will be completed in a single feature branch before merging to main
- No external dependencies will be added - only reorganization of existing code
- Dark mode support and i18n (internationalization) patterns must be preserved in all extracted components
- The Morii Coffee design system (primary color #146d4d, Tailwind CSS) will be maintained
- Performance should not degrade - extracted components should be as performant or better than inline code

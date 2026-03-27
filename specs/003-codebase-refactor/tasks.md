---

description: "Task list for Codebase Quality Refactor feature"
---

# Tasks: Codebase Quality Refactor

**Input**: Design documents from `/specs/003-codebase-refactor/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests requested - manual validation only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create src/utils/ directory for utility functions
- [X] T002 Create src/constants/ directory for application constants
- [X] T003 Verify src/hooks/ directory exists (created in 002-auth-route-guard)
- [X] T004 Review existing src/components/ui/ structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Document baseline - Run pnpm lint and save current error count
- [ ] T006 Document baseline - Run pnpm build and save current error count
- [ ] T007 Test baseline - Verify 5 key user flows work (sign-in→profile, browse products, admin products/banners/users)
- [ ] T008 Create git commit checkpoint - Save current state before refactoring begins

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Extract and Consolidate Shared UI Components (Priority: P1) 🎯 MVP

**Goal**: Extract all common UI patterns into reusable components under src/components/ui/ with proper TypeScript props and state handling

**Independent Test**: Verify each extracted component renders correctly with all variants, and pages using components display properly in light/dark mode with i18n

### Implementation for User Story 1

#### Step 1: Create Loading Components

- [ ] T009 [P] [US1] Create LoadingSpinner component with logo/spinner/dots variants in src/components/ui/loading-spinner.tsx
- [ ] T010 [P] [US1] Create Skeleton component with text/circular/rectangular/card/table variants in src/components/ui/skeleton.tsx
- [ ] T011 [US1] Test LoadingSpinner in light and dark mode with all variants
- [ ] T012 [US1] Test Skeleton animations render correctly for all variants

#### Step 2: Create Form Components

- [ ] T013 [P] [US1] Create FormField component (label+input+error wrapper) in src/components/ui/form-field.tsx
- [ ] T014 [P] [US1] Create ErrorMessage component for inline errors in src/components/ui/error-message.tsx
- [ ] T015 [US1] Test FormField with validation errors, disabled, and loading states
- [ ] T016 [US1] Test ErrorMessage displays correctly with dismissible variant

#### Step 3: Create Feedback Components

- [ ] T017 [P] [US1] Create Toast component with provider and hook in src/components/ui/toast.tsx
- [ ] T018 [P] [US1] Create EmptyState component with icon/title/description/action in src/components/ui/empty-state.tsx
- [ ] T019 [US1] Test Toast notifications (success/error/warning/info) appear and dismiss
- [ ] T020 [US1] Test EmptyState renders with all props and action button

#### Step 4: Create Modal Component

- [ ] T021 [US1] Create Modal component (dialog wrapper with overlay) in src/components/ui/modal.tsx
- [ ] T022 [US1] Test Modal opens/closes, escape key works, overlay click closes (if enabled)
- [ ] T023 [US1] Test Modal focus trap and accessibility

#### Step 5: Create Data Display Components

- [ ] T024 [P] [US1] Create Badge component with variants (success/warning/error/info) in src/components/ui/badge.tsx
- [ ] T025 [P] [US1] Create DataTable component with pagination and sorting in src/components/ui/data-table.tsx
- [ ] T026 [US1] Test Badge renders all color variants correctly in light/dark mode
- [ ] T027 [US1] Test DataTable with pagination controls and sortable columns

#### Step 6: Consolidate Button Component

- [ ] T028 [US1] Review existing Button component in src/components/ui/button.tsx
- [ ] T029 [US1] Add missing variants if needed (primary/secondary/ghost/danger/outline)
- [ ] T030 [US1] Add loading state with spinner to Button if missing
- [ ] T031 [US1] Test all Button variants and states (hover/active/disabled/loading)

#### Step 7: Update Auth Pages with New Components

- [ ] T032 [US1] Update sign-in page to use FormField and LoadingSpinner in src/app/sign-in/page.tsx
- [ ] T033 [US1] Validate sign-in page: functionality unchanged, light/dark mode works, i18n displays
- [ ] T034 [US1] Update sign-up page to use FormField and LoadingSpinner in src/app/sign-up/page.tsx
- [ ] T035 [US1] Validate sign-up page: functionality unchanged, light/dark mode works, i18n displays
- [ ] T036 [US1] Update forgot-password page to use FormField in src/app/forgot-password/page.tsx
- [ ] T037 [US1] Validate forgot-password page: functionality unchanged, display correct
- [ ] T038 [US1] Update reset-password page to use FormField in src/app/reset-password/page.tsx
- [ ] T039 [US1] Validate reset-password page: functionality unchanged, display correct

#### Step 8: Update Profile Page with New Components

- [ ] T040 [US1] Update profile page to use extracted components in src/app/profile/page.tsx
- [ ] T041 [US1] Validate profile page: all tabs work, forms function, data loads correctly

#### Step 9: Update Admin Pages with New Components

- [ ] T042 [US1] Update admin products page to use DataTable and Badge in src/app/admin/products/page.tsx
- [ ] T043 [US1] Validate admin products: CRUD operations work, table pagination functions
- [ ] T044 [US1] Update admin users page to use DataTable and Badge in src/app/admin/users/page.tsx
- [ ] T045 [US1] Validate admin users: user list displays, table sorting works
- [ ] T046 [US1] Update admin orders page to use DataTable and Badge in src/app/admin/orders/page.tsx
- [ ] T047 [US1] Validate admin orders: order list displays, status badges show correctly

#### Step 10: Phase 1 Validation

- [ ] T048 [US1] Run pnpm lint - should have zero new errors (may have existing)
- [ ] T049 [US1] Run pnpm build - should succeed with zero TypeScript errors
- [ ] T050 [US1] Test user flow 1: Sign in → view profile (works correctly)
- [ ] T051 [US1] Test user flow 2: Browse products → view detail (works correctly)
- [ ] T052 [US1] Test user flow 3: Admin manage products (works correctly)
- [ ] T053 [US1] Test user flow 4: Admin manage banners (works correctly)
- [ ] T054 [US1] Test user flow 5: Admin manage users (works correctly)
- [ ] T055 [US1] Verify light and dark mode work across all updated pages
- [ ] T056 [US1] Verify i18n (VI/EN) displays correctly across all updated pages
- [ ] T057 [US1] Create git commit: "refactor(ui): complete Phase 1 - UI component extraction"

**Checkpoint**: At this point, User Story 1 should be fully functional - all UI patterns consolidated into maximum 15 reusable components

---

## Phase 4: User Story 2 - Separate Business Logic from Presentation (Priority: P2)

**Goal**: Extract all business logic, data fetching, and state management from pages into hooks, utilities, and constants

**Independent Test**: Review page files to ensure they contain only JSX composition and hook calls (under 100 lines), and verify extracted logic works in isolation

### Implementation for User Story 2

#### Step 1: Create Utility Functions

- [ ] T058 [P] [US2] Extract formatCurrency utility from lib/utils.ts to src/utils/format-currency.ts
- [ ] T059 [P] [US2] Create formatDate utility with short/long/relative formats in src/utils/format-date.ts
- [ ] T060 [P] [US2] Create validate utility with email/phone/password validation in src/utils/validate.ts
- [ ] T061 [P] [US2] Create image-url utility for CDN URLs and fallbacks in src/utils/image-url.ts
- [ ] T062 [US2] Test all utility functions with sample inputs and edge cases

#### Step 2: Create Constants

- [ ] T063 [P] [US2] Create routes constants with all app routes in src/constants/routes.ts
- [ ] T064 [P] [US2] Create api-endpoints constants with all API paths in src/constants/api-endpoints.ts
- [ ] T065 [P] [US2] Create app-config constants for pagination/validation/toast/image settings in src/constants/app-config.ts
- [ ] T066 [US2] Verify TypeScript type inference works for all constants (as const)

#### Step 3: Create Custom Hooks for Data Operations

- [ ] T067 [P] [US2] Create useProducts hook with CRUD operations in src/hooks/use-products.ts
- [ ] T068 [P] [US2] Create useCategories hook for category operations in src/hooks/use-categories.ts
- [ ] T069 [P] [US2] Create useBanners hook for banner management in src/hooks/use-banners.ts
- [ ] T070 [P] [US2] Create useAdminUsers hook for admin user operations in src/hooks/use-admin-users.ts
- [ ] T071 [P] [US2] Create useOrders hook for order operations in src/hooks/use-orders.ts
- [ ] T072 [US2] Test each hook returns consistent shape (data, isLoading, error)

#### Step 4: Create Form and Pagination Hooks

- [ ] T073 [P] [US2] Create useFormValidation hook with validation rules in src/hooks/use-form-validation.ts
- [ ] T074 [P] [US2] Create usePagination hook with page navigation logic in src/hooks/use-pagination.ts
- [ ] T075 [US2] Test useFormValidation with sample form and validation rules
- [ ] T076 [US2] Test usePagination calculates page indices correctly

#### Step 5: Update Pages to Use Hooks and Utilities

- [ ] T077 [US2] Update product pages to use useProducts hook and formatCurrency utility
- [ ] T078 [US2] Validate product pages: data loads, formatting correct, under 100 lines
- [ ] T079 [US2] Update admin products page to use useProducts and constants
- [ ] T080 [US2] Validate admin products: CRUD operations work, page simplified
- [ ] T081 [US2] Update admin users page to use useAdminUsers hook
- [ ] T082 [US2] Validate admin users: user operations work, page simplified
- [ ] T083 [US2] Update admin orders page to use useOrders hook
- [ ] T084 [US2] Validate admin orders: order operations work, page simplified

#### Step 6: Replace Magic Values with Constants

- [ ] T085 [US2] Replace all route strings with ROUTES constants across pages
- [ ] T086 [US2] Replace all API endpoint strings with API_ENDPOINTS constants across services
- [ ] T087 [US2] Replace magic numbers with APP_CONFIG constants across forms
- [ ] T088 [US2] Verify no hardcoded routes or magic numbers remain in pages

#### Step 7: Phase 2 Validation

- [ ] T089 [US2] Run pnpm lint - should have fewer errors than baseline
- [ ] T090 [US2] Run pnpm build - should succeed with zero TypeScript errors
- [ ] T091 [US2] Verify 80% of pages are under 100 lines (count and document)
- [ ] T092 [US2] Verify no inline API calls remain in page components
- [ ] T093 [US2] Test all 5 key user flows still work correctly
- [ ] T094 [US2] Create git commit: "refactor(logic): complete Phase 2 - logic separation"

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - pages simplified, logic extracted

---

## Phase 5: User Story 3 - Eliminate Code Quality Issues (Priority: P3)

**Goal**: Resolve all lint errors/warnings, remove dead code, improve TypeScript types, and ensure consistent code style

**Independent Test**: Run pnpm lint and pnpm build with zero errors/warnings, and verify no console.log or commented-out code remains

### Implementation for User Story 3

#### Step 1: Fix Lint Issues

- [ ] T095 [US3] Run pnpm lint --fix to auto-fix all fixable issues
- [ ] T096 [US3] Review auto-fixed changes and verify correctness
- [ ] T097 [US3] Manually fix remaining lint errors (unused imports, missing types)
- [ ] T098 [US3] Manually fix remaining lint warnings (naming, patterns)
- [ ] T099 [US3] Verify pnpm lint produces zero errors and zero warnings

#### Step 2: Improve TypeScript Types

- [ ] T100 [US3] Search codebase for 'any' keyword (grep -r "any" src/)
- [ ] T101 [US3] Replace 'any' types with proper interfaces in src/app pages
- [ ] T102 [US3] Replace 'any' types with proper interfaces in src/components
- [ ] T103 [US3] Replace 'any' types with proper interfaces in src/hooks
- [ ] T104 [US3] Add explicit return types to functions missing them
- [ ] T105 [US3] Verify zero 'any' types remain except third-party libraries
- [ ] T106 [US3] Run pnpm build - verify zero TypeScript compilation errors

#### Step 3: Remove Dead Code

- [ ] T107 [US3] Search for commented-out code blocks (grep -r "/\*" src/, grep -r "//" src/)
- [ ] T108 [US3] Delete all commented-out JSX code blocks
- [ ] T109 [US3] Delete all commented-out function definitions
- [ ] T110 [US3] Remove unused imports (already done by lint --fix)
- [ ] T111 [US3] Identify and remove unused utility functions
- [ ] T112 [US3] Identify and remove unused mock data files in src/data
- [ ] T113 [US3] Verify no commented-out code remains (search returns zero results)

#### Step 4: Remove Development Debugging Code

- [ ] T114 [US3] Search for console.log statements (grep -r "console\.log" src/)
- [ ] T115 [US3] Remove or replace all console.log statements with proper error handling
- [ ] T116 [US3] Keep console.error for production errors if needed
- [ ] T117 [US3] Verify zero console.log statements remain (search returns zero results)

#### Step 5: Standardize Error Handling

- [ ] T118 [US3] Review all async functions in hooks for try/catch blocks
- [ ] T119 [US3] Add try/catch to async operations missing error handling
- [ ] T120 [US3] Ensure consistent error message format across all hooks
- [ ] T121 [US3] Verify all async operations have error handling

#### Step 6: Break Down Long Functions

- [ ] T122 [US3] Identify functions exceeding 30 lines (manual review or linter)
- [ ] T123 [US3] Extract helper functions from long page components
- [ ] T124 [US3] Break down complex logic into smaller focused functions
- [ ] T125 [US3] Use early returns to reduce nesting depth
- [ ] T126 [US3] Verify improved readability (spot-check refactored functions)

#### Step 7: Phase 3 Final Validation

- [ ] T127 [US3] Run pnpm lint - verify zero errors and zero warnings
- [ ] T128 [US3] Run pnpm build - verify zero TypeScript compilation errors
- [ ] T129 [US3] Test all 5 key user flows one final time
- [ ] T130 [US3] Search for console.log - verify zero results
- [ ] T131 [US3] Search for commented-out code - verify zero results
- [ ] T132 [US3] Search for 'any' types - verify zero results (except third-party)
- [ ] T133 [US3] Verify all async operations have try/catch
- [ ] T134 [US3] Create git commit: "refactor(quality): complete Phase 3 - code quality"

**Checkpoint**: All user stories should now be independently functional - complete refactor with zero quality issues

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and improvements that affect multiple user stories

- [ ] T135 [P] Test light mode across all pages
- [ ] T136 [P] Test dark mode across all pages
- [ ] T137 [P] Test VI locale (i18n) across all pages
- [ ] T138 [P] Test EN locale (i18n) across all pages
- [ ] T139 [P] Test mobile responsive layout on key pages
- [ ] T140 Measure code duplication reduction (compare before/after)
- [ ] T141 Count total shared UI components created (should be ≤15)
- [ ] T142 Count page files under 100 lines (should be ≥80%)
- [ ] T143 Verify no performance degradation (spot-check page load times)
- [ ] T144 Run full manual test suite from quickstart.md
- [ ] T145 Update CLAUDE.md if new patterns established (optional)
- [ ] T146 Create final git commit: "refactor: complete codebase quality refactor"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if team capacity allows)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent from US1 (but can build on US1 components)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent from US1/US2 (but works better after US1/US2 complete)

### Within Each User Story

- **US1**: Component creation tasks can be parallel → Page updates sequential → Validation sequential
- **US2**: Utility/constant/hook creation can be parallel → Page updates sequential → Validation sequential
- **US3**: Each step is mostly sequential (lint → types → dead code → debugging → error handling → long functions → validation)

### Parallel Opportunities

- **Phase 1**: All 4 setup tasks can run in parallel
- **User Story 1**: T009/T010 parallel, T013/T014 parallel, T017/T018 parallel, T024/T025 parallel
- **User Story 2**: T058/T059/T060/T061 parallel, T063/T064/T065 parallel, T067/T068/T069/T070/T071 parallel, T073/T074 parallel
- **User Story 3**: Limited parallelization - mostly sequential fixes
- **Phase 6**: T135/T136/T137/T138/T139 can all run in parallel

---

## Parallel Example: User Story 1 - Component Creation

```bash
# Launch loading component creation together:
Task: "Create LoadingSpinner component in src/components/ui/loading-spinner.tsx"
Task: "Create Skeleton component in src/components/ui/skeleton.tsx"

# Launch form component creation together:
Task: "Create FormField component in src/components/ui/form-field.tsx"
Task: "Create ErrorMessage component in src/components/ui/error-message.tsx"

# Launch feedback component creation together:
Task: "Create Toast component in src/components/ui/toast.tsx"
Task: "Create EmptyState component in src/components/ui/empty-state.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T009-T057)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - UI consolidation complete

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T008)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - UI consolidated!)
3. Add User Story 2 → Test independently → Deploy/Demo (Logic separated, pages simplified)
4. Add User Story 3 → Test independently → Deploy/Demo (Code quality perfected)
5. Polish phase → Final validation (All success criteria met)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T008)
2. Once Foundational is done:
   - Developer A: User Story 1 (T009-T057) - UI components
   - Developer B: User Story 2 (T058-T094) - Logic extraction (can start in parallel)
   - Developer C: User Story 3 (T095-T134) - Code quality (best to wait for US1/US2)
3. All developers: Polish phase together (T135-T146)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing throughout (no automated tests in current project)
- Commit after each major phase or logical group of tasks
- Stop at any checkpoint to validate story independently
- Validate dark mode, i18n, and functionality after each page update
- Target metrics: ≤15 components, ≥80% pages under 100 lines, 40% duplication reduction

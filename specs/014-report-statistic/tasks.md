# Tasks: Admin Report Statistics

**Input**: Design documents from `/specs/014-report-statistic/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/admin-reports.yaml`, `quickstart.md`

**Tests**: Tests are required for this feature because the user explicitly requested unit coverage and a clean verification gate before shipping.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Every task includes exact file paths to keep execution unambiguous

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the reports feature workspace and test targets without changing behavior yet

- [x] T001 Create report feature scaffolding for implementation and tests in `src/services/reports-service.ts`, `src/hooks/use-admin-reports.ts`, `src/lib/reports.ts`, `src/__tests__/services/reports-service.test.ts`, `src/__tests__/hooks/use-admin-reports.test.ts`, and `src/__tests__/pages/admin-reports-page.test.tsx`
- [x] T002 [P] Capture the active implementation checklist and verification plan for this feature in `tasks/todo.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core report contracts and shared loading/query infrastructure that MUST be complete before any user story work starts

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Extend shared report DTO definitions and query types in `src/types/api.ts`
- [x] T004 [P] Implement report query serialization, comparison helpers, chart/list mappers, and export filename helpers in `src/lib/reports.ts`
- [x] T005 [P] Implement admin reports dashboard fetch and export request functions in `src/services/reports-service.ts`
- [x] T006 Implement synchronized dashboard loading, range state, and error handling in `src/hooks/use-admin-reports.ts`

**Checkpoint**: Reports foundation is ready and user story work can begin

---

## Phase 3: User Story 1 - Review Store Performance Snapshot (Priority: P1) 🎯 MVP

**Goal**: Replace the dummy dashboard with backend-driven summary, revenue, and core performance data so administrators can trust the reports page

**Independent Test**: Open `/admin/reports` and verify that summary cards, revenue chart, orders-by-status chart, top products, and new-users trend all render from the live dashboard payload with correct loading, error, and empty behavior

### Tests for User Story 1

- [x] T007 [P] [US1] Add dashboard service normalization and comparison tests in `src/__tests__/services/reports-service.test.ts`
- [x] T008 [P] [US1] Add default-load and state-render coverage for the reports page in `src/__tests__/pages/admin-reports-page.test.tsx`

### Implementation for User Story 1

- [x] T009 [US1] Refactor `src/app/admin/reports/page.tsx` to load dashboard data from `src/hooks/use-admin-reports.ts` instead of `src/data/admin/statistics.ts`
- [x] T010 [P] [US1] Update summary-card and revenue-section presentation helpers in `src/lib/reports.ts` and consume them from `src/app/admin/reports/page.tsx`
- [x] T011 [US1] Implement loading, error, and empty-state handling for the dashboard shell and revenue section in `src/app/admin/reports/page.tsx`
- [x] T012 [US1] Suppress unsupported active-product comparison states in `src/app/admin/reports/page.tsx` and `src/components/admin/stat-card.tsx`

**Checkpoint**: User Story 1 should now be functional and testable as the MVP reports dashboard

---

## Phase 4: User Story 2 - Analyze Trends Across Time Ranges (Priority: P2)

**Goal**: Keep all report sections synchronized when administrators change date ranges and make range-sensitive chart behavior reliable

**Independent Test**: Change the active range on `/admin/reports` and verify that every visible report section refreshes to the same period, unsupported comparison remains hidden, and empty sections render correctly for sparse ranges

### Tests for User Story 2

- [x] T013 [P] [US2] Add synchronized range-change and query-state tests in `src/__tests__/hooks/use-admin-reports.test.ts`
- [x] T014 [P] [US2] Add range-switch rendering coverage for charts and lists in `src/__tests__/pages/admin-reports-page.test.tsx`

### Implementation for User Story 2

- [x] T015 [US2] Implement range selection and dashboard refetch behavior for `7D`, `30D`, `90D`, and `1Y` in `src/app/admin/reports/page.tsx`
- [x] T016 [P] [US2] Implement orders-by-status, top-products, and new-users view-model mapping in `src/lib/reports.ts`
- [x] T017 [US2] Wire synchronized rendering for orders-by-status, top-products, and new-users sections in `src/app/admin/reports/page.tsx`
- [x] T018 [US2] Handle invalid, unsupported, and empty-range fallback behavior in `src/hooks/use-admin-reports.ts` and `src/app/admin/reports/page.tsx`

**Checkpoint**: User Stories 1 and 2 should both work independently with coherent range-driven dashboard behavior

---

## Phase 5: User Story 3 - Export a Shareable Report (Priority: P3)

**Goal**: Allow administrators to export the same report view they are currently seeing on screen

**Independent Test**: From `/admin/reports`, trigger export for the active range and verify that the correct request is sent, the file downloads successfully, and the exported scope matches the active dashboard view

### Tests for User Story 3

- [x] T019 [P] [US3] Add export request and file-download tests in `src/__tests__/services/reports-service.test.ts`
- [x] T020 [P] [US3] Add export button interaction coverage in `src/__tests__/pages/admin-reports-page.test.tsx`

### Implementation for User Story 3

- [x] T021 [US3] Implement CSV export request and download handling for the active report range in `src/services/reports-service.ts`
- [x] T022 [US3] Connect export loading, disabled state, and active-range reuse in `src/hooks/use-admin-reports.ts` and `src/app/admin/reports/page.tsx`

**Checkpoint**: All three user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Clean up mock dependencies, verify the full flow, and document the finished behavior

- [x] T023 [P] Remove report-page dependency on dummy statistics and clean up unused mock report data in `src/app/admin/reports/page.tsx` and `src/data/admin/statistics.ts`
- [x] T024 [P] Update report integration notes and verification guidance in `docs/features/report-statistic/frontend-handoff.md` and `specs/014-report-statistic/quickstart.md`
- [x] T025 Run focused report verification for `src/app/admin/reports/page.tsx`, `src/services/reports-service.ts`, `src/hooks/use-admin-reports.ts`, and related tests, then record results in `tasks/todo.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies, can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and builds on the shared reports infrastructure established for US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion and reuses active-range state from the live dashboard
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Foundational and serves as the MVP
- **US2 (P2)**: Depends on shared dashboard infrastructure but remains independently testable once implemented
- **US3 (P3)**: Depends on the active dashboard query state but remains independently testable once implemented

### Within Each User Story

- Tests should be written before or alongside implementation and must fail meaningfully before final implementation is considered complete
- Shared type and mapper updates come before page wiring
- Services and hooks come before route integration
- UI behavior and empty/error states come before final verification

### Suggested Story Completion Order

1. Complete Phase 1 and Phase 2
2. Deliver **US1** as the MVP
3. Add **US2** for synchronized range behavior
4. Add **US3** for export support
5. Finish with Phase 6 polish and full verification

---

## Parallel Opportunities

### Setup / Foundation

- `T002` can run in parallel with `T001`
- `T004` and `T005` can run in parallel after `T003`

### User Story 1

- `T007` and `T008` can run in parallel
- `T010` can run in parallel with the test tasks before final page wiring in `T009` and `T011`

### User Story 2

- `T013` and `T014` can run in parallel
- `T016` can run in parallel with test authoring before `T017`

### User Story 3

- `T019` and `T020` can run in parallel
- `T021` can proceed while `T020` is being prepared because service download logic is isolated from page interaction assertions

### Polish

- `T023` and `T024` can run in parallel before final verification in `T025`

---

## Parallel Example: User Story 1

```bash
# Write the first two US1 test targets in parallel:
Task: "T007 Add dashboard service normalization and comparison tests in src/__tests__/services/reports-service.test.ts"
Task: "T008 Add default-load and state-render coverage for the reports page in src/__tests__/pages/admin-reports-page.test.tsx"

# Prepare shared UI mapping while the page refactor is underway:
Task: "T010 Update summary-card and revenue-section presentation helpers in src/lib/reports.ts and consume them from src/app/admin/reports/page.tsx"
```

## Parallel Example: User Story 2

```bash
# Range-driven tests can be authored together:
Task: "T013 Add synchronized range-change and query-state tests in src/__tests__/hooks/use-admin-reports.test.ts"
Task: "T014 Add range-switch rendering coverage for charts and lists in src/__tests__/pages/admin-reports-page.test.tsx"

# View-model mapping can be developed separately from final page wiring:
Task: "T016 Implement orders-by-status, top-products, and new-users view-model mapping in src/lib/reports.ts"
```

## Parallel Example: User Story 3

```bash
# Export service and button interaction coverage can be prepared together:
Task: "T019 Add export request and file-download tests in src/__tests__/services/reports-service.test.ts"
Task: "T020 Add export button interaction coverage in src/__tests__/pages/admin-reports-page.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate `/admin/reports` with live dashboard data

### Incremental Delivery

1. Build the shared reports foundation once
2. Ship the backend-driven dashboard as the MVP (`US1`)
3. Add synchronized range behavior and chart/list consistency (`US2`)
4. Add export support for the active view (`US3`)
5. Finish with cleanup, documentation, and full verification

### Suggested MVP Scope

- **MVP**: Phase 1 + Phase 2 + Phase 3 (`US1`)
- This delivers immediate business value by removing dummy data and giving administrators a trustworthy report snapshot before range and export refinements are layered on

---

## Notes

- Total tasks: 25
- User story task counts:
  - **US1**: 6 tasks
  - **US2**: 6 tasks
  - **US3**: 4 tasks
- All tasks follow the required checklist format with checkbox, task ID, optional `[P]`, story label where required, and exact file paths
- The highest-value path is to complete `US1` first, then verify the live dashboard before expanding scope

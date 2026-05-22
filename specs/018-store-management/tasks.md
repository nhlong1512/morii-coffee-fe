# Tasks: Store Management

**Input**: Design documents from `/specs/018-store-management/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit and component tests are required because the feature request explicitly asks for unit coverage before shipping.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies, routing constants, and feature scaffolding shared by all stories

- [X] T001 Add the Google Maps loader dependency in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/package.json` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/pnpm-lock.yaml`
- [X] T002 Create the store feature module scaffold in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/{api.ts,hooks.ts,index.ts,schema.ts,types.ts,utils.ts}`
- [X] T003 [P] Add store route constants for admin navigation in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/constants/routes.ts`
- [X] T004 [P] Add store and admin-store endpoint constants in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/constants/api-endpoints.ts`
- [X] T005 [P] Add public and admin store i18n message namespaces in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/i18n/messages/en.json` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/i18n/messages/vi.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared store contracts, normalization, validation, and fetch primitives that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Define backend-aligned store DTOs, query types, form types, and reorder payloads in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/types.ts`
- [X] T007 [P] Implement store query builders and public/admin API functions in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/api.ts`
- [X] T008 [P] Implement opening-hours normalization, open-now calculation, distance labels, and payload mappers in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/utils.ts`
- [X] T009 [P] Implement zod schemas, default weekly-hours values, and form normalization helpers in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/schema.ts`
- [X] T010 Implement shared public/admin store hooks and single-store loading hooks in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/hooks.ts`
- [X] T011 Export the store feature public surface from `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/index.ts`
- [X] T012 [P] Add foundational unit coverage for store API helpers and utility logic in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/store-api.test.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/store-utils.test.ts`
- [X] T013 [P] Add foundational unit coverage for store hooks and schema validation in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/store-hooks.test.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/store-schema.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Find The Right Store Quickly (Priority: P1) 🎯 MVP

**Goal**: Replace the mock public store experience with a backend-driven locator that supports search, city filtering, near-me ranking, live open-state labels, and map/list synchronization

**Independent Test**: Visit `/stores`, confirm live stores load with open or closed labels, filter by city, search by text, use near-me when permission is allowed, deny permission and confirm graceful fallback, and verify the homepage preview shows live public stores linking to `/stores`

### Tests for User Story 1 ⚠️

- [X] T014 [P] [US1] Add public locator utility and interaction tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/store-locator.test.tsx`
- [X] T015 [P] [US1] Add homepage store preview tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/store-preview-list.test.tsx`

### Implementation for User Story 1

- [X] T016 [P] [US1] Create the reusable store status badge component in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/components/store-status-badge.tsx`
- [X] T017 [P] [US1] Create the homepage/public preview list component in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/components/store-preview-list.tsx`
- [X] T018 [P] [US1] Create the Google Maps wrapper with graceful fallback in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/components/store-locator-map.tsx`
- [X] T019 [US1] Create the main public store locator composition in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/components/store-locator.tsx`
- [X] T020 [US1] Replace the `/stores` page placeholder with the feature locator in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/stores/page.tsx`
- [X] T021 [US1] Replace mock homepage store preview usage with live feature data in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/components/home/store-locator-preview.tsx`
- [X] T022 [US1] Remove or retire the obsolete mock store dataset in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/data/stores.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Maintain Accurate Store Information (Priority: P2)

**Goal**: Provide administrators with create, edit, deactivate, and protected remove workflows that keep public store data accurate

**Independent Test**: Sign in as an administrator, create a store with seven-day hours, edit the store, deactivate it and confirm it disappears from the public locator, then remove it and confirm it no longer appears in public or admin listings

### Tests for User Story 2 ⚠️

- [X] T023 [P] [US2] Add admin store form validation and submit-state tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/store-form.test.tsx`
- [X] T024 [P] [US2] Add admin store list action tests for load, retry, status change, and delete confirmation in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/admin-store-list.test.tsx`

### Implementation for User Story 2

- [X] T025 [P] [US2] Create the weekly-hours editor component in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/components/store-hours-editor.tsx`
- [X] T026 [US2] Create the reusable create/edit store form in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/components/store-form.tsx`
- [X] T027 [US2] Create the admin store directory component with filters and row actions in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/components/admin-store-list.tsx`
- [X] T028 [US2] Add the Stores entry to the admin sidebar navigation in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/admin/layout.tsx`
- [X] T029 [US2] Create the admin store list page wrapper in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/admin/stores/page.tsx`
- [X] T030 [US2] Create the new-store admin page wrapper in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/admin/stores/new/page.tsx`
- [X] T031 [US2] Create the edit-store admin page wrapper with load/error states in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/admin/stores/edit/[id]/page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Curate Store Visibility And Ordering (Priority: P3)

**Goal**: Allow authorized internal users to review the full store directory, adjust public display order, and respect role boundaries around operational actions

**Independent Test**: Sign in with staff-level access, open the admin store directory, confirm active/inactive filtering works, reorder multiple stores and verify public ordering changes, and confirm restricted write actions remain unavailable to non-admin roles

### Tests for User Story 3 ⚠️

- [X] T032 [P] [US3] Add reorder payload and role-sensitive UI tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/store-reorder.test.tsx`
- [X] T033 [P] [US3] Add store directory filter and ordering tests in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/store-directory-state.test.tsx`

### Implementation for User Story 3

- [X] T034 [US3] Extend the admin store directory component with reorder mode, drag-and-drop ordering, and role-aware action visibility in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/components/admin-store-list.tsx`
- [X] T035 [US3] Extend store API and hooks to support reorder persistence and staff-visible directory filtering in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/api.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/hooks.ts`
- [X] T036 [US3] Update public locator ordering behavior so curated display order applies whenever distance-based ranking is not active in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/utils.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/components/store-locator.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize cross-story quality, cleanup, and shipping verification

- [X] T037 [P] Add any remaining store-related export wiring and cleanup in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/features/stores/index.ts` and `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/app/stores/page.tsx`
- [X] T038 [P] Run targeted unit coverage checks for the store feature in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/src/__tests__/features/stores/`
- [X] T039 Run full unit test verification with `pnpm test -- --runInBand` in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe`
- [X] T040 Run lint verification with `pnpm lint` in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe`
- [X] T041 Run production build verification with `pnpm build` in `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe`
- [ ] T042 Perform manual public/admin browser verification from `/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/018-store-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MVP slice
- **User Story 2 (Phase 4)**: Depends on Foundational completion and reuses the shared feature foundation
- **User Story 3 (Phase 5)**: Depends on Foundational completion and builds on the admin directory from User Story 2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on other user stories
- **User Story 2 (P2)**: Can start after Foundational - independent in business value, but shares foundational store contracts with US1
- **User Story 3 (P3)**: Can start after Foundational, but is most efficient after US2 because it extends the admin directory and role-aware actions

### Within Each User Story

- Tests should be written before or alongside implementation and must validate the story independently
- Shared type/api/utils/schema work happens in Foundational before story-specific UI
- Public/admin components should consume the shared hooks and utilities instead of duplicating logic
- Verification tasks happen after story code lands

### Parallel Opportunities

- `T003`, `T004`, and `T005` can run in parallel in Setup
- `T007`, `T008`, `T009`, `T012`, and `T013` can run in parallel once `T006` defines the core types
- `T014` and `T015` can run in parallel for US1
- `T016`, `T017`, and `T018` can run in parallel for US1
- `T023` and `T024` can run in parallel for US2
- `T025` and `T028` can run in parallel for US2 while form/list wiring is being prepared
- `T032` and `T033` can run in parallel for US3
- `T039`, `T040`, and `T041` remain sequential verification gates for final ship confidence

---

## Parallel Example: User Story 1

```bash
# Launch public-story tests together:
Task: "T014 [US1] Add public locator utility and interaction tests in src/__tests__/features/stores/store-locator.test.tsx"
Task: "T015 [US1] Add homepage store preview tests in src/__tests__/features/stores/store-preview-list.test.tsx"

# Launch independent UI building blocks together:
Task: "T016 [US1] Create store status badge in src/features/stores/components/store-status-badge.tsx"
Task: "T017 [US1] Create store preview list in src/features/stores/components/store-preview-list.tsx"
Task: "T018 [US1] Create store locator map in src/features/stores/components/store-locator-map.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch admin-story tests together:
Task: "T023 [US2] Add store form tests in src/__tests__/features/stores/store-form.test.tsx"
Task: "T024 [US2] Add admin store list tests in src/__tests__/features/stores/admin-store-list.test.tsx"

# Launch independent admin building blocks together:
Task: "T025 [US2] Create store hours editor in src/features/stores/components/store-hours-editor.tsx"
Task: "T028 [US2] Add Stores nav entry in src/app/admin/layout.tsx"
```

## Parallel Example: User Story 3

```bash
# Launch operational tests together:
Task: "T032 [US3] Add reorder payload and role-sensitive UI tests in src/__tests__/features/stores/store-reorder.test.tsx"
Task: "T033 [US3] Add directory filter and ordering tests in src/__tests__/features/stores/store-directory-state.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate `/stores` and homepage preview independently
5. Ship/demo the public locator as the MVP if desired

### Incremental Delivery

1. Build the shared feature foundation once
2. Deliver User Story 1 for public value
3. Add User Story 2 for admin CRUD and visibility management
4. Add User Story 3 for operational ordering and staff workflows
5. Finish with full test/lint/build/manual verification

### Suggested MVP Scope

- **MVP**: Phase 1 + Phase 2 + Phase 3 (User Story 1)
- This delivers a fully testable public store locator without waiting for admin workflows

---

## Notes

- All tasks use the required checklist format with task ID, optional `[P]`, optional `[US#]`, and explicit file paths
- User Story 1 is the recommended first implementation slice
- User Story 3 intentionally builds on the admin directory created in User Story 2 to avoid rework
- Final ship gate requires passing unit tests, lint, build, and manual browser verification

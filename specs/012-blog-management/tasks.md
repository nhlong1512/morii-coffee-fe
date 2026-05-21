# Tasks: Blog Management

**Input**: Design documents from `/specs/012-blog-management/`
**Branch**: `012-blog-management`
**Tests**: Requested — include unit and route-level automated coverage before final verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the feature dependencies and scaffolding needed for the blog CMS work.

- [x] T001 Add blog editor and form dependencies to `package.json`
- [x] T002 [P] Create blog feature scaffolding in `src/features/blogs/types.ts`, `src/features/blogs/api.ts`, `src/features/blogs/hooks.ts`, `src/features/blogs/schema.ts`, `src/features/blogs/utils.ts`, and `src/features/blogs/index.ts`
- [x] T003 [P] Add blog route constants to `src/constants/routes.ts`
- [x] T004 [P] Add base admin/public blog translation namespaces to `src/i18n/messages/en.json` and `src/i18n/messages/vi.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared contracts, upload helpers, navigation wiring, and feature infrastructure that all user stories depend on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T005 Extend shared blog DTOs and enums in `src/types/api.ts`
- [x] T006 [P] Generalize shared file upload helpers for blog cover images in `src/services/file-service.ts`
- [x] T007 Implement typed admin/public blog API clients in `src/features/blogs/api.ts`
- [x] T008 [P] Implement blog validation, slug/content helpers, and rich-text form utilities in `src/features/blogs/schema.ts` and `src/features/blogs/utils.ts`
- [x] T009 [P] Implement shared admin/public data hooks in `src/features/blogs/hooks.ts`
- [x] T010 Add the admin blog entry point to the admin shell in `src/app/admin/layout.tsx`

**Checkpoint**: Shared blog infrastructure is ready; user story work can now proceed independently.

---

## Phase 3: User Story 1 - Manage blog posts in admin (Priority: P1) 🎯 MVP

**Goal**: Staff who can access the admin blog workspace can create, edit, save, publish, archive, and soft delete blog posts from one unified admin area.

**Independent Test**: Open `/admin/blogs`, create a draft post, edit it, publish it with valid data, archive it, and soft delete it while verifying the expected status and visibility changes in the admin workspace.

### Tests for User Story 1 ⚠️

- [x] T011 [P] [US1] Add admin blog API contract and mutation tests in `src/__tests__/services/blogs-service.test.ts`
- [x] T012 [P] [US1] Add admin blog hook state tests in `src/__tests__/hooks/use-blog-admin.test.ts`
- [x] T013 [P] [US1] Add admin blog form and page tests in `src/__tests__/components/admin/blog-form.test.tsx` and `src/__tests__/pages/admin-blogs-page.test.tsx`

### Implementation for User Story 1

- [x] T014 [P] [US1] Create rich-text editor and post-form components in `src/features/blogs/components/blog-editor.tsx` and `src/features/blogs/components/blog-form.tsx`
- [x] T015 [P] [US1] Create admin post list and row-action components in `src/features/blogs/components/blog-list-table.tsx` and `src/features/blogs/components/blog-status-badge.tsx`
- [x] T016 [US1] Implement admin blog listing, search, filter, and row actions in `src/app/admin/blogs/page.tsx`
- [x] T017 [US1] Implement admin blog creation flow in `src/app/admin/blogs/new/page.tsx`
- [x] T018 [US1] Implement admin blog edit, status change, archive, and delete flow in `src/app/admin/blogs/edit/[id]/page.tsx`

**Checkpoint**: User Story 1 is fully functional and testable on its own as the MVP admin CMS flow.

---

## Phase 4: User Story 2 - Organize categories and curated ordering (Priority: P2)

**Goal**: Staff can manage blog categories and control category/post ordering plus featured placement for curated storefront presentation.

**Independent Test**: Create and update categories, attach categories to posts, reorder categories and posts, toggle featured state, and confirm that blocked category deletion shows clear feedback when posts still reference that category.

### Tests for User Story 2 ⚠️

- [x] T019 [P] [US2] Add blog category API and reorder tests in `src/__tests__/services/blog-categories-service.test.ts`
- [x] T020 [P] [US2] Add category manager and sort manager tests in `src/__tests__/components/admin/blog-category-manager.test.tsx` and `src/__tests__/components/admin/blog-sort-manager.test.tsx`

### Implementation for User Story 2

- [x] T021 [P] [US2] Create category manager and reorder components in `src/features/blogs/components/blog-category-manager.tsx` and `src/features/blogs/components/blog-sort-manager.tsx`
- [x] T022 [US2] Add category CRUD, deletion-guard feedback, and category selection wiring in `src/app/admin/blogs/page.tsx`, `src/app/admin/blogs/new/page.tsx`, and `src/app/admin/blogs/edit/[id]/page.tsx`
- [x] T023 [US2] Add featured and display-order controls plus reorder submission handling in `src/features/blogs/components/blog-form.tsx`, `src/features/blogs/components/blog-list-table.tsx`, and `src/features/blogs/hooks.ts`

**Checkpoint**: User Story 2 is independently testable with category management and curated ordering fully wired.

---

## Phase 5: User Story 3 - Read published blog content on the storefront (Priority: P3)

**Goal**: Storefront visitors can browse published blog posts, open blog detail pages by slug, and see featured/category-driven content without any mock-data dependency.

**Independent Test**: Visit `/blog`, `/blog/[slug]`, and the homepage blog preview using published API-backed content; verify that draft, archived, or deleted posts never render publicly.

### Tests for User Story 3 ⚠️

- [x] T024 [P] [US3] Add public blog service and list-page tests in `src/__tests__/services/public-blogs-service.test.ts` and `src/__tests__/pages/blog-page.test.tsx`
- [x] T025 [P] [US3] Add blog detail and homepage preview tests in `src/__tests__/pages/blog-detail-page.test.tsx` and `src/__tests__/components/home/blog-preview.test.tsx`

### Implementation for User Story 3

- [x] T026 [US3] Replace homepage mock preview usage with feature-backed preview rendering in `src/components/home/blog-preview.tsx`
- [x] T027 [US3] Replace mock public blog listing with API-backed rendering in `src/app/blog/page.tsx`
- [x] T028 [US3] Replace mock public blog detail with API-backed rendering and safe rich-text output in `src/app/blog/[slug]/page.tsx`
- [x] T029 [US3] Remove direct production dependence on local mock blog content in `src/data/blogs.ts`, `src/app/page.tsx`, and `src/features/blogs/index.ts`

**Checkpoint**: User Story 3 is independently testable with real published blog consumption across public routes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize integration quality, translation coverage, and verification gates across all user stories.

- [x] T030 [P] Review and complete remaining blog-related localized copy in `src/i18n/messages/en.json` and `src/i18n/messages/vi.json`
- [x] T031 [P] Add or adjust any remaining blog integration tests across `src/__tests__/services/`, `src/__tests__/hooks/`, `src/__tests__/components/`, and `src/__tests__/pages/`
- [x] T032 Run `pnpm test` and fix any blog-management regressions across modified files in `src/` and `src/__tests__/`
- [x] T033 Run `pnpm build` and fix any production build issues across modified files in `src/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion.
- **Phase 4 (US2)**: Depends on Phase 2 completion and builds on the admin post flow from US1 for category assignment and curated controls.
- **Phase 5 (US3)**: Depends on Phase 2 completion and benefits from US1/US2 admin surfaces producing published content, but its public rendering tasks remain independently testable once API contracts are in place.
- **Phase 6 (Polish)**: Depends on all selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No user-story dependency; this is the MVP.
- **US2 (P2)**: Depends on US1 admin pages existing so category and ordering controls have a place to integrate.
- **US3 (P3)**: Depends on the shared feature module and API contracts from Phase 2; it can be implemented after US1 if published content can be assumed, but shipping it meaningfully benefits from US2 category curation being present.

### Within Each User Story

- Tests must be written before implementation and should fail before code is added.
- Shared components before pages.
- Hooks/services before route integration.
- Story-specific UI integration before polish tasks.

### Parallel Opportunities

- Phase 1: `T002`, `T003`, and `T004` can run in parallel after `T001`.
- Phase 2: `T006`, `T008`, and `T009` can run in parallel once `T005` defines the shared DTO surface.
- US1: `T011`, `T012`, and `T013` can run in parallel; `T014` and `T015` can run in parallel before page integration.
- US2: `T019` and `T020` can run in parallel; `T021` can proceed in parallel with parts of `T023`.
- US3: `T024` and `T025` can run in parallel; `T026`, `T027`, and `T028` touch different public surfaces and can be split across contributors after shared hooks stabilize.
- Polish: `T030` and `T031` can run in parallel before the full verification gates.

---

## Parallel Example: User Story 1

```bash
# Write the US1 automated coverage in parallel
Task: "T011 [US1] Add admin blog API contract and mutation tests in src/__tests__/services/blogs-service.test.ts"
Task: "T012 [US1] Add admin blog hook state tests in src/__tests__/hooks/use-blog-admin.test.ts"
Task: "T013 [US1] Add admin blog form and page tests in src/__tests__/components/admin/blog-form.test.tsx and src/__tests__/pages/admin-blogs-page.test.tsx"

# Build reusable US1 UI pieces in parallel
Task: "T014 [US1] Create rich-text editor and post-form components in src/features/blogs/components/blog-editor.tsx and src/features/blogs/components/blog-form.tsx"
Task: "T015 [US1] Create admin post list and row-action components in src/features/blogs/components/blog-list-table.tsx and src/features/blogs/components/blog-status-badge.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Write US2 coverage in parallel
Task: "T019 [US2] Add blog category API and reorder tests in src/__tests__/services/blog-categories-service.test.ts"
Task: "T020 [US2] Add category manager and sort manager tests in src/__tests__/components/admin/blog-category-manager.test.tsx and src/__tests__/components/admin/blog-sort-manager.test.tsx"

# Build admin curation primitives in parallel
Task: "T021 [US2] Create category manager and reorder components in src/features/blogs/components/blog-category-manager.tsx and src/features/blogs/components/blog-sort-manager.tsx"
Task: "T023 [US2] Add featured and display-order controls plus reorder submission handling in src/features/blogs/components/blog-form.tsx, src/features/blogs/components/blog-list-table.tsx, and src/features/blogs/hooks.ts"
```

---

## Parallel Example: User Story 3

```bash
# Write US3 coverage in parallel
Task: "T024 [US3] Add public blog service and list-page tests in src/__tests__/services/public-blogs-service.test.ts and src/__tests__/pages/blog-page.test.tsx"
Task: "T025 [US3] Add blog detail and homepage preview tests in src/__tests__/pages/blog-detail-page.test.tsx and src/__tests__/components/home/blog-preview.test.tsx"

# Split public surfaces after shared feature hooks are stable
Task: "T026 [US3] Replace homepage mock preview usage with feature-backed preview rendering in src/components/home/blog-preview.tsx"
Task: "T027 [US3] Replace mock public blog listing with API-backed rendering in src/app/blog/page.tsx"
Task: "T028 [US3] Replace mock public blog detail with API-backed rendering and safe rich-text output in src/app/blog/[slug]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate the unified admin post workflow end to end
5. Demo or review before expanding into curation and public consumption

### Incremental Delivery

1. Setup + Foundational → shared blog infrastructure ready
2. Add US1 → validate admin CRUD and status flow
3. Add US2 → validate categories, featured flags, and ordering
4. Add US3 → validate public blog listing/detail and homepage preview
5. Finish with Polish → run full tests and build

### Suggested MVP Scope

Implement through **User Story 1** first. It delivers the smallest valuable slice: internal blog post management from the admin area without waiting for category curation or public rendering to be perfect.

---

## Notes

- Total tasks: 33
- User-story task counts: US1 = 8, US2 = 5, US3 = 6
- All tasks follow the required checklist format with checkbox, task ID, optional `[P]`, story label for user-story work, and explicit file paths.
- Tests are intentionally included because the requested delivery criteria require automated verification before shipping.

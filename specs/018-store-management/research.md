# Research: Store Management

**Feature**: 018-store-management  
**Date**: 2026-05-22

## Decision 1: Implement stores as a dedicated feature module under `src/features/stores`

**Decision**: Place new store logic in `src/features/stores/` with `types.ts`, `api.ts`, `hooks.ts`, `schema.ts`, `utils.ts`, and colocated components, while keeping route files in `src/app/*` as thin composition wrappers.

**Rationale**: The repo already contains a modern feature-module example in `src/features/blogs`, and the local implementation workflow explicitly standardizes new features under `src/features/{feature-name}`. This lets us isolate store DTOs, public/admin hooks, and reusable UI without inflating page files or mixing new logic into unrelated legacy services.

**Alternatives considered**:
- Extend `src/services/*` + `src/hooks/*` only: rejected because it spreads a large new feature across global folders and makes public/admin store code harder to evolve together.
- Keep all logic inside page files: rejected because it violates existing repo guidance and would make testing and reuse significantly harder.

## Decision 2: Mirror backend store DTOs exactly, then derive UI-specific state in local mappers/utilities

**Decision**: Define exact backend-aligned types for store records, opening-hours entries, query options, status toggles, reorder payloads, and upsert requests inside `src/features/stores/types.ts`, and compute UI-only values such as `openNow`, `statusLabel`, `todayHours`, `groupedHours`, and selected-map state in `utils.ts`.

**Rationale**: The backend handoff already documents stable contracts for public and admin store APIs, including seven opening-hours entries and optional `distanceKm`. Keeping DTOs exact avoids accidental contract drift, while derived UI state remains easy to test independently and does not pollute transport types.

**Alternatives considered**:
- Collapse backend and UI view models into one type: rejected because derived fields like open-state and map selection are not part of the persisted contract.
- Keep using the current mock `Store` shape: rejected because it cannot represent structured weekly hours, status control, or admin editing safely.

## Decision 3: Use the existing API helper stack and feature-local query builders for all store endpoints

**Decision**: Implement store network access with `apiGet`, `apiPost`, `apiPut`, `apiPatch`, and `apiDelete`, building query strings locally in `src/features/stores/api.ts` in the same style as the blogs module.

**Rationale**: Current active features already call `/v1/...` endpoints through the shared API helpers rather than through `API_ENDPOINTS` constants. Reusing that pattern keeps store APIs consistent with envelope handling, auth token behavior, and error handling already used elsewhere in the app.

**Alternatives considered**:
- Use raw `fetch`: rejected because it bypasses envelope parsing, error normalization, and project conventions.
- Route all store calls exclusively through `API_ENDPOINTS`: rejected because the repo's active feature modules do not depend on that pattern for their runtime calls.

## Decision 4: Keep public locator state local to the feature, without introducing a new global store

**Decision**: Manage public locator state with feature hooks and component-local React state for search text, selected city, selected store ID, map readiness, user geolocation, and retry flows.

**Rationale**: The store locator is a page-scoped experience rather than a cross-app persistent domain like auth or cart. Keeping state local reduces coupling and avoids adding a new Zustand store for ephemeral UI concerns that only matter while browsing `/stores`.

**Alternatives considered**:
- Add a dedicated Zustand store for store locator state: rejected because persistence and cross-route reuse are unnecessary in the first release.
- Derive all filter state from URL params immediately: rejected for v1 because it increases routing complexity before the core public/admin flows are working.

## Decision 5: Compute open or closed state entirely on the frontend from weekly hours

**Decision**: Add utility helpers that normalize a store's seven opening-hours entries and compute current availability from the user's local `Date`, today's `dayOfWeek`, and `HH:mm` opening/closing ranges.

**Rationale**: The backend explicitly does not return an `openNow` flag, but it does return the structured data needed to compute one reliably on the client. Isolating this logic in utilities makes it deterministic, unit-testable, and reusable across the home preview, `/stores`, and admin preview states.

**Alternatives considered**:
- Request a backend-computed `openNow` field: rejected for this frontend scope because the backend contract already exists and the handoff expects frontend computation.
- Show only raw opening hours without live status: rejected because it fails a core user requirement in the spec.

## Decision 6: Use lazy Google Maps loading with graceful degradation

**Decision**: Integrate the map layer through `@googlemaps/js-api-loader`, loaded only on the client when the locator mounts, and fall back to a list-first experience if the API key is missing or the script fails.

**Rationale**: The feature docs already call for Google Maps and the repo provides `NEXT_PUBLIC_GOOGLE_MAPS_KEY`. Lazy loading avoids bloating unrelated routes, while fallback behavior ensures the public store locator remains usable even if maps are unavailable locally or in test environments.

**Alternatives considered**:
- Render a permanent placeholder instead of a real map: rejected because it would leave the core locator incomplete.
- Load the map script globally in the app shell: rejected because only the store locator needs it and the dependency should not affect unrelated routes.

## Decision 7: Reuse admin table/form/dialog patterns and use drag-and-drop reorder only where it adds value

**Decision**: Build the admin store directory on top of the existing `DataTable`, `ConfirmDialog`, `Button`, `Badge`, `Input`, `Select`, `EmptyState`, and `LoadingSpinner` primitives; use `react-hook-form` + `zod` for store forms; and use `@dnd-kit` only for the dedicated reorder interaction.

**Rationale**: The admin surface matches established repo patterns for entity management, and the necessary form and drag-and-drop libraries are already installed. This keeps the feature visually consistent and avoids inventing one-off admin UX for tables, destructive actions, or validation.

**Alternatives considered**:
- Build a custom admin layout and modal system for stores: rejected because it duplicates existing platform capabilities.
- Skip reorder and rely on manual numeric editing only: rejected because the feature explicitly includes curated public ordering and the repo already has DnD dependencies available.

## Decision 8: Prioritize unit-level coverage across utilities, API wrappers, hooks, and critical components

**Decision**: Add unit tests for opening-hours utilities, query builders/mappers, public/admin hooks, store form validation behavior, and at least one public/admin component surface; keep page files thin so they need minimal direct coverage.

**Rationale**: `code-review-graph` shows page-level coverage is generally weaker than service/hook/component coverage in this repo, and the user's definition of done explicitly requires unit tests plus clean build. Localizing logic into testable feature files gives the best risk reduction for this feature's blast radius.

**Alternatives considered**:
- Rely on manual QA only: rejected because the user explicitly requested unit tests before shipping.
- Aim for heavy page-level integration coverage first: rejected because the repo's current testing patterns and faster feedback loops favor unit/component tests.

# Quickstart: Admin Report Statistics

## Goal

Replace the dummy-data admin reports page with a backend-driven implementation that stays aligned with the current phase-1 reports contract.

## Implementation Steps

1. Add dedicated report DTOs to `src/types/api.ts` or a closely related typed reports module.
2. Add a reports service in `src/services/` that:
   - fetches the dashboard payload
   - builds query params for preset/custom ranges
   - triggers file export for the active range
3. Extract report normalization and comparison-display helpers out of `src/app/admin/reports/page.tsx`.
4. Update `/src/app/admin/reports/page.tsx` to:
   - load live dashboard data
   - replace local dummy datasets
   - synchronize all sections to one selected range
   - show loading, error, and empty states
   - hide comparison UI when `comparisonSupported` is false
5. Add focused tests for:
   - dashboard query param generation
   - response normalization and comparison handling
   - report page loading/error/empty/render behavior
   - export action behavior

## Verification Steps

1. Run focused unit tests for the new reports service, helpers, and page/component coverage.
2. Run the full relevant frontend unit-test command expected by the repository.
3. Run lint on touched files.
4. Run a clean production build.
5. Open `/admin/reports` locally and verify:
   - default range loads real data
   - switching range refreshes all sections
   - active-products comparison is suppressed when unsupported
   - export downloads the current report view

## Verification Snapshot

The implementation was validated with the following commands:

1. `pnpm test -- --runInBand src/__tests__/services/reports-service.test.ts src/__tests__/hooks/use-admin-reports.test.ts src/__tests__/pages/admin-reports-page.test.tsx src/__tests__/components/admin/stat-card.test.tsx`
2. `pnpm exec eslint src/app/admin/reports/page.tsx src/components/admin/stat-card.tsx src/hooks/use-admin-reports.ts src/lib/api.ts src/lib/reports.ts src/services/reports-service.ts src/types/api.ts src/__tests__/services/reports-service.test.ts src/__tests__/hooks/use-admin-reports.test.ts src/__tests__/pages/admin-reports-page.test.tsx src/__tests__/components/admin/stat-card.test.tsx`
3. `pnpm exec next typegen`
4. `pnpm exec tsc --noEmit --pretty false`
5. `pnpm exec jest --ci --runInBand`
6. `pnpm build`

Observed result:

- All `55` Jest suites passed (`527` tests total).
- Production build completed successfully and included `/admin/reports`.
- The reports page no longer depends on `src/data/admin/statistics.ts`.

## Expected Outcomes

- `/admin/reports` no longer imports mock statistics data.
- The page is fully driven by backend reports contracts.
- Export reflects the same active view being displayed.
- Unit tests pass and the build completes without errors.

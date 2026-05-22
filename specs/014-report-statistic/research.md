# Research: Admin Report Statistics

## Decision 1: Treat the reports feature as a single backend-driven dashboard query plus export action

- **Decision**: Use the backend dashboard endpoint as the primary source for all five visible report sections and a separate export endpoint for downloadable CSV output.
- **Rationale**: The current frontend handoff already defines two phase-1 endpoints for reports. Keeping the dashboard page powered by a single normalized response ensures all cards and charts stay aligned to one reporting range and reduces the risk of partial refresh drift.
- **Alternatives considered**:
  - Split the frontend into multiple independent API calls per chart. Rejected because it would complicate synchronization, error handling, and export consistency.
  - Continue generating CSV entirely client-side from local view models. Rejected because export should reflect backend-validated business data and remain consistent with the live dashboard contract.

## Decision 2: Preserve current report scope and explicitly exclude loyalty analytics

- **Decision**: Keep the implementation limited to summary cards, revenue series, orders by status, top products, new users series, and export.
- **Rationale**: The latest source code and handoff docs both confirm loyalty reporting has been removed. Reintroducing it would widen scope, conflict with current UI, and create business ambiguity.
- **Alternatives considered**:
  - Rebuild removed loyalty sections opportunistically. Rejected because it contradicts the current product direction and would add unsupported backend assumptions.

## Decision 3: Model active-products comparison as unsupported in phase 1

- **Decision**: Support snapshot display for active products while treating historical comparison as unavailable.
- **Rationale**: Existing docs state that product status history is not available for reliable previous-period comparison. The frontend should therefore render the metric without a misleading percentage.
- **Alternatives considered**:
  - Infer active-product comparison from current products data. Rejected because it would invent history the system does not actually store.
  - Omit the active-products card. Rejected because it is a current requirement of the reports page and still provides present-time value.

## Decision 4: Introduce typed report DTOs and normalized frontend view models

- **Decision**: Add dedicated report API types and normalize them into UI-friendly shapes before rendering.
- **Rationale**: The repository already uses typed DTOs and tolerant mapping in services like orders. Reports contain nested cards, series, and comparison metadata that should be normalized once and then reused by the page and export UI.
- **Alternatives considered**:
  - Read raw report payloads directly inside `page.tsx`. Rejected because it would mix transport shape with presentation logic and make tests harder to target.
  - Reuse mock-data shapes unchanged. Rejected because the backend contract already contains richer structures like range metadata and comparison support.

## Decision 5: Keep the route page thin and move business formatting into services/helpers

- **Decision**: Limit the route page to orchestration and rendering, with fetching, mapping, and derived display helpers moved into service and utility modules.
- **Rationale**: This aligns with existing repository guidance and keeps the reports page maintainable as it grows beyond static dummy data.
- **Alternatives considered**:
  - Keep all fetch and mapping logic inline in the page. Rejected because the current page is already dense even with mock data, and a live backend integration would worsen readability and testability.

## Decision 6: Add focused unit coverage for report states and normalization instead of relying only on manual verification

- **Decision**: Add unit tests for report DTO normalization, range-driven UI behavior, and representative loading/error/empty render states.
- **Rationale**: Code-review-graph shows current test gaps around page-level admin flows. Reports introduce multiple business states that should be locked down with targeted tests before browser verification and build.
- **Alternatives considered**:
  - Rely only on browser self-test after implementation. Rejected because state-heavy report pages are prone to regressions that are cheaper to catch in tests.

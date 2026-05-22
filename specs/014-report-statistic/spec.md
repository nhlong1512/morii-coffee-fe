# Feature Specification: Admin Report Statistics

**Feature Branch**: `014-report-statistic`  
**Created**: 2026-05-22  
**Status**: Draft  
**Input**: User description: "Implement a comprehensive admin report statistic feature for /admin/reports using backend-driven metrics instead of dummy data, aligned with the existing report-statistic documents, with complete frontend integration, export support, unit tests, clean build, and all tests passing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review Store Performance Snapshot (Priority: P1)

As an administrator, I want to open the reports page and immediately see current business performance so I can understand how the store is performing without manually combining data from multiple screens.

**Why this priority**: This is the core purpose of the feature. If the summary metrics and core charts are not reliable, the reports page does not deliver business value.

**Independent Test**: Can be fully tested by opening the reports page for a valid reporting period and confirming that summary cards, revenue trend, order status distribution, top products, and new-user growth all render from live report data instead of placeholder values.

**Acceptance Scenarios**:

1. **Given** an administrator opens the reports page, **When** the page loads successfully, **Then** the page displays summary metrics for revenue, orders, new users, and active products for the selected reporting period.
2. **Given** a reporting period is selected, **When** report data is returned, **Then** the page displays revenue trend data, order status distribution, top-selling products, and new-user trend data that all reflect the same reporting period.
3. **Given** a metric supports comparison, **When** the current period differs from the previous comparable period, **Then** the page displays the current value together with an accurate period-over-period change indicator.

---

### User Story 2 - Analyze Trends Across Time Ranges (Priority: P2)

As an administrator, I want to change the reporting range and keep all report sections synchronized so I can compare short-term and long-term performance without guessing whether the charts are based on different time windows.

**Why this priority**: A reports page is only useful when admins can trust that range changes affect every related metric consistently.

**Independent Test**: Can be fully tested by switching between supported date ranges and verifying that all visible report sections refresh to the same period and preserve meaningful comparisons where supported.

**Acceptance Scenarios**:

1. **Given** the reports page is open, **When** the administrator selects a different supported date range, **Then** all report sections refresh to reflect that range and no section remains on stale data.
2. **Given** a selected reporting range contains no activity for one or more report sections, **When** the page renders, **Then** those sections show clear empty-state information instead of misleading zero-like placeholders or broken charts.
3. **Given** a metric does not support historical comparison, **When** the page renders that metric, **Then** the metric is shown without a misleading comparison indicator.

---

### User Story 3 - Export a Shareable Report (Priority: P3)

As an administrator, I want to export the current report view so I can share or archive the same figures that appear on the screen.

**Why this priority**: Exporting is secondary to viewing the dashboard, but it is still important for operational sharing and audit-style review.

**Independent Test**: Can be fully tested by generating an export from a chosen reporting period and verifying that the exported file contains the same report sections and values shown in the active view.

**Acceptance Scenarios**:

1. **Given** an administrator is viewing a valid report range, **When** they request an export, **Then** the system provides a downloadable report containing the same summary and chart data represented on the page.
2. **Given** an export is requested for a range with partial or no data, **When** the file is generated, **Then** the export still completes successfully and clearly reflects empty sections where applicable.

### Edge Cases

- What happens when the selected reporting period has no orders, no payments, or no newly registered users?
- How does the system behave when one report section cannot be calculated while the rest of the dashboard can still be returned?
- What happens when an administrator requests a date range that exceeds the supported maximum window?
- How does the system present metrics that are available as current snapshots but do not have enough historical data for a period-over-period comparison?
- What happens when refunded transactions affect overall revenue totals but cannot be allocated precisely to individual product performance?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an admin-only reports experience for authorized administrators.
- **FR-002**: The system MUST replace placeholder report statistics with backend-driven data for the reports page.
- **FR-003**: The system MUST support a reporting range selection that covers the predefined ranges currently available on the reports page.
- **FR-004**: The system MUST ensure that all visible report sections on the page use the same active reporting range.
- **FR-005**: The system MUST present summary metrics for total revenue, total orders, new users, and active products.
- **FR-006**: The system MUST present a revenue trend over time for the selected reporting range.
- **FR-007**: The system MUST present an order distribution grouped by order status for the selected reporting range.
- **FR-008**: The system MUST present a ranked list of top-selling products for the selected reporting range, including at minimum sales volume and product revenue contribution.
- **FR-009**: The system MUST present a new-user growth trend for the selected reporting range.
- **FR-010**: The system MUST define each report metric consistently so that the same business rules are used in on-screen display and export output.
- **FR-011**: The system MUST compare supported summary metrics against an immediately preceding reporting period of equivalent duration.
- **FR-012**: The system MUST clearly indicate when a metric does not support historical comparison instead of displaying a misleading percentage.
- **FR-013**: The system MUST allow administrators to export the currently selected report view as a downloadable report.
- **FR-014**: The exported report MUST contain the same report sections and values represented in the active on-screen report view.
- **FR-015**: The system MUST show a clear loading state while report data is being prepared.
- **FR-016**: The system MUST show a clear error state when report data cannot be retrieved or generated.
- **FR-017**: The system MUST show a clear empty state for report sections that have no data in the selected reporting range.
- **FR-018**: The system MUST validate reporting-range input and reject unsupported or invalid date selections with a clear outcome for administrators.
- **FR-019**: The system MUST preserve the current reports scope without reintroducing loyalty-point analytics.
- **FR-020**: The system MUST keep the reports feature bounded to the current dashboard scope and exclude store-level, channel-level, and product-level net-refund allocation analytics from this phase.
- **FR-021**: The system MUST ensure the report data shown to administrators remains internally consistent across cards, charts, and export output for the same selected period.

### Key Entities *(include if feature involves data)*

- **Reporting Range**: The time window selected for the dashboard, including the active period and its comparable previous period.
- **Summary Metric**: A headline report value such as revenue, order count, new users, or active products, including the current value and optional comparison information.
- **Revenue Trend Point**: A time-bucketed revenue record used to display revenue movement over the selected range.
- **Order Status Distribution Item**: A report item that represents how many orders in the selected range currently belong to each business status.
- **Top Product Performance Item**: A ranked product record that represents product sales volume and revenue contribution within the selected range.
- **New User Trend Point**: A time-bucketed registration record used to show how many new users were created over time.
- **Exported Report**: A downloadable representation of the active dashboard view for the selected reporting period.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can open the reports page and see all five in-scope report sections populated or explicitly resolved with loading, empty, or error states within one end-to-end workflow.
- **SC-002**: 100% of supported report range changes update every visible report section to the same selected period without leaving stale values on screen.
- **SC-003**: For every export generated from a valid reporting period, the exported summary and report sections match the values shown in the active dashboard view for that same period.
- **SC-004**: 100% of summary metrics that support comparison display a verifiable previous-period comparison, and 100% of metrics that do not support comparison are shown without a misleading comparison value.
- **SC-005**: Administrators can complete the primary reporting workflow of viewing the dashboard and exporting the current report without needing to visit other screens to reconcile missing business context.

## Assumptions

- The feature is intended for authenticated administrators only.
- The current reports page scope is limited to summary cards, revenue trend, orders by status, top products, new-user trend, and export.
- Loyalty-point analytics remain out of scope for this feature and must not be reintroduced as part of this implementation.
- Active product count is treated as a current snapshot, so historical comparison may be unavailable until the business captures product-status history.
- Product-level revenue in the top-products section is treated as a sales contribution metric for the selected period and does not require exact refund allocation in this phase.
- The selected reporting range applies uniformly to all on-screen report sections and to exported output.

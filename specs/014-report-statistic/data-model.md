# Data Model: Admin Report Statistics

## ReportingRange

- **Purpose**: Represents the active reporting window and its normalized comparison period.
- **Fields**:
  - `from`: inclusive start date of the active period
  - `to`: inclusive end date of the active period
  - `preset`: selected preset or custom marker
  - `granularity`: bucket size used for chart points
  - `timezone`: timezone used for normalization
  - `comparisonFrom`: inclusive start date of the previous comparable period
  - `comparisonTo`: inclusive end date of the previous comparable period
- **Validation Rules**:
  - `from` must be on or before `to`
  - `CUSTOM` ranges require both `from` and `to`
  - Range length must not exceed the supported maximum defined by the backend contract

## ReportMetricCard

- **Purpose**: Represents a summary card for a headline metric on the dashboard.
- **Fields**:
  - `value`: current metric value
  - `previousValue`: previous period value when comparison is supported
  - `changePercent`: period-over-period percentage change when supported and computable
  - `changeDirection`: directional indicator for the comparison state
  - `comparisonSupported`: whether the metric is expected to show comparison data
- **Validation Rules**:
  - `previousValue`, `changePercent`, and `changeDirection` may be null when `comparisonSupported` is false
  - Unsupported comparison values must not be displayed as zero-like stand-ins

## RevenueSeries

- **Purpose**: Represents the revenue section of the dashboard.
- **Fields**:
  - `summary.grossRevenue`
  - `summary.refundAmount`
  - `summary.netRevenue`
  - `summary.paidOrders`
  - `summary.averageOrderValue`
  - `summary.currency`
  - `points[]`
- **Relationships**:
  - Contains many `RevenuePoint` items

## RevenuePoint

- **Purpose**: Represents one time bucket in the revenue chart.
- **Fields**:
  - `bucketStart`
  - `bucketEnd`
  - `label`
  - `grossRevenue`
  - `refundAmount`
  - `netRevenue`
  - `paidOrders`
- **Validation Rules**:
  - Points must be sorted chronologically for chart rendering
  - Labels must align with the selected granularity

## OrdersByStatus

- **Purpose**: Represents the order-status distribution section.
- **Fields**:
  - `totalOrders`
  - `items[]`
- **Relationships**:
  - Contains many `OrderStatusItem` items

## OrderStatusItem

- **Purpose**: Represents one status bucket in the orders-by-status chart.
- **Fields**:
  - `status`
  - `count`
  - `percentage`
- **Validation Rules**:
  - `count` must be zero or greater
  - `percentage` should describe the item's portion of `totalOrders`

## TopProducts

- **Purpose**: Represents the top-selling products section.
- **Fields**:
  - `items[]`
- **Relationships**:
  - Contains many `TopProduct` items

## TopProduct

- **Purpose**: Represents one ranked product within the selected reporting period.
- **Fields**:
  - `productId`
  - `productName`
  - `thumbnailUrl`
  - `unitsSold`
  - `orderCount`
  - `grossRevenue`
- **Validation Rules**:
  - Items should be sorted by business ranking order supplied by the backend
  - Revenue is treated as gross revenue in phase 1

## NewUsersSeries

- **Purpose**: Represents the new-user growth section of the dashboard.
- **Fields**:
  - `totalNewUsers`
  - `points[]`
- **Relationships**:
  - Contains many `NewUserPoint` items

## NewUserPoint

- **Purpose**: Represents one time bucket in the new-user chart.
- **Fields**:
  - `bucketStart`
  - `bucketEnd`
  - `label`
  - `users`
- **Validation Rules**:
  - Points must be sorted chronologically for chart rendering

## ExportedReport

- **Purpose**: Represents the downloadable report generated for the active view.
- **Fields**:
  - `selectedRange`
  - `summary metrics`
  - `revenue series rows`
  - `orders by status rows`
  - `top products rows`
  - `new users rows`
- **Validation Rules**:
  - Export contents must reflect the same active reporting period shown on screen
  - Empty sections must still be represented clearly in the exported output

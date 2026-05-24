# Data Model: GHN Delivery Experience

## 1. Delivery Profile

### Purpose

Represents a signed-in customer's default delivery information used to prefill delivery checkout.

### Fields

- `fullName`: recipient display name
- `phoneNumber`: recipient contact number
- `addressLine`: street/building/local address detail
- `provinceId`: selected province identifier
- `provinceName`: selected province display name
- `districtId`: selected district identifier
- `districtName`: selected district display name
- `wardCode`: selected ward identifier
- `wardName`: selected ward display name

### Validation Rules

- Recipient name is required for delivery checkout.
- Phone number is required for delivery checkout.
- Structured province, district, and ward values are required for GHN delivery.
- Address line stores only local street/building detail and does not replace administrative location selection.

### Relationships

- Used by `Delivery Quote`
- Prefills `Delivery Order`

---

## 2. Delivery Quote

### Purpose

Represents a time-sensitive shipping snapshot used to validate a home-delivery checkout.

### Fields

- `provider`: delivery provider name
- `providerEnvironment`: environment label
- `address`: delivery address snapshot used for the quote
- `packageMetrics`: package metrics derived from current cart contents
- `selectedService`: chosen delivery service
- `availableServices`: selectable delivery services returned for the current route
- `shippingFee`: total delivery fee presented to the customer
- `feeBreakdown`: provider fee breakdown information
- `estimatedDeliveryAt`: expected delivery timing
- `quoteExpiresAt`: quote expiry time
- `quoteFingerprint`: backend verification token for the quote snapshot

### Validation Rules

- Quote is required for `GHN_DELIVERY` checkout.
- Quote must be refreshed when cart contents or shipping-relevant address data changes.
- Expired quotes cannot be used for delivery order submission.

### Relationships

- Used by `Delivery Order`
- References `Delivery Profile`

---

## 3. Delivery Service Option

### Purpose

Represents a single carrier service option available for the current delivery route and package.

### Fields

- `serviceId`: provider service identifier
- `serviceTypeId`: provider service type identifier
- `shortName`: compact display label
- `displayName`: full customer-facing label
- `estimatedLeadTime`: service-specific delivery estimate
- `fee`: service-specific delivery fee
- `isRecommended`: whether this service is the backend-selected recommendation

### Validation Rules

- A selected service is required for delivery checkout when multiple service options are available.
- Service selection must match the current quote snapshot.

### Relationships

- Belongs to `Delivery Quote`
- Referenced by `Shipment Summary`

---

## 4. Delivery Order

### Purpose

Represents a customer order that may be fulfilled either by self-pickup or by GHN delivery.

### Fields

- `orderId`: unique order reference
- `deliveryMethod`: pickup or carrier delivery
- `paymentMethod`: pay-on-delivery or online payment choice
- `deliveryAddress`: structured delivery snapshot for delivery orders
- `shippingQuoteSnapshot`: persisted quote summary fields used during order acceptance
- `shippingFee`: applied delivery fee
- `shippingProvider`: provider label when delivery is used
- `shipmentStatus`: latest shipment state summary for list-level visibility
- `shipmentStatusLabel`: display text for shipment status

### Validation Rules

- Pickup orders do not require a delivery quote.
- GHN delivery orders require a valid structured address and quote snapshot.
- Delivery order submission must preserve the separation between delivery state and payment state.

### Relationships

- May include one `Shipment Summary`
- May reuse one `Delivery Profile`
- Consumes one `Delivery Quote`

---

## 5. Shipment Summary

### Purpose

Represents the current read model for shipment tracking and shipment operations after order creation.

### Fields

- `shipmentId`: internal shipment reference
- `provider`: carrier label
- `providerEnvironment`: environment label
- `status`: normalized shipment status
- `statusLabel`: display label for the shipment state
- `clientOrderCode`: customer-facing provider submission reference
- `providerOrderCode`: provider-generated tracking reference
- `shopId`: provider shop reference
- `serviceId`: selected service identifier
- `serviceTypeId`: selected service type identifier
- `feeTotal`: provider-side shipment fee
- `expectedDeliveryAt`: latest expected delivery time
- `trackingUrl`: external tracking link when available
- `failureReasonCode`: machine-readable failure category
- `failureReason`: human-readable failure reason
- `note`: latest shipment note
- `lastSyncedAt`: latest refresh timestamp

### Validation Rules

- Shipment summary is read-only for customers.
- Shipment actions are only available to administrators.
- Shipment status must remain distinct from order fulfillment status.

### State Transitions

- Pre-shipment: `NOT_REQUIRED`, `QUOTE_PENDING`, `QUOTED`, `CREATE_PENDING`
- Active progression: `CREATED`, `READY_TO_PICK`, `PICKING`, `PICKED`, `STORING`, `TRANSPORTING`, `SORTING`, `DELIVERING`
- Completed/closed: `DELIVERED`, `CANCELLED`, `RETURNED`
- Recovery/error: `FAILED_TO_CREATE`, `SYNC_ERROR`, `DELIVERY_FAILED`, `RETURNING`

### Relationships

- Belongs to one `Delivery Order`
- References one `Delivery Service Option`

---

## 6. Shipment Action

### Purpose

Represents an administrator-initiated shipment management operation performed from the order detail workflow.

### Fields

- `actionType`: create, retry, requote, sync, cancel, or note update
- `targetOrderId`: associated order reference
- `targetShipmentId`: associated shipment reference when present
- `statusBefore`: shipment state before the action
- `statusAfter`: shipment state after the action
- `noteInput`: note text when updating shipment note
- `resultMessage`: visible action outcome

### Validation Rules

- Create or retry is only valid for eligible delivery orders without a healthy shipment.
- Cancel is only valid when shipment state permits cancellation.
- Note update requires non-empty content.

### Relationships

- Operates on `Shipment Summary`
- Recorded from `Delivery Order`

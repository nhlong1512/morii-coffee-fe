# Contract: Shipment Management Experience

## Purpose

Describe how shipment management is exposed to administrators and how shipment visibility is exposed to customers after order creation.

## Actors

- Customer
- Administrator
- Morii frontend
- Morii backend

## Customer Read Contract

For delivery orders, the customer-facing order surfaces must:

- show the delivery method
- show whether a shipment exists
- show shipment status when available
- show tracking information when available
- show a clear pending-shipment state when the order exists but shipment creation has not succeeded yet

Customers must not be able to:

- create shipments
- retry shipments
- refresh shipment state manually
- cancel shipments
- edit shipment notes

## Administrator Action Contract

For eligible delivery orders, the admin order detail surface must support:

- create shipment
- retry shipment creation
- refresh shipment state
- refresh quote from existing order snapshot
- update shipment note
- cancel shipment when allowed

## Required Admin Behavior

1. Shipment create or retry action appears only when the current order state needs it.
2. Shipment refresh updates the visible shipment summary on the same page.
3. Quote refresh updates the visible shipment quote context for that order.
4. Shipment note updates reflect the latest note in the order detail view.
5. Shipment cancel is hidden or disabled when the shipment state is not cancellable.

## Failure Behaviors

- Shipment action failures show a visible outcome and preserve current known shipment data
- Temporary synchronization failures do not erase existing shipment state from the screen
- Failed shipment creation remains recoverable from the admin order detail workflow

## Success Signals

- Administrators can recover failed shipment creation without leaving the order page
- Customers always see either a shipment summary or a clear pending-shipment message for delivery orders

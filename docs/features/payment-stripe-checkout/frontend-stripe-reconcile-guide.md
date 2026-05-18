# Frontend Stripe Reconcile Guide

## Goal

Handle the common case where Stripe has already charged the customer, but the backend has not yet
processed the authoritative webhook when the user lands on the success page.

## Backend Contracts

### 1. Create checkout session

`POST /api/v1/payments/stripe/checkout-session`

Response:

- `sessionId`
- `checkoutUrl`
- `paymentId`
- `orderId`

Frontend should redirect the browser to `checkoutUrl`.

### 2. Reconcile after success redirect

`POST /api/v1/payments/stripe/reconcile`

Request body:

```json
{
  "orderId": "GUID",
  "sessionId": "cs_test_..."
}
```

`sessionId` should come from Stripe's success URL query param:

`/checkout/success?session_id={CHECKOUT_SESSION_ID}`

Response body shape:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "orderId": "GUID",
    "paymentStatus": "Pending | Paid | Failed | Refunded | PartiallyRefunded | NotRequired",
    "payments": [
      {
        "id": "GUID",
        "stripeSessionId": "cs_...",
        "stripePaymentIntentId": "pi_... or null",
        "amount": 147000,
        "currency": "vnd",
        "status": "Created | Succeeded | Failed | Expired",
        "failureReason": null,
        "createdAt": "ISO datetime",
        "refunds": []
      }
    ]
  }
}
```

### 3. Order detail

`GET /api/v1/orders/{id}`

This returns:

- `orderStatus`
- `paymentInfo`

Use both. Do not infer payment status from `orderStatus`.

## Recommended Success Page Flow

1. User returns from Stripe success redirect.
2. Frontend reads `session_id` from the URL.
3. Frontend already knows `orderId` from local checkout state or route state.
4. Frontend calls `POST /api/v1/payments/stripe/reconcile`.
5. Frontend then calls `GET /api/v1/orders/{id}`.
6. If `paymentInfo.paymentStatus` is still `Pending`, poll the order detail for 10-20 seconds.

Suggested polling cadence:

- every 2 seconds
- stop after 5-10 attempts

## UI Semantics

- `paymentInfo.paymentStatus = Paid` and `orderStatus = PENDING`
  - Show: `Payment: Paid`
  - Show: `Order: Waiting for shop confirmation`

- `paymentInfo.paymentStatus = Pending`
  - Show: `Payment is being synchronized`

- `paymentInfo.paymentStatus = Failed`
  - Show: `Payment failed`

- `paymentInfo.paymentStatus = Refunded`
  - Show: `Refunded`

## Important Notes

- Stripe redirect success is not the source of truth by itself.
- Webhook remains the primary authoritative path.
- Reconcile is a self-healing fallback for delayed or missed webhook updates.

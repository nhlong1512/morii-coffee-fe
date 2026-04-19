# Contract: Get Order Detail

**Endpoint**: `GET /api/orders/{id}`
**Phase**: UI-only (mock data from `src/data/orders.ts`); real endpoint wired in a future phase.

---

## Request

**Authorization**: `Bearer <access_token>` (from auth store)
**Path parameter**: `id` — the order UUID

---

## Response

### 200 OK

```typescript
interface OrderDetailResponse {
  id: string;
  orderNumber: string;             // e.g. "#ORD-1042"
  date: string;                    // ISO 8601
  status: "processing" | "in-transit" | "delivered" | "cancelled";
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image: string;
  }[];
  delivery: {
    fullName: string;
    phoneNumber: string;
    address: string;
  };
  paymentMethod: "COD" | "MOMO" | "PAYPAL";
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  trackingNumber: string | null;
}
```

### Error Responses

| Status | Meaning | UI Behavior |
|--------|---------|-------------|
| 404 | Order not found or doesn't belong to user | Show "not found" state with link back to `/orders` |
| 401 | Unauthenticated | Redirect to sign-in |
| 500 | Server error | Show generic error state |

---

## Mock Implementation

The mock lookup reads from `src/data/orders.ts` using `orders.find(o => o.id === id)`. Returns `undefined` for unknown IDs, triggering the not-found state in the page component.

---

## Get Order List Contract

**Endpoint**: `GET /api/orders`

### 200 OK

```typescript
interface OrderListResponse {
  data: OrderDetailResponse[];   // Same shape as single order
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

### Mock Implementation

Returns all orders from `src/data/orders.ts` without pagination (pagination applied when real API is wired).

# Contract: Create Order

**Endpoint**: `POST /api/orders`
**Phase**: UI-only (mock implementation); real endpoint wired in a future phase.
**Service file**: `src/services/order-service.ts`

---

## Request

**Content-Type**: `application/json`
**Authorization**: `Bearer <access_token>` (from auth store)

### Body Schema

```typescript
interface CreateOrderRequest {
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    image: string;
  }[];
  delivery: {
    fullName: string;
    phoneNumber: string;  // Vietnamese format: 10 digits, 03/05/07/08/09 prefix
    address: string;
  };
  paymentMethod: "COD" | "MOMO" | "PAYPAL";
  subtotal: number;    // Sum of line items
  tax: number;         // subtotal * 0.10
  shipping: number;    // 15000 (flat fee)
  discount: number;    // 0 for this phase
  total: number;       // subtotal + tax + shipping - discount
}
```

### Example

```json
{
  "items": [
    {
      "productId": "prod-001",
      "name": "Morii Signature Latte",
      "price": 65000,
      "quantity": 2,
      "size": "M",
      "image": "/images/products/latte.jpg"
    }
  ],
  "delivery": {
    "fullName": "Nguyen Van A",
    "phoneNumber": "0901234567",
    "address": "123 Le Loi, District 1, Ho Chi Minh City"
  },
  "paymentMethod": "COD",
  "subtotal": 130000,
  "tax": 13000,
  "shipping": 15000,
  "discount": 0,
  "total": 158000
}
```

---

## Response

### 201 Created

```typescript
interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  date: string;          // ISO 8601
  status: "processing";  // Always "processing" at creation time
  items: OrderItem[];
  total: number;
  trackingNumber: null;  // Not yet assigned
}
```

### Error Responses

| Status | Meaning | UI Behavior |
|--------|---------|-------------|
| 400 | Invalid request body | Toast: "Invalid order details. Please review and try again." |
| 401 | Unauthenticated | Redirect to sign-in |
| 422 | Validation error (e.g., item unavailable) | Toast: specific error message from response |
| 500 | Server error | Toast: "Something went wrong. Please try again." |

---

## Mock Implementation

The mock `createOrder` function in `src/services/order-service.ts` will:
1. Accept `CreateOrderRequest`
2. Wait 1000ms (simulated network delay)
3. Return a mock `Order` object with a generated order number
4. Support a `shouldFail` flag for testing the error path

```typescript
// Mock response shape
{
  id: "mock-order-" + Date.now(),
  orderNumber: "#ORD-" + Math.floor(1000 + Math.random() * 9000),
  date: new Date().toISOString(),
  status: "processing",
  items: request.items,
  total: request.total,
  trackingNumber: null
}
```

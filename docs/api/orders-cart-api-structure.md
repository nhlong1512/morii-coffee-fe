# Orders & Cart API — Contracts & DTOs

This document describes every endpoint the Morii Coffee frontend needs to complete the **Cart → Checkout → Order History** flow. The frontend currently uses a local mock service (`src/services/order-service.ts`) and Zustand in-memory cart state. Swap those out for these real endpoints to go fully live.

> **Base URL:** `http://localhost:5000/api` (dev) / `https://api.moriicoffee.com/api` (prod)
> **Auth:** `Authorization: Bearer <access_token>` — all order endpoints require the user to be authenticated.
> **Price format:** All monetary values are in **VND (integer)**. No decimals.
> **Date format:** ISO 8601 strings — `YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ssZ` for timestamps.

---

## Enums

### `OrderStatus`
```
"processing" | "in-transit" | "delivered" | "cancelled"
```

### `PaymentMethod`
```
"COD" | "MOMO" | "PAYPAL"
```

---

## Shared DTOs

### `DeliveryInfo`
```typescript
interface DeliveryInfo {
  fullName:    string   // required, non-empty
  phoneNumber: string   // required, Vietnamese mobile: /^(0[35789]\d{8})$/
  address:     string   // required, non-empty
}
```

### `OrderItem` (inside an order response)
```typescript
interface OrderItem {
  productId: string   // references Product.id
  name:      string   // snapshot of product name at time of order
  price:     number   // VND — unit price at time of order (snapshot)
  quantity:  number   // >= 1
  size:      string   // e.g. "S", "M", "L" — empty string for non-sized items
  image:     string   // image URL (CDN or relative path)
}
```

### `Order` (full order object returned by all order endpoints)
```typescript
interface Order {
  id:            string          // UUID
  orderNumber:   string          // human-readable, e.g. "MRC-20250312-1234"
  date:          string          // "YYYY-MM-DD"
  status:        OrderStatus
  items:         OrderItem[]
  delivery:      DeliveryInfo
  paymentMethod: PaymentMethod
  subtotal:      number          // VND — sum of (price × quantity) for all items
  tax:           number          // VND — Math.round(subtotal × 0.10)
  shipping:      number          // VND — fixed 15000 per order
  discount:      number          // VND — 0 if no coupon applied
  total:         number          // subtotal + tax + shipping − discount
  trackingNumber: string | null  // null until shipped
}
```

---

## Endpoint 1 — Create Order

```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json
```

**Usage:** Called when the customer clicks **"Place Order"** on the checkout page after filling in delivery info and choosing a payment method. On success the frontend clears the cart and redirects to `/orders`.

### Request Body — `CreateOrderRequest`

```typescript
interface CreateOrderRequest {
  items: {
    productId: string
    name:      string
    price:     number   // VND — unit price (snapshot from cart)
    quantity:  number
    size:      string   // "" for non-sized items
    image:     string
  }[]
  delivery:      DeliveryInfo
  paymentMethod: PaymentMethod
  subtotal:      number   // VND
  tax:           number   // VND
  shipping:      number   // VND
  discount:      number   // VND — 0 if none
  total:         number   // VND
}
```

**Example request:**
```json
{
  "items": [
    {
      "productId": "prod-005",
      "name": "Caramel Latte",
      "price": 65000,
      "quantity": 2,
      "size": "M",
      "image": "/images/products/caramel-latte.jpg"
    }
  ],
  "delivery": {
    "fullName": "Nguyễn Văn An",
    "phoneNumber": "0901234567",
    "address": "123 Lê Lợi, Quận 1, TP.HCM"
  },
  "paymentMethod": "COD",
  "subtotal": 130000,
  "tax": 13000,
  "shipping": 15000,
  "discount": 0,
  "total": 158000
}
```

### Response — `201 Created`

Returns the created `Order` object.

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "orderNumber": "MRC-20250419-4821",
  "date": "2025-04-19",
  "status": "processing",
  "items": [
    {
      "productId": "prod-005",
      "name": "Caramel Latte",
      "price": 65000,
      "quantity": 2,
      "size": "M",
      "image": "/images/products/caramel-latte.jpg"
    }
  ],
  "delivery": {
    "fullName": "Nguyễn Văn An",
    "phoneNumber": "0901234567",
    "address": "123 Lê Lợi, Quận 1, TP.HCM"
  },
  "paymentMethod": "COD",
  "subtotal": 130000,
  "tax": 13000,
  "shipping": 15000,
  "discount": 0,
  "total": 158000,
  "trackingNumber": null
}
```

### Error Responses

| HTTP | When |
|------|------|
| `400 Bad Request` | Validation failed (missing fields, invalid phone, empty items) |
| `401 Unauthorized` | Missing or expired token |
| `422 Unprocessable Entity` | One or more `productId` values not found / out of stock |

**400 body example:**
```json
{
  "errors": {
    "delivery.phoneNumber": ["Invalid Vietnamese phone number format"],
    "items": ["At least one item is required"]
  }
}
```

---

## Endpoint 2 — List Orders (Order History)

```
GET /api/orders
Authorization: Bearer <token>
```

**Usage:** `/orders` page — shows all orders placed by the authenticated user, sorted descending by date. The frontend currently renders all results at once but pagination support is recommended.

### Query Parameters

| Parameter | Type   | Default | Description                         |
|-----------|--------|---------|-------------------------------------|
| `page`    | number | `1`     | Page number                         |
| `size`    | number | `20`    | Items per page                      |
| `status`  | string | —       | Filter by `OrderStatus` (optional)  |

### Response — `200 OK`

```typescript
interface OrderListResponse {
  items:    Order[]
  metadata: PaginationMetadata
}

interface PaginationMetadata {
  currentPage: number
  totalPages:  number
  pageSize:    number
  totalCount:  number
  hasPrevious: boolean
  hasNext:     boolean
}
```

**Example response:**
```json
{
  "items": [
    {
      "id": "order-004",
      "orderNumber": "MRC-20250312-004",
      "date": "2025-03-12",
      "status": "processing",
      "items": [ /* ... */ ],
      "delivery": { /* ... */ },
      "paymentMethod": "COD",
      "subtotal": 185000,
      "tax": 18500,
      "shipping": 15000,
      "discount": 0,
      "total": 218500,
      "trackingNumber": null
    }
  ],
  "metadata": {
    "currentPage": 1,
    "totalPages": 1,
    "pageSize": 20,
    "totalCount": 5,
    "hasPrevious": false,
    "hasNext": false
  }
}
```

> **Ordering:** Backend MUST return items sorted by `date` descending. The frontend does not re-sort.

### Error Responses

| HTTP | When |
|------|------|
| `401 Unauthorized` | Missing or expired token |

---

## Endpoint 3 — Get Order Detail

```
GET /api/orders/{id}
Authorization: Bearer <token>
```

**Usage:** `/orders/[id]` detail page — shows full order info including status progress, delivery address, items breakdown, and price summary.

### Path Parameter

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Order UUID  |

### Response — `200 OK`

Returns the full `Order` object (identical shape to the create response above).

### Error Responses

| HTTP | When |
|------|------|
| `401 Unauthorized` | Missing or expired token |
| `403 Forbidden` | Order belongs to a different user |
| `404 Not Found` | Order ID does not exist |

---

## Cart — Architecture Note

The cart is **100% client-side** in this phase. There is no server-side cart endpoint.

- Cart state is stored in `localStorage` via Zustand persist middleware (key: `"morii-cart"`).
- Cart items are sent in the body of `POST /api/orders` at checkout time.
- The frontend clears the cart immediately after a successful order creation response.

**If you want to add a server-side cart in a future phase**, the expected shape of a cart item is:

```typescript
interface CartItem {
  productId: string
  name:      string
  price:     number   // VND — unit price at time of add
  quantity:  number   // always >= 1
  size:      string   // e.g. "M" — empty string for non-sized items
  image:     string
}
```

---

## Business Rules the Backend Must Enforce

| Rule | Value | Notes |
|------|-------|-------|
| Tax rate | 10% | `tax = Math.round(subtotal × 0.10)` |
| Shipping fee | 15,000 VND | Fixed per order, regardless of item count |
| Min order items | 1 | Reject empty `items[]` |
| Phone format | `/^(0[35789]\d{8})$/` | Vietnamese mobile numbers only |
| Initial status | `"processing"` | Set by backend on create; never trusted from client |
| `trackingNumber` | `null` on create | Updated by admin when shipped |

> **Price trust:** The backend should **recalculate** `subtotal`, `tax`, and `total` from its own product prices rather than trusting client-provided values, to prevent price tampering. The `price` snapshot in each item should be recorded from the server's current price at the time of order creation.

---

## Frontend Integration Checklist

When you're ready to wire up the real API, replace the following in the frontend:

| Mock | Replace with |
|------|-------------|
| `src/services/order-service.ts` → `createOrder()` | `POST /api/orders` |
| `src/services/order-service.ts` → `getOrders()` | `GET /api/orders` |
| `src/services/order-service.ts` → `getOrderById()` | `GET /api/orders/{id}` |
| `src/data/orders.ts` import in `src/app/orders/page.tsx` | `getOrders()` from service |
| `src/data/orders.ts` import in `src/app/orders/[id]/page.tsx` | `getOrderById(id)` from service |

All token handling (attach `Authorization` header, refresh on 401) should go through a shared API client (e.g. `src/lib/api-client.ts`) using the existing auth store token.

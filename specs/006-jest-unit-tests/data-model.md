# Data Model: Jest Unit Test Setup

**Feature**: 006-jest-unit-tests  
**Date**: 2026-04-15

*Note: This feature adds testing infrastructure rather than new domain entities. This document describes the test data structures and mocking contracts used across the test suite.*

---

## Test Data Structures

### CartItem (src/stores/cart-store.ts)

Used in cart store tests to represent items added to the cart.

```
CartItem {
  productId: string        // unique per product
  name: string
  price: number            // in VND (integer)
  quantity: number         // > 0
  size?: string            // "Small" | "Medium" | "Large" | undefined
  image: string            // URL or placeholder path
}
```

**Validation rules (from store logic)**:
- Two items are the "same" if both `productId` AND `size` match
- `updateQuantity(id, 0, size)` removes the item (delegates to `removeItem`)
- `addItem` increments quantity if item already exists

---

### Notification (src/data/notifications.ts)

Used in notification store tests.

```
Notification {
  id: string
  isRead: boolean
  // ...other fields not relevant to store logic
}
```

---

### AdminOrder (src/data/admin/orders.ts)

Used in `useOrders` hook tests.

```
AdminOrder {
  customerName: string
  orderNumber: string
  orderStatus: string       // "all" is a UI sentinel, not a real status
  paymentStatus: string
  // ...other fields
}
```

---

## Mock Contracts

The following service modules are mocked in hook tests. The mock must satisfy these shapes:

### banners-service mock

```typescript
// src/services/banners-service.ts
getBanners(): Promise<ApiBanner[]>
```

**ApiBanner** (relevant fields):
```
{ id: string, displayOrder: number, ...rest }
```

The `useBanners` hook sorts by `displayOrder` ascending.

---

### categories-service mock

```typescript
// src/services/categories-service.ts
getCategories(): Promise<ApiCategory[]>
```

**ApiCategory** (relevant fields):
```
{ id: string, displayOrder: number, ...rest }
```

The `useCategories` hook sorts by `displayOrder` ascending.

---

### products-service mock

```typescript
// src/services/products-service.ts
getProducts(options: GetProductsOptions): Promise<{
  products: Product[],
  hasNext: boolean,
  totalCount: number
}>
```

---

### user-service mock

```typescript
// src/services/user-service.ts
getUsers(params: GetUsersParams): Promise<{
  items: ApiUserListItem[],
  metadata: ApiMetadata
}>
```

---

## State Transitions (Zustand Stores)

### Cart Store State Machine

```
Empty Cart
  → addItem(newProduct)     → [{ productId, size, quantity: 1 }]
  → addItem(sameProduct)    → [{ ..., quantity: 2 }]       (increments)
  → removeItem(productId)   → []
  → updateQuantity(id, 0)   → []                           (delegates to removeItem)
  → clearCart()             → []
```

### Wishlist Store State Machine

```
Empty Wishlist
  → addItem(id)             → [id]
  → addItem(id) again       → [id]           (deduplicated, no-op)
  → removeItem(id)          → []
  → isInWishlist(id)        → true/false      (read-only derived check)
```

### Notification Store State Machine

```
Initial state: seeded from src/data/notifications.ts
  → markAsRead(id)          → that notification's isRead = true
  → markAllAsRead()         → all isRead = true
  → unreadCount()           → count of isRead === false  (derived)
```

### Admin Store State Machine

```
Initial: { sidebarOpen: true }
  → toggleSidebar()         → { sidebarOpen: false }
  → toggleSidebar()         → { sidebarOpen: true }
  → setSidebarOpen(false)   → { sidebarOpen: false }
```

---
name: implement-feature
description: >
  Full workflow for implementing any new feature in the Morii Coffee Next.js frontend.
  Use this skill whenever the user asks to add a new feature, page, screen, or module —
  including things like "implement notifications", "add a blog section", "build the orders
  page", "create the loyalty screen", or any similar request that involves wiring up a
  backend API to a new UI. Also trigger when the user provides a Swagger response shape
  and asks to build something from it. This skill ensures every feature is built with
  consistent structure, reuses existing infrastructure, and never drifts from the project's
  established patterns.
---

# Morii Coffee — Feature Implementation Workflow

Every new feature in this project follows the same repeatable process. The goal is
consistency: a developer reading the orders module should immediately recognise the
same shape they saw in the products module. Follow each step in order.

---

## Step 1 — Read project foundation before writing any code

These files define the project's rules. Read them at the start of every session so you
know what already exists and what must be reused.

| File | What you'll learn |
|---|---|
| `src/lib/api.ts` | `apiFetch<T>` — the one and only HTTP client. Wraps backend envelope, handles 204. |
| `src/types/api.ts` | Existing backend DTO shapes: `ApiPagination<T>`, `ApiMetadata`, `ApiProductSummary`, etc. |
| `src/lib/constants.ts` | Shared domain constants: `ProductCategory`, `ProductSize`, `OrderStatus`, etc. |
| `src/components/ui/` | All reusable UI primitives (Button, Badge, Card, Tabs, Input, Dialog, Skeleton…). |
| `src/components/ui/product-image.tsx` | The image component — always use it for any product/media thumbnail. |
| `src/services/products-service.ts` | The canonical service pattern to replicate for new features. |
| `.env.local` | Environment variables (`NEXT_PUBLIC_API_BASE_URL`, etc.). |

---

## Step 2 — Understand the API contract

Before touching a file, map out the full API surface for the feature:

1. **Parse the response shape** the user provides (from Swagger or curl output) and draft TypeScript interfaces from it. Every field maps 1:1 — use `null` where the backend can return null, never coerce to `undefined` at the type level.

2. **Identify all endpoints** needed: list each `GET / POST / PUT / DELETE` path and its purpose.

3. **Note the pagination pattern** — the backend uses `ApiPagination<T>`:
   ```ts
   // Query params: page, size, takeAll (boolean), plus feature-specific filters
   // Response shape (already in src/types/api.ts):
   { items: T[]; metadata: ApiMetadata }
   ```
   Reuse `ApiPagination<T>` and `ApiMetadata` from `src/types/api.ts` — don't redefine them.

4. **Note auth** — endpoints that require authentication use `Authorization: Bearer <token>`.
   The token comes from the auth store (`src/stores/auth-store.ts`). Pass it via the
   `headers` option in `apiFetch`.

---

## Step 3 — Confirm the plan with the user

Before writing any code, surface a concise confirmation:

```
Files read: [list]
New TypeScript interfaces: [list with shapes]
API functions to create: [list]
Components to create / reuse: [list]
```

This gives the user a chance to correct misunderstandings before any code is written.

---

## Step 4 — Follow the established file structure

New features live under `src/features/{feature-name}/` to keep all related code colocated.

```
src/features/{feature-name}/
├── types.ts          — TypeScript interfaces that mirror the backend DTOs exactly
├── api.ts            — API call functions built on apiFetch from lib/api.ts
├── hooks.ts          — React state/fetching logic consumed by components
├── components/
│   ├── {Feature}List.tsx
│   ├── {Feature}Card.tsx
│   └── {Feature}Form.tsx   (mutations only)
└── index.ts          — Re-exports everything the rest of the app needs
```

> **Note:** The project currently has `src/services/` for existing features (products, etc.).
> New features use `src/features/` going forward. Don't move existing services files.

---

## Step 5 — Implementation order

Follow this sequence. Each layer builds on the previous one.

### 1. `types.ts` — Define the API response shape

```ts
// src/features/orders/types.ts
import type { ApiPagination } from "@/types/api";   // reuse shared pagination types

export type ApiOrderStatus = "Pending" | "Processing" | "Delivered" | "Cancelled";

export interface ApiOrder {
  id: string;
  userId: string;
  status: ApiOrderStatus;
  totalAmount: number;
  createdAt: string;
  // ...mirror backend DTO exactly
}

export type ApiOrdersPage = ApiPagination<ApiOrder>;
```

### 2. `api.ts` — Wire up the endpoints

Always use `apiFetch` from `@/lib/api`. Never use raw `fetch` or `axios` directly.
The `apiFetch` signature handles the envelope unwrap, error throw, and 204 gracefully.

```ts
// src/features/orders/api.ts
import { apiFetch } from "@/lib/api";
import type { ApiOrdersPage, ApiOrder } from "./types";

export interface GetOrdersOptions {
  page?: number;
  size?: number;
  takeAll?: boolean;
  status?: string;
}

export async function getOrders(opts: GetOrdersOptions = {}): Promise<ApiOrdersPage> {
  const params = new URLSearchParams();
  if (opts.page !== undefined) params.set("page", String(opts.page));
  if (opts.size !== undefined) params.set("size", String(opts.size));
  if (opts.takeAll) params.set("takeAll", "true");
  if (opts.status) params.set("status", opts.status);

  const query = params.toString();
  const url = query ? `/v1/orders?${query}` : "/v1/orders";
  return apiFetch<ApiOrdersPage>(url);
}

export async function getOrderById(id: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/v1/orders/${id}`);
}

export async function deleteOrder(id: string): Promise<void> {
  await apiFetch<void>(`/v1/orders/${id}`, { method: "DELETE" });
}
```

### 3. `hooks.ts` — Data fetching and state

Keep component files thin. Fetching logic, loading state, and error handling live here.
The pattern is: `useEffect` + `useState` (no external library required).

```ts
// src/features/orders/hooks.ts
"use client";

import * as React from "react";
import { getOrders } from "./api";
import type { ApiOrder } from "./types";

export function useOrders(opts: { page?: number; size?: number } = {}) {
  const [orders, setOrders] = React.useState<ApiOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasNext, setHasNext] = React.useState(false);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders(opts);
      setOrders(data.items);
      setHasNext(data.metadata.hasNext);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [opts.page, opts.size]);

  React.useEffect(() => { fetch(); }, [fetch]);

  return { orders, loading, error, hasNext, refetch: fetch };
}
```

### 4. `components/` — UI layer

Components consume the hooks and use only existing UI primitives from `src/components/ui/`.

Every component handles all four states:

| State | What to render |
|---|---|
| `loading` | `<Skeleton>` from `@/components/ui/skeleton` — match the shape of the real content |
| `error` | Inline error message with a retry button |
| `empty` | Friendly empty state with an icon and descriptive text |
| `data` | The actual content |

```tsx
// src/features/orders/components/OrderList.tsx
"use client";

import { useOrders } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderList() {
  const { orders, loading, error, refetch } = useOrders({ size: 10 });

  if (loading) return <OrderListSkeleton />;
  if (error) return <p className="text-destructive text-sm">{error} <button onClick={refetch}>Retry</button></p>;
  if (!orders.length) return <p className="text-muted-foreground">No orders yet.</p>;

  return (
    <ul className="space-y-4">
      {orders.map((order) => <OrderCard key={order.id} order={order} />)}
    </ul>
  );
}
```

### 5. `index.ts` — Public exports

```ts
export * from "./types";
export * from "./api";
export * from "./hooks";
export { OrderList } from "./components/OrderList";
export { OrderCard } from "./components/OrderCard";
```

### 6. Wire into routing/pages

Create the page in `src/app/{path}/page.tsx`. Keep pages thin — they just mount the
feature component and set metadata.

---

## Step 6 — Consistency rules

These exist to keep the codebase uniform across features. The reasons are just as
important as the rules themselves.

**API client** — Always use `apiFetch` from `@/lib/api`. It handles the response envelope
(`{ statusCode, message, data, errors }`), error throwing, and 204 No Content uniformly.
Bypassing it with raw `fetch` means losing all of that for free.

**Environment variables** — Read from `.env.local` / `process.env.NEXT_PUBLIC_*`. Never
hardcode URLs or keys inline — they change per environment.

**API version prefix** — All endpoints use `/v1/` prefix (e.g., `/v1/products`, `/v1/orders`).

**Pagination** — Always use `ApiPagination<T>` and `ApiMetadata` from `src/types/api.ts`
for paginated responses. The query params are always `page`, `size`, `takeAll`.

**Images** — Always use `<ProductImage>` from `@/components/ui/product-image` for any
product or media thumbnail. It handles `null` URLs with a branded gradient placeholder
(fallback color `#146d4d`), renders only valid CloudFront URLs, and shows a skeleton
while loading. Never render raw `<img>` tags or call `next/image` directly for thumbnails.

**Brand color** — Primary green is `#146d4d`. Use Tailwind's `text-primary` / `bg-primary`
CSS variable where possible. Never hardcode other primary colors.

**UI components** — Check `src/components/ui/` before creating anything new. The available
primitives are: Avatar, Badge, Button, Card, Carousel, Checkbox, Dialog, Dropdown Menu,
Input, Label, ProductImage, Select, Separator, Sheet, Skeleton, Slider, Switch, Tabs,
Textarea, Toast.

**Naming conventions** — Match what's already in the codebase:
- Backend DTO types: `Api` prefix (e.g., `ApiOrder`, `ApiOrderStatus`)
- Service functions: verb + noun (e.g., `getOrders`, `deleteOrder`, `updateOrderStatus`)
- Components: PascalCase matching the domain (e.g., `OrderCard`, `OrderList`)
- Hook files: `use` prefix (e.g., `useOrders`, `useOrderById`)

**TypeScript** — Strict mode is on. No `any`. Prefer `null` over `undefined` for optional
API fields to match the backend contract.

**`"use client"` directive** — Only add it to files that use browser APIs, event handlers,
or React state/effects. Server components and pure data-fetching files do not need it.

# Data Model: Component & Page TSX Tests

**Branch**: `007-component-page-tests` | **Date**: 2026-04-15

## Overview

This feature adds test infrastructure only. There are no new persistent data models, database entities, or API contracts introduced. All data shapes used in tests are derived from existing type definitions:

| Type | Source | Used by |
|------|--------|---------|
| `Product` | `src/data/products.ts` | ProductCard test fixture |
| `CartItem` | `src/types/index.ts` | CartButton (via useCartStore) |
| `LucideIcon` | `lucide-react` | StatCard icon prop |

## Test Fixture Shapes

### Product fixture (ProductCard tests)

```ts
const mockProduct: Product = {
  id: "p1",
  name: "Caramel Latte",
  slug: "caramel-latte",
  description: "Rich caramel",
  price: 55000,
  variantPrices: {},
  categories: ["latte"],
  image: "/images/products/latte.jpg",
  images: [],
  sizes: ["M"],
  inStock: true,
  rating: 4.5,
  reviewCount: 42,
  featured: false,
};
```

### Cart state fixture (CartButton tests)

```ts
// Empty cart (initial state)
useCartStore.setState({ items: [] });

// 3-item cart
useCartStore.setState({
  items: [
    { productId: "p1", name: "A", price: 10, quantity: 1, size: "M", image: "" },
    { productId: "p2", name: "B", price: 20, quantity: 1, size: "S", image: "" },
    { productId: "p3", name: "C", price: 30, quantity: 1, size: "L", image: "" },
  ],
});
```

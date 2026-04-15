# Quickstart: Component Test Patterns

**Branch**: `007-component-page-tests` | **Date**: 2026-04-15

## Running component tests

```bash
# Run all component tests
pnpm test src/__tests__/components/

# Run with coverage for the 9 component files
pnpm test:coverage --testPathPattern="src/__tests__/components/"

# Run a single test file
pnpm test src/__tests__/components/ui/button.test.tsx
```

## Standard test template

```tsx
import { render, screen } from "@testing-library/react";
import { ComponentName } from "@/components/category/component-name";

describe("ComponentName", () => {
  it("renders without throwing", () => {
    render(<ComponentName requiredProp="value" />);
    expect(screen.getByText("value")).toBeInTheDocument();
  });
});
```

## Pattern 1: Prop-driven rendering (RatingStars, EmptyState, StatCard)

Test that different prop values produce the correct rendered output. Query by visible text, role, or accessible name.

```tsx
it("shows 'Out of Stock' badge for unavailable products", () => {
  render(<ProductCard product={{ ...mockProduct, inStock: false }} />);
  expect(screen.getByText("Out of Stock")).toBeInTheDocument();
});
```

## Pattern 2: Callback verification (Button, ErrorMessage, ConfirmDialog)

Use `jest.fn()` for handlers, fire events with `fireEvent` or `userEvent`, assert mock was called.

```tsx
import { fireEvent } from "@testing-library/react";

it("calls onConfirm when confirm button is clicked", () => {
  const onConfirm = jest.fn();
  render(<ConfirmDialog open onConfirm={onConfirm} ... />);
  fireEvent.click(screen.getByText("Confirm"));
  expect(onConfirm).toHaveBeenCalledTimes(1);
});
```

## Pattern 3: Zustand store integration (CartButton, ProductCard)

Reset the store in `beforeEach`, then set up the specific state needed per test.

```tsx
import { useCartStore } from "@/stores/cart-store";

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

it("shows badge with item count", () => {
  useCartStore.setState({
    items: [{ productId: "p1", name: "A", price: 10, quantity: 3, size: "M", image: "" }],
  });
  render(<CartButton />);
  expect(screen.getByText("3")).toBeInTheDocument();
});
```

## Pattern 4: Disabled state (Button, ProductCard add-to-cart)

Verify the button element has the `disabled` attribute.

```tsx
it("add-to-cart button is disabled when out of stock", () => {
  render(<ProductCard product={{ ...mockProduct, inStock: false }} />);
  expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
});
```

## What NOT to test

```tsx
// ❌ Never assert Tailwind classes
expect(button).toHaveClass("bg-primary");

// ❌ Never assert CSS variables
expect(element).toHaveStyle("background-color: oklch(...)");

// ❌ Never test Radix UI internals
expect(document.querySelector("[data-radix-portal]")).toBeTruthy();

// ✅ Test visible content and behavior instead
expect(screen.getByRole("button")).toBeDisabled();
expect(onConfirm).toHaveBeenCalledTimes(1);
expect(screen.getByText("Out of Stock")).toBeInTheDocument();
```

## ResizeObserver polyfill (already in jest.setup.ts after this feature)

Radix UI Dialog requires `ResizeObserver`. The polyfill is added to `jest.setup.ts`:

```ts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

## next/image and next/link

Both are automatically handled by `next/jest`'s SWC transform:
- `next/image` → renders as a plain `<img>` 
- `next/link` → renders as a standard `<a>` with the `href` attribute

No manual mocks needed.

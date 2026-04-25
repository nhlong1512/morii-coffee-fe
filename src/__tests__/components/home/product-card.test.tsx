import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/home/product-card";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types";
import { ProductSize } from "@/enums";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockProduct: Product = {
  id: "p1",
  name: "Caramel Latte",
  slug: "caramel-latte",
  description: "Rich caramel flavor",
  price: 55000,
  variantPrices: {},
  categories: ["latte"],
  image: "/images/products/latte.jpg",
  images: [],
  sizes: [ProductSize.M],
  inStock: true,
  rating: 4.5,
  reviewCount: 42,
  featured: false,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
  jest.clearAllMocks();
});

describe("ProductCard", () => {
  it("renders the product name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Caramel Latte")).toBeInTheDocument();
  });

  it("renders a formatted price", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/55/)).toBeInTheDocument();
  });

  it("has a link to the product detail page", () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products/caramel-latte");
  });

  it("renders an enabled Add button when inStock=true", () => {
    render(<ProductCard product={mockProduct} />);
    const addBtn = screen.getByRole("button", { name: /add/i });
    expect(addBtn).not.toBeDisabled();
  });

  it("renders a disabled Add button when inStock=false", () => {
    render(<ProductCard product={{ ...mockProduct, inStock: false }} />);
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("shows 'Out of Stock' badge when inStock=false", () => {
    render(<ProductCard product={{ ...mockProduct, inStock: false }} />);
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("does NOT show 'Out of Stock' badge when inStock=true", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.queryByText("Out of Stock")).toBeNull();
  });

  it("adds item to cart store when Add is clicked for in-stock product", () => {
    render(<ProductCard product={mockProduct} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe("p1");
  });

  it("does NOT add to cart when Add is clicked for out-of-stock product", () => {
    render(<ProductCard product={{ ...mockProduct, inStock: false }} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("shows a success toast when an in-stock item is added to cart", () => {
    const { toast } = jest.requireMock("react-toastify");
    render(<ProductCard product={mockProduct} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Caramel Latte")
    );
  });

  it("does NOT show toast when out-of-stock item Add button is clicked", () => {
    const { toast } = jest.requireMock("react-toastify");
    render(<ProductCard product={{ ...mockProduct, inStock: false }} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(toast.success).not.toHaveBeenCalled();
  });
});

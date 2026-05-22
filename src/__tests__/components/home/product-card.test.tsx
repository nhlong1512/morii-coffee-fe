import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductCard } from "@/components/home/product-card";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types";
import { ProductSize } from "@/enums";

const resolveCartItemInputMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/services/products-service", () => ({
  resolveCartItemInput: (...args: unknown[]) => resolveCartItemInputMock(...args),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/components/ui/wishlist-button", () => ({
  WishlistButton: () => null,
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
  sizes: [ProductSize.Medium],
  inStock: true,
  featured: false,
  quantitySold: 0,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
  jest.clearAllMocks();
  resolveCartItemInputMock.mockResolvedValue({
    productId: "p1",
    name: "Caramel Latte",
    price: 55000,
    variantId: "variant-1",
    size: ProductSize.Medium,
    image: "/images/products/latte.jpg",
  });
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

  it("adds item to cart store when Add is clicked for in-stock product", async () => {
    render(<ProductCard product={mockProduct} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    await waitFor(() => {
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe("p1");
      expect(items[0].variantId).toBe("variant-1");
    });
  });

  it("does NOT add to cart when Add is clicked for out-of-stock product", () => {
    render(<ProductCard product={{ ...mockProduct, inStock: false }} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("shows a success toast when an in-stock item is added to cart", async () => {
    const { toast } = jest.requireMock("react-toastify");
    render(<ProductCard product={mockProduct} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("Caramel Latte")
      );
    });
  });

  it("does NOT show toast when out-of-stock item Add button is clicked", () => {
    const { toast } = jest.requireMock("react-toastify");
    render(<ProductCard product={{ ...mockProduct, inStock: false }} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("shows an error toast when variant resolution fails", async () => {
    const { toast } = jest.requireMock("react-toastify");
    resolveCartItemInputMock.mockRejectedValueOnce(new Error("boom"));

    render(<ProductCard product={mockProduct} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("error");
    });
  });

  it("shows quantity sold when quantitySold > 0", () => {
    render(
      <ProductCard product={{ ...mockProduct, quantitySold: 1250 }} />
    );
    expect(screen.getByText(/1,250/)).toBeInTheDocument();
    expect(screen.getByText(/quantitySold/)).toBeInTheDocument();
  });

  it("does NOT show quantity sold when quantitySold is 0", () => {
    render(<ProductCard product={{ ...mockProduct, quantitySold: 0 }} />);
    expect(screen.queryByText(/quantitySold/)).toBeNull();
  });
});

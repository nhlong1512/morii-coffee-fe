import { render, screen } from "@testing-library/react";
import { CartButton } from "@/components/layout/cart-button";
import { useCartStore } from "@/stores/cart-store";

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

const makeItem = (id: string, quantity = 1) => ({
  productId: id,
  name: `Item ${id}`,
  price: 10000,
  quantity,
  size: "M",
  image: "",
});

describe("CartButton", () => {
  it("renders a link pointing to /cart", () => {
    render(<CartButton />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/cart");
    // Button with aria-label is inside the link
    const button = screen.getByLabelText(/shopping cart/i);
    expect(button).toBeInTheDocument();
  });

  it("shows no badge when cart is empty", () => {
    render(<CartButton />);
    // totalItems() = 0, badge span is not rendered
    expect(screen.queryByText("0")).toBeNull();
  });

  it("shows badge with correct count when cart has items", () => {
    useCartStore.setState({
      items: [makeItem("p1"), makeItem("p2"), makeItem("p3")],
    });
    render(<CartButton />);
    // totalItems sums quantity of each item (each = 1, total = 3)
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows '99+' when total items exceed 99", () => {
    useCartStore.setState({
      items: [makeItem("p1", 100)],
    });
    render(<CartButton />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("shows exactly '99' when total items is 99 (not capped)", () => {
    useCartStore.setState({
      items: [makeItem("p1", 99)],
    });
    render(<CartButton />);
    expect(screen.getByText("99")).toBeInTheDocument();
  });
});

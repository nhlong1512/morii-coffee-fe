import { render, screen } from "@testing-library/react";
import { PriceSummary } from "@/components/checkout/price-summary";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const defaultProps = {
  subtotal: 110000,
  tax: 11000,
  shipping: 15000,
  discount: 0,
  total: 136000,
};

describe("PriceSummary", () => {
  it("renders the order summary heading", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText("orderSummary")).toBeInTheDocument();
  });

  it("renders subtotal, tax, shipping, and total", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText("subtotal")).toBeInTheDocument();
    expect(screen.getByText("tax")).toBeInTheDocument();
    expect(screen.getByText("shipping")).toBeInTheDocument();
    expect(screen.getByText("total")).toBeInTheDocument();
  });

  it("does NOT render discount row when discount is 0", () => {
    render(<PriceSummary {...defaultProps} discount={0} />);
    expect(screen.queryByText("discount")).toBeNull();
  });

  it("renders discount row when discount > 0", () => {
    render(<PriceSummary {...defaultProps} discount={10000} />);
    expect(screen.getByText("discount")).toBeInTheDocument();
  });

  it("renders children inside the container", () => {
    render(
      <PriceSummary {...defaultProps}>
        <button>Place Order</button>
      </PriceSummary>
    );
    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();
  });

  it("renders correctly with no children", () => {
    const { container } = render(<PriceSummary {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders a custom shipping label when provided", () => {
    render(<PriceSummary {...defaultProps} shippingLabel="Free" />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });
});

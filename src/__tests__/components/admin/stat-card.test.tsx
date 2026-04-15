import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/admin/stat-card";
import { TrendingUp } from "lucide-react";

const baseProps = {
  title: "Total Revenue",
  value: "₫1,200,000",
  icon: TrendingUp,
};

describe("StatCard", () => {
  it("renders the title", () => {
    render(<StatCard {...baseProps} change={5} />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
  });

  it("renders the value", () => {
    render(<StatCard {...baseProps} change={5} />);
    expect(screen.getByText("₫1,200,000")).toBeInTheDocument();
  });

  it("renders '+5%' for a positive change", () => {
    render(<StatCard {...baseProps} change={5} />);
    expect(screen.getByText("+5%")).toBeInTheDocument();
  });

  it("renders '-3%' for a negative change (no plus prefix)", () => {
    render(<StatCard {...baseProps} change={-3} />);
    expect(screen.getByText("-3%")).toBeInTheDocument();
  });

  it("renders '+0%' for zero change (treated as positive via change >= 0)", () => {
    render(<StatCard {...baseProps} change={0} />);
    expect(screen.getByText("+0%")).toBeInTheDocument();
  });

  it("renders a TrendingUp SVG for positive change", () => {
    const { container } = render(<StatCard {...baseProps} change={10} />);
    // TrendingUp from lucide-react has class 'lucide-trending-up'
    expect(container.querySelector("svg.lucide-trending-up")).toBeInTheDocument();
  });

  it("renders a TrendingDown SVG for negative change", () => {
    const { container } = render(<StatCard {...baseProps} change={-10} />);
    expect(container.querySelector("svg.lucide-trending-down")).toBeInTheDocument();
  });

  it("renders without throwing for any numeric change", () => {
    expect(() => render(<StatCard {...baseProps} change={0} />)).not.toThrow();
    expect(() => render(<StatCard {...baseProps} change={100} />)).not.toThrow();
    expect(() => render(<StatCard {...baseProps} change={-100} />)).not.toThrow();
  });
});

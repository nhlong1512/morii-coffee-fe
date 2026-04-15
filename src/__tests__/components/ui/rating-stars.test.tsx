import { render } from "@testing-library/react";
import { RatingStars } from "@/components/ui/rating-stars";

/**
 * Lucide React icons (v3+) render as <svg aria-hidden="true"> with no <title>.
 * We distinguish full/half/empty stars by the lucide CSS class:
 *   - Full/empty star: svg.lucide-star
 *   - Half star:       svg.lucide-star-half
 */

describe("RatingStars", () => {
  it("always renders exactly 5 SVG elements", () => {
    const { container } = render(<RatingStars rating={3} />);
    expect(container.querySelectorAll("svg")).toHaveLength(5);
  });

  it("rating=5 renders no half-star and 5 total icons", () => {
    const { container } = render(<RatingStars rating={5} />);
    expect(container.querySelector("svg.lucide-star-half")).toBeNull();
    expect(container.querySelectorAll("svg")).toHaveLength(5);
  });

  it("rating=3.5 renders exactly one half-star icon", () => {
    const { container } = render(<RatingStars rating={3.5} />);
    expect(container.querySelectorAll("svg.lucide-star-half")).toHaveLength(1);
  });

  it("rating=3 renders no half-star icon", () => {
    const { container } = render(<RatingStars rating={3} />);
    expect(container.querySelector("svg.lucide-star-half")).toBeNull();
  });

  it("rating=0 renders no half-star icon and 5 total icons", () => {
    const { container } = render(<RatingStars rating={0} />);
    expect(container.querySelector("svg.lucide-star-half")).toBeNull();
    expect(container.querySelectorAll("svg")).toHaveLength(5);
  });

  it("rating=0.5 renders exactly one half-star icon and 5 total icons", () => {
    const { container } = render(<RatingStars rating={0.5} />);
    expect(container.querySelectorAll("svg.lucide-star-half")).toHaveLength(1);
    expect(container.querySelectorAll("svg")).toHaveLength(5);
  });
});

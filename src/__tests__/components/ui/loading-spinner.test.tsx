import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

/**
 * Lucide React icons render as <svg aria-hidden="true"> — no accessible title.
 * We verify spinner variant by presence of any SVG (the Loader2/LoaderCircle icon).
 * For dots: count direct child divs in the wrapper.
 * For logo: next/jest stubs next/image as a plain <img>.
 */

describe("LoadingSpinner", () => {
  describe("variant=spinner (default)", () => {
    it("renders a container element without throwing", () => {
      const { container } = render(<LoadingSpinner />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders an SVG icon inside the wrapper", () => {
      const { container } = render(<LoadingSpinner variant="spinner" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders without throwing for all sizes", () => {
      expect(() => render(<LoadingSpinner variant="spinner" size="sm" />)).not.toThrow();
      expect(() => render(<LoadingSpinner variant="spinner" size="md" />)).not.toThrow();
      expect(() => render(<LoadingSpinner variant="spinner" size="lg" />)).not.toThrow();
    });
  });

  describe("variant=dots", () => {
    it("renders 3 dot elements", () => {
      const { container } = render(<LoadingSpinner variant="dots" />);
      // The dots variant renders a wrapper div with exactly 3 child divs
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.children).toHaveLength(3);
    });

    it("renders without throwing for all sizes", () => {
      expect(() => render(<LoadingSpinner variant="dots" size="sm" />)).not.toThrow();
      expect(() => render(<LoadingSpinner variant="dots" size="md" />)).not.toThrow();
      expect(() => render(<LoadingSpinner variant="dots" size="lg" />)).not.toThrow();
    });
  });

  describe("variant=logo", () => {
    it("renders an img element (next/image stubbed by next/jest)", () => {
      render(<LoadingSpinner variant="logo" />);
      expect(screen.getByAltText("Loading...")).toBeInTheDocument();
    });

    it("renders without throwing for all sizes", () => {
      expect(() => render(<LoadingSpinner variant="logo" size="sm" />)).not.toThrow();
      expect(() => render(<LoadingSpinner variant="logo" size="md" />)).not.toThrow();
      expect(() => render(<LoadingSpinner variant="logo" size="lg" />)).not.toThrow();
    });
  });
});

import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";

jest.mock("next/image", () => {
  function MockNextImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={String(props.alt ?? "")} />;
  }

  return MockNextImage;
});

describe("Footer", () => {
  it("renders localized footer content from the footer namespace", () => {
    render(<Footer />);

    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Store Locator")).toBeInTheDocument();
    expect(
      screen.getByText("Crafting exceptional coffee experiences since 2020. Every cup tells a story.")
    ).toBeInTheDocument();
    expect(screen.getByText("© 2026 Morii Coffee. All rights reserved.")).toBeInTheDocument();
  });
});

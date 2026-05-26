import { fireEvent, render, screen } from "@testing-library/react";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";

jest.mock("next/image", () => {
  function MockNextImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={String(props.alt ?? "")} />;
  }

  return MockNextImage;
});

describe("BlogCoverImage", () => {
  it("renders the provided image when the source is valid", () => {
    render(<BlogCoverImage src="/images/blog/example.jpg" alt="Example post" />);

    expect(screen.getByAltText("Example post")).toBeInTheDocument();
  });

  it("falls back to the branded placeholder after an image load error", () => {
    const { container } = render(
      <BlogCoverImage src="/images/blog/missing.jpg" alt="Missing post" />
    );

    fireEvent.error(screen.getByAltText("Missing post"));

    expect(screen.queryByAltText("Missing post")).toBeNull();
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

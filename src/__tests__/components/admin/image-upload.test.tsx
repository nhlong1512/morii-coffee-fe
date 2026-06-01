import { fireEvent, render, screen } from "@testing-library/react";
import { ImageUpload } from "@/components/admin/image-upload";

const createObjectURLMock = jest.fn();
const revokeObjectURLMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/image", () => {
  function MockNextImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={String(props.alt ?? "")} src={String(props.src ?? "")} />;
  }

  return MockNextImage;
});

jest.mock("@/components/ui/product-image", () => ({
  ProductImage: ({ src }: { src: string }) => (
    <div data-testid="product-image">{src}</div>
  ),
}));

jest.mock("@/services/file-service", () => ({
  uploadImageAsset: jest.fn(),
}));

describe("ImageUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURLMock,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURLMock,
    });
  });

  it("renders staged files from their local preview URL", () => {
    const onChange = jest.fn();
    const onFileSelect = jest.fn();
    createObjectURLMock.mockReturnValue("blob:banner-preview");

    const { container, rerender } = render(
      <ImageUpload value={null} onChange={onChange} onFileSelect={onFileSelect} alt="Banner image" />
    );

    const file = new File(["banner"], "banner.webp", { type: "image/webp" });
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });

    expect(onChange).toHaveBeenCalledWith("blob:banner-preview");
    expect(onFileSelect).toHaveBeenCalledWith(file);

    rerender(
      <ImageUpload
        value="blob:banner-preview"
        onChange={onChange}
        onFileSelect={onFileSelect}
        alt="Banner image"
      />
    );

    expect(screen.getByRole("img", { name: "Banner image" })).toHaveAttribute(
      "src",
      "blob:banner-preview"
    );
    expect(screen.queryByTestId("product-image")).not.toBeInTheDocument();
  });

  it("revokes local preview URLs when replacing and removing a staged file", () => {
    const onChange = jest.fn();
    const onFileSelect = jest.fn();
    createObjectURLMock
      .mockReturnValueOnce("blob:first-preview")
      .mockReturnValueOnce("blob:second-preview");

    const { container, rerender } = render(
      <ImageUpload value={null} onChange={onChange} onFileSelect={onFileSelect} />
    );
    const input = container.querySelector('input[type="file"]')!;

    fireEvent.change(input, {
      target: { files: [new File(["first"], "first.png", { type: "image/png" })] },
    });
    rerender(
      <ImageUpload
        value="blob:first-preview"
        onChange={onChange}
        onFileSelect={onFileSelect}
      />
    );

    fireEvent.change(input, {
      target: { files: [new File(["second"], "second.png", { type: "image/png" })] },
    });
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:first-preview");

    rerender(
      <ImageUpload
        value="blob:second-preview"
        onChange={onChange}
        onFileSelect={onFileSelect}
      />
    );
    fireEvent.click(screen.getByRole("button"));

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:second-preview");
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(onFileSelect).toHaveBeenLastCalledWith(null);
  });

  it("revokes the current local preview URL on unmount", () => {
    createObjectURLMock.mockReturnValue("blob:banner-preview");

    const { container, unmount } = render(
      <ImageUpload value={null} onChange={jest.fn()} onFileSelect={jest.fn()} />
    );

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["banner"], "banner.jpg", { type: "image/jpeg" })] },
    });
    unmount();

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:banner-preview");
  });
});

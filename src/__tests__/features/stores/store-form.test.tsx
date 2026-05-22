import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StoreForm } from "@/features/stores/components/store-form";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("StoreForm", () => {
  it("submits normalized payload values", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <StoreForm
        mode="create"
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />
    );

    fireEvent.change(container.querySelector('input[name="name"]')!, {
      target: { value: " Morii D1 " },
    });
    fireEvent.change(container.querySelector('input[name="slug"]')!, {
      target: { value: " morii-d1 " },
    });
    fireEvent.change(container.querySelector('textarea[name="address"]')!, {
      target: { value: " 42 Nguyen Hue " },
    });
    fireEvent.change(container.querySelector('input[name="city"]')!, {
      target: { value: " Ho Chi Minh City " },
    });
    fireEvent.change(container.querySelector('input[name="latitude"]')!, {
      target: { value: "10.77" },
    });
    fireEvent.change(container.querySelector('input[name="longitude"]')!, {
      target: { value: "106.7" },
    });
    fireEvent.change(container.querySelector('input[name="phone"]')!, {
      target: { value: " 0900000000 " },
    });

    fireEvent.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Morii D1",
          slug: "morii-d1",
          address: "42 Nguyen Hue",
          city: "Ho Chi Minh City",
          latitude: 10.77,
          longitude: 106.7,
          phone: "0900000000",
        })
      );
    });
  });

  it("shows validation errors for invalid coordinates", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <StoreForm
        mode="create"
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />
    );

    fireEvent.change(container.querySelector('input[name="name"]')!, {
      target: { value: "Morii D1" },
    });
    fireEvent.change(container.querySelector('textarea[name="address"]')!, {
      target: { value: "42 Nguyen Hue" },
    });
    fireEvent.change(container.querySelector('input[name="city"]')!, {
      target: { value: "Ho Chi Minh City" },
    });
    fireEvent.change(container.querySelector('input[name="latitude"]')!, {
      target: { value: "abc" },
    });
    fireEvent.change(container.querySelector('input[name="longitude"]')!, {
      target: { value: "106.7" },
    });
    fireEvent.change(container.querySelector('input[name="phone"]')!, {
      target: { value: "0900000000" },
    });

    fireEvent.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => {
      expect(screen.getByText("Latitude must be a valid number")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

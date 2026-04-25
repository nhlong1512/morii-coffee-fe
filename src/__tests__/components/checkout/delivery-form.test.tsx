import { render, screen, fireEvent } from "@testing-library/react";
import { DeliveryForm } from "@/components/checkout/delivery-form";
import type { DeliveryInfo } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const defaultValues: DeliveryInfo = {
  fullName: "Alice",
  phoneNumber: "0901234567",
  address: "123 Main St",
};

const noErrors = {};

describe("DeliveryForm", () => {
  it("renders all three input fields", () => {
    render(<DeliveryForm values={defaultValues} errors={noErrors} onChange={jest.fn()} />);
    expect(screen.getByLabelText("fullName")).toBeInTheDocument();
    expect(screen.getByLabelText("phoneNumber")).toBeInTheDocument();
    expect(screen.getByLabelText("address")).toBeInTheDocument();
  });

  it("displays the current values in their respective inputs", () => {
    render(<DeliveryForm values={defaultValues} errors={noErrors} onChange={jest.fn()} />);
    expect(screen.getByLabelText<HTMLInputElement>("fullName").value).toBe("Alice");
    expect(screen.getByLabelText<HTMLInputElement>("phoneNumber").value).toBe("0901234567");
    expect(screen.getByLabelText<HTMLInputElement>("address").value).toBe("123 Main St");
  });

  it("calls onChange with the correct field and value on input change", () => {
    const onChange = jest.fn();
    render(<DeliveryForm values={defaultValues} errors={noErrors} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("fullName"), { target: { value: "Bob" } });
    expect(onChange).toHaveBeenCalledWith("fullName", "Bob");
  });

  it("renders inline error messages for fields with errors", () => {
    const errors = { fullName: "Name is required", phoneNumber: "Invalid phone" };
    render(<DeliveryForm values={defaultValues} errors={errors} onChange={jest.fn()} />);
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Invalid phone")).toBeInTheDocument();
  });

  it("does NOT render error messages when errors object is empty", () => {
    render(<DeliveryForm values={defaultValues} errors={noErrors} onChange={jest.fn()} />);
    expect(screen.queryByRole("paragraph")).toBeNull();
  });

  it("phoneNumber input has type tel", () => {
    render(<DeliveryForm values={defaultValues} errors={noErrors} onChange={jest.fn()} />);
    expect(screen.getByLabelText<HTMLInputElement>("phoneNumber").type).toBe("tel");
  });

  it("renders the section heading", () => {
    render(<DeliveryForm values={defaultValues} errors={noErrors} onChange={jest.fn()} />);
    expect(screen.getByText("deliveryTitle")).toBeInTheDocument();
  });
});

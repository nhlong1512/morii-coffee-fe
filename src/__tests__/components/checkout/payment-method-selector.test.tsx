import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import type { PaymentMethod } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("PaymentMethodSelector", () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it("renders all supported payment method options", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    expect(screen.getByDisplayValue("COD")).toBeInTheDocument();
    expect(screen.getByDisplayValue("STRIPE")).toBeInTheDocument();
    expect(screen.getByDisplayValue("VNPAY")).toBeInTheDocument();
  });

  it("renders translated labels for each method", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    expect(screen.getByText("cod")).toBeInTheDocument();
    expect(screen.getByText("stripe")).toBeInTheDocument();
    expect(screen.getByText("vnpay")).toBeInTheDocument();
  });

  it("renders an icon for each payment method", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("marks the current value's radio as checked", () => {
    render(<PaymentMethodSelector value="STRIPE" onChange={onChange} />);
    expect(screen.getByDisplayValue<HTMLInputElement>("STRIPE").checked).toBe(true);
    expect(screen.getByDisplayValue<HTMLInputElement>("COD").checked).toBe(false);
  });

  it("calls onChange with the selected method when a radio is clicked", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    fireEvent.click(screen.getByDisplayValue("STRIPE"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("STRIPE" as PaymentMethod);
  });

  it("renders the payment section heading", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    expect(screen.getByText("paymentTitle")).toBeInTheDocument();
  });

  it("all radios share the same name attribute for grouping", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    const radios = screen.getAllByRole<HTMLInputElement>("radio");
    const names = radios.map((r) => r.name);
    expect(new Set(names).size).toBe(1);
  });

  it("disables radios when the selector is disabled", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} disabled />);
    const radios = screen.getAllByRole<HTMLInputElement>("radio");
    radios.forEach((radio) => expect(radio).toBeDisabled());
  });
});

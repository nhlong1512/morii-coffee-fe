import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import type { PaymentMethod } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

describe("PaymentMethodSelector", () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it("renders all three payment method options", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    expect(screen.getByDisplayValue("COD")).toBeInTheDocument();
    expect(screen.getByDisplayValue("MOMO")).toBeInTheDocument();
    expect(screen.getByDisplayValue("PAYPAL")).toBeInTheDocument();
  });

  it("renders translated labels for each method", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    expect(screen.getByText("cod")).toBeInTheDocument();
    expect(screen.getByText("momo")).toBeInTheDocument();
    expect(screen.getByText("paypal")).toBeInTheDocument();
  });

  it("renders an icon image for each payment method", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
  });

  it("marks the current value's radio as checked", () => {
    render(<PaymentMethodSelector value="MOMO" onChange={onChange} />);
    expect(screen.getByDisplayValue<HTMLInputElement>("MOMO").checked).toBe(true);
    expect(screen.getByDisplayValue<HTMLInputElement>("COD").checked).toBe(false);
    expect(screen.getByDisplayValue<HTMLInputElement>("PAYPAL").checked).toBe(false);
  });

  it("calls onChange with the selected method when a radio is clicked", () => {
    render(<PaymentMethodSelector value="COD" onChange={onChange} />);
    fireEvent.click(screen.getByDisplayValue("MOMO"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("MOMO" as PaymentMethod);
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
});

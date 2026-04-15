import { renderHook, act } from "@testing-library/react";
import { useFormValidation } from "@/hooks/use-form-validation";

describe("useFormValidation", () => {
  describe("validateField", () => {
    it("returns undefined when no rules and value is present", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("name", "John");
      expect(error).toBeUndefined();
    });

    it("required rule returns error for empty string", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("name", "", ["required"]);
      expect(error).toMatch(/required/i);
    });

    it("required rule returns undefined for non-empty string", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("name", "John", ["required"]);
      expect(error).toBeUndefined();
    });

    it("email rule returns error for invalid email", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("email", "not-an-email", ["email"]);
      expect(error).toMatch(/email/i);
    });

    it("email rule returns undefined for valid email", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("email", "user@example.com", ["email"]);
      expect(error).toBeUndefined();
    });

    it("email rule skips validation for empty value", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("email", "", ["email"]);
      expect(error).toBeUndefined();
    });

    it("password rule returns error for weak password", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("password", "weak", ["password"]);
      expect(error).toBeDefined();
    });

    it("password rule returns undefined for strong password", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("password", "StrongPass1", ["password"]);
      expect(error).toBeUndefined();
    });

    it("minLength rule returns error when too short", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("name", "ab", [
        { type: "minLength", length: 3 },
      ]);
      expect(error).toMatch(/3/);
    });

    it("minLength rule returns undefined when at minimum length", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("name", "abc", [
        { type: "minLength", length: 3 },
      ]);
      expect(error).toBeUndefined();
    });

    it("maxLength rule returns error when too long", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("name", "toolong", [
        { type: "maxLength", length: 5 },
      ]);
      expect(error).toMatch(/5/);
    });

    it("custom rule returns its error message", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("code", "abc", [
        { type: "custom", validate: (v) => (v !== "123" ? "Must be 123" : undefined) },
      ]);
      expect(error).toBe("Must be 123");
    });

    it("custom rule returns undefined when custom validate passes", () => {
      const { result } = renderHook(() => useFormValidation());
      const error = result.current.validateField("code", "123", [
        { type: "custom", validate: (v) => (v !== "123" ? "Must be 123" : undefined) },
      ]);
      expect(error).toBeUndefined();
    });
  });

  describe("validateForm", () => {
    it("returns true when all fields pass validation", () => {
      const { result } = renderHook(() => useFormValidation());
      const isValid = result.current.validateForm(
        { email: "user@example.com", name: "John" },
        { email: ["required", "email"], name: ["required"] }
      );
      expect(isValid).toBe(true);
    });

    it("returns false when any field fails and populates errors", () => {
      const { result } = renderHook(() => useFormValidation());
      let isValid: boolean;
      act(() => {
        isValid = result.current.validateForm(
          { email: "bad-email", name: "" },
          { email: ["email"], name: ["required"] }
        );
      });
      expect(isValid!).toBe(false);
      expect(result.current.errors.name).toBeDefined();
      expect(result.current.errors.email).toBeDefined();
    });

    it("validates match rule — matching passwords passes", () => {
      const { result } = renderHook(() => useFormValidation());
      let isValid: boolean;
      act(() => {
        isValid = result.current.validateForm(
          { password: "StrongPass1", confirmPassword: "StrongPass1" },
          {
            password: ["required", "password"],
            confirmPassword: [{ type: "match", field: "password", label: "Passwords" }],
          }
        );
      });
      expect(isValid!).toBe(true);
      expect(result.current.errors.confirmPassword).toBeUndefined();
    });

    it("validates match rule — non-matching passwords fails", () => {
      const { result } = renderHook(() => useFormValidation());
      let isValid: boolean;
      act(() => {
        isValid = result.current.validateForm(
          { password: "StrongPass1", confirmPassword: "Different1" },
          {
            password: ["required"],
            confirmPassword: [{ type: "match", field: "password", label: "Passwords" }],
          }
        );
      });
      expect(isValid!).toBe(false);
      expect(result.current.errors.confirmPassword).toMatch(/Passwords do not match/i);
    });
  });

  describe("clearError", () => {
    it("removes a specific field error", () => {
      const { result } = renderHook(() => useFormValidation());
      act(() => {
        result.current.setError("email", "Invalid");
      });
      expect(result.current.errors.email).toBe("Invalid");
      act(() => {
        result.current.clearError("email");
      });
      expect(result.current.errors.email).toBeUndefined();
    });

    it("does not affect other field errors", () => {
      const { result } = renderHook(() => useFormValidation());
      act(() => {
        result.current.setError("email", "Invalid");
        result.current.setError("name", "Required");
      });
      act(() => {
        result.current.clearError("email");
      });
      expect(result.current.errors.name).toBe("Required");
    });
  });

  describe("clearAllErrors", () => {
    it("empties all errors", () => {
      const { result } = renderHook(() => useFormValidation());
      act(() => {
        result.current.setError("email", "e1");
        result.current.setError("name", "e2");
      });
      act(() => {
        result.current.clearAllErrors();
      });
      expect(Object.keys(result.current.errors)).toHaveLength(0);
    });
  });

  describe("setError", () => {
    it("manually sets an error for a field", () => {
      const { result } = renderHook(() => useFormValidation());
      act(() => {
        result.current.setError("phone", "Invalid phone number");
      });
      expect(result.current.errors.phone).toBe("Invalid phone number");
    });
  });
});

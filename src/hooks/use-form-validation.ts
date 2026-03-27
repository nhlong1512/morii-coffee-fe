import { useState, useCallback } from "react";
import {
  isValidEmail,
  validatePassword,
  validatePasswordMatch,
  isRequired,
} from "@/utils/validate";

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface UseFormValidationReturn {
  errors: ValidationErrors;
  validateField: (field: string, value: string, rules?: ValidationRule[]) => string | undefined;
  validateForm: (fields: Record<string, string>, rules: Record<string, ValidationRule[]>) => boolean;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setError: (field: string, message: string) => void;
}

export type ValidationRule =
  | "required"
  | "email"
  | "password"
  | { type: "match"; field: string; label: string }
  | { type: "minLength"; length: number }
  | { type: "maxLength"; length: number }
  | { type: "custom"; validate: (value: string) => string | undefined };

/**
 * Hook for form validation with error tracking
 * @returns Validation utilities and error state
 */
export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback(
    (field: string, value: string, rules: ValidationRule[] = []): string | undefined => {
      for (const rule of rules) {
        if (rule === "required") {
          if (!isRequired(value)) {
            return "This field is required.";
          }
        } else if (rule === "email") {
          if (value && !isValidEmail(value)) {
            return "Please enter a valid email address.";
          }
        } else if (rule === "password") {
          const result = validatePassword(value);
          if (!result.isValid) {
            return result.error;
          }
        } else if (typeof rule === "object") {
          if (rule.type === "match") {
            // Match validation requires access to other field values
            // This will be handled in validateForm
            continue;
          } else if (rule.type === "minLength") {
            if (value.length < rule.length) {
              return `Must be at least ${rule.length} characters.`;
            }
          } else if (rule.type === "maxLength") {
            if (value.length > rule.length) {
              return `Must be at most ${rule.length} characters.`;
            }
          } else if (rule.type === "custom") {
            const error = rule.validate(value);
            if (error) return error;
          }
        }
      }
      return undefined;
    },
    []
  );

  const validateForm = useCallback(
    (fields: Record<string, string>, rules: Record<string, ValidationRule[]>): boolean => {
      const newErrors: ValidationErrors = {};
      let isValid = true;

      // First pass: validate all fields except match rules
      for (const [field, value] of Object.entries(fields)) {
        const fieldRules = rules[field] || [];
        const error = validateField(field, value, fieldRules);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }

      // Second pass: validate match rules
      for (const [field, fieldRules] of Object.entries(rules)) {
        for (const rule of fieldRules) {
          if (typeof rule === "object" && rule.type === "match") {
            const value = fields[field];
            const matchValue = fields[rule.field];
            const result = validatePasswordMatch(matchValue || "", value || "");
            if (!result.isValid) {
              newErrors[field] = `${rule.label} do not match.`;
              isValid = false;
            }
          }
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    [validateField]
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    setError,
  };
}

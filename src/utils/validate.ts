/**
 * Validation utilities for form inputs and user data
 */

/**
 * Validate email format using RFC 5322 compliant regex
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password - Password string to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter.",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter.",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number.",
    };
  }
  return { isValid: true };
}

/**
 * Validate phone number format (Vietnamese phone numbers)
 * @param phone - Phone number string
 * @returns True if valid Vietnamese phone format
 */
export function isValidPhone(phone: string): boolean {
  // Vietnamese phone: 10 digits starting with 0, or with +84
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Check if a required field is filled
 * @param value - Field value
 * @returns True if field has a value
 */
export function isRequired(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

/**
 * Validate that two password fields match
 * @param password - First password
 * @param confirmPassword - Confirmation password
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): {
  isValid: boolean;
  error?: string;
} {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: "Passwords do not match.",
    };
  }
  return { isValid: true };
}

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns True if valid URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that a number is within a range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

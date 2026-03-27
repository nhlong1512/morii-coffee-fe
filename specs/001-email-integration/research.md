# Research: Email Integration for Welcome and Password Reset

**Feature**: Email Integration for Welcome and Password Reset
**Branch**: `001-email-integration`
**Date**: 2026-03-27

## Research Questions

Based on the Technical Context section, all required information is already available from codebase exploration and the email integration guide. No unknowns require research.

## Technology Stack Decisions

### Decision: Base64URL Encoding/Decoding

**Chosen**: Use browser-native `atob()` with string replacement for Base64URL decoding

**Rationale**:
- No external library needed
- Browser `atob()` handles standard Base64
- Simple string replacement converts Base64URL → Base64: replace `-` with `+`, `_` with `/`, add padding
- Only used for optional display purposes (showing decoded email on reset password page)
- Encoding NOT needed (backend provides pre-encoded values in URL)

**Alternatives Considered**:
1. **js-base64 library** - Rejected: adds unnecessary dependency for simple operation
2. **buffer package** - Rejected: Node.js-specific, not available in browser without polyfill
3. **Custom implementation** - Rejected: `atob()` is standard and well-supported

**Implementation Reference**:
```typescript
function base64UrlDecode(str: string): string {
  // Convert Base64URL to standard Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  // Decode using browser API
  return atob(base64);
}
```

**Sources**:
- MDN Web Docs: `atob()` - https://developer.mozilla.org/en-US/docs/Web/API/atob
- RFC 4648: Base64 URL-safe encoding - https://datatracker.ietf.org/doc/html/rfc4648#section-5
- Existing reset password page already extracts query params with `useSearchParams`

### Decision: Form Validation Strategy

**Chosen**: Client-side validation using React state + backend validation

**Rationale**:
- Matches existing pattern in sign-up, sign-in, reset-password pages
- Simple validation requirements (email format, password match)
- Backend enforces password complexity and token validity
- No need for complex validation library (zod, yup, react-hook-form)
- Reduces bundle size and complexity

**Alternatives Considered**:
1. **react-hook-form + zod** - Rejected: overkill for simple forms, adds 50KB+ to bundle
2. **Formik** - Rejected: not used elsewhere in codebase, breaks consistency
3. **Pure server-side** - Rejected: poor UX (no immediate feedback)

**Implementation Pattern** (already in use):
```typescript
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Client-side validation
  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  // Backend validation via API call
  try {
    await resetPassword({ email, token, newPassword: password });
  } catch (err) {
    setError(err.message);
  }
};
```

### Decision: Error Messaging Strategy

**Chosen**: Generic security-aware messages + specific validation feedback

**Rationale**:
- Prevents email enumeration attacks (same message for existing/non-existing emails)
- Follows security best practice documented in email integration guide
- Provides specific feedback for client-side validation failures
- Backend error messages displayed for password complexity, expired tokens

**Message Types**:
1. **Forgot password success**: "If an account with that email exists, we've sent a password reset link. Please check your inbox." (always shown)
2. **Validation errors**: Specific (e.g., "Passwords do not match", "Please enter a valid email")
3. **Token errors**: Specific from backend (e.g., "Invalid or expired reset token")
4. **Network errors**: Generic retry message

**Security Considerations**:
- Never reveal whether an email exists in the system
- Always return 200 OK from forgot password endpoint (backend handles this)
- Show same success message regardless of email existence

### Decision: Internationalization (i18n) Approach

**Chosen**: Extend existing next-intl messages in `en.json` and `vi.json`

**Rationale**:
- Project already uses next-intl with `useTranslations` hook
- Auth messages already organized under `auth` namespace
- Consistent with existing pattern
- Supports English and Vietnamese

**New Message Keys Required**:
```json
{
  "auth": {
    "forgotPasswordTitle": "Forgot Password",
    "forgotPasswordDescription": "Enter your email address and we'll send you a link to reset your password",
    "sendResetLink": "Send Reset Link",
    "resetLinkSent": "If an account with that email exists, we've sent a password reset link. Please check your inbox.",
    "checkSpam": "Didn't receive the email? Check your spam folder or try again in a few minutes.",
    "resetPasswordTitle": "Reset Password",
    "resetPasswordFor": "Resetting password for",
    "newPassword": "New Password",
    "confirmNewPassword": "Confirm New Password",
    "passwordRequirements": "Password requirements",
    "passwordReqLength": "At least 8 characters",
    "passwordReqUpperLower": "Contains uppercase and lowercase",
    "passwordReqNumbers": "Contains numbers",
    "passwordReqSpecial": "Contains special characters",
    "resetPasswordButton": "Reset Password",
    "resetSuccess": "Password reset successful!",
    "resetSuccessMessage": "You can now sign in with your new password.",
    "redirectingToSignIn": "Redirecting to sign in...",
    "invalidResetLink": "Invalid or missing reset link",
    "expiredResetLink": "This reset link has expired or been used",
    "requestNewReset": "Please request a new password reset.",
    "passwordsMustMatch": "Passwords must match",
    "welcomeEmailSent": "Account created! Check your email for a welcome message.",
    "invalidEmail": "Please enter a valid email address"
  }
}
```

### Decision: URL Parameter Handling

**Chosen**: Use Next.js `useSearchParams` hook with Suspense boundary

**Rationale**:
- Already implemented in existing reset-password page
- Native Next.js App Router pattern
- Provides type-safe access to query parameters
- Requires Suspense wrapper (already in place)

**Implementation** (already exists):
```typescript
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return <InvalidLinkError />;
  }

  // Form implementation
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
```

## Best Practices

### Password Reset Flow Security

**Sources**: OWASP Authentication Cheat Sheet, email-integration-guide.md

1. **No Email Enumeration**:
   - Always return same success message
   - Never indicate whether email exists
   - Backend returns 200 OK regardless

2. **Token Security**:
   - Single-use tokens (enforced by backend)
   - Time-limited (24 hours default)
   - Base64URL encoded
   - Never decode before sending to backend

3. **User Feedback**:
   - Clear instructions on what to do next
   - Link back to request new reset if expired
   - Show password requirements upfront
   - Confirm success before redirecting

### Form UX Best Practices

**Sources**: Nielsen Norman Group, Material Design Guidelines

1. **Loading States**:
   - Disable submit button during async operations
   - Show loading indicator (spinner or text)
   - Prevent double-submission

2. **Error Display**:
   - Show errors near relevant fields
   - Use consistent error styling (red text, alert box)
   - Clear errors when user starts fixing them

3. **Success States**:
   - Show confirmation message
   - Provide next action (auto-redirect or manual link)
   - Use positive visual feedback (green checkmark, success icon)

4. **Accessibility**:
   - Proper label/input associations
   - Error messages announced to screen readers
   - Keyboard navigation support (native with HTML forms)

### Email Link Best Practices

**Sources**: email-integration-guide.md

1. **Reset Password Link Structure**:
   ```
   http://localhost:3000/reset-password?token={encodedToken}&email={encodedEmail}
   ```
   - Both parameters are Base64URL encoded
   - Frontend MUST NOT decode before sending to backend
   - Optional decoding for display purposes only

2. **Link Expiration Handling**:
   - Detect invalid/expired tokens on page load or form submission
   - Show clear error message
   - Provide link to request new reset

3. **Welcome Email Link**:
   ```
   http://localhost:3000
   ```
   - Simple homepage link
   - "Start Shopping" button text
   - No special handling needed in frontend

## Integration Patterns

### Backend API Integration

**Existing Endpoints** (already implemented in `/src/services/auth-service.ts`):

```typescript
// Already exists - no changes needed
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  return apiPost<void>("/v1/auth/forgot-password", data, { skipAuth: true });
}

// Already exists - no changes needed
export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  return apiPost<void>("/v1/auth/reset-password", data, { skipAuth: true });
}
```

**Request/Response Contracts** (already defined in `/src/interfaces/auth/index.ts`):

```typescript
// Already exists
export interface ForgotPasswordRequest {
  email: string;
}

// Already exists
export interface ResetPasswordRequest {
  email: string;      // Base64URL encoded
  token: string;      // Base64URL encoded
  newPassword: string;
}
```

**Error Handling Pattern**:
- 200 OK: Success (even if email doesn't exist for forgot password)
- 400 Bad Request: Validation error, expired/invalid token, weak password
- 500 Internal Server Error: Backend failure

### Component Integration

**UI Components to Use** (already available in `/src/components/ui/`):

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
```

**Pattern** (from existing pages):
```tsx
<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
  <Card className="w-full max-w-md">
    <CardHeader className="space-y-4 text-center">
      <CardTitle>{t("auth.forgotPasswordTitle")}</CardTitle>
      <CardDescription>{t("auth.forgotPasswordDescription")}</CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
      </form>
    </CardContent>
  </Card>
</div>
```

## Dependencies

### Existing Dependencies (No New Additions)

All required functionality is available through existing dependencies:

- **React**: Form handling, state management
- **Next.js**: Routing, `useSearchParams`, `useRouter`, `Link`
- **next-intl**: `useTranslations` hook
- **Radix UI + shadcn**: UI components (Button, Input, Label, Card)
- **Lucide React**: Icons (if needed for visual feedback)
- **Browser APIs**: `atob()` for Base64 decoding

### No External Libraries Required

The implementation requires NO new npm packages. All functionality can be achieved with:
1. Existing UI component library
2. Browser-native APIs
3. Current API client and service layer
4. Established form patterns

## Summary

All research questions have been resolved. Key findings:

1. **No new dependencies needed** - all required functionality exists
2. **Base64URL decoding** - simple browser API with string replacement
3. **Form validation** - follows existing client + backend pattern
4. **Security** - prevent email enumeration with consistent messaging
5. **i18n** - extend existing next-intl messages (15+ new keys)
6. **API integration** - endpoints and types already implemented
7. **UI patterns** - follow established shadcn/Radix UI card layout

The implementation is straightforward: modify 4 existing pages, add i18n messages, and optionally add a small utility function. No architectural changes or new patterns required.

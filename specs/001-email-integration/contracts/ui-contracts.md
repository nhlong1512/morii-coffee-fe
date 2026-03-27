# UI Contracts: Email Integration for Welcome and Password Reset

**Feature**: Email Integration for Welcome and Password Reset
**Branch**: `001-email-integration`
**Date**: 2026-03-27

## Overview

This document defines the user interface contracts for email integration enhancements. Since this is a frontend web application, the contracts describe page routes, component interfaces, user interactions, and visual states.

---

## Page Routes

### 1. Forgot Password Page

**Route**: `/forgot-password`

**Purpose**: Allow users to request a password reset email

**URL Structure**:
```
http://localhost:3000/forgot-password
```

**Query Parameters**: None

**Page Contract**:
```typescript
interface ForgotPasswordPageProps {
  // No props (standalone page)
}

interface ForgotPasswordPageState {
  email: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}
```

**User Interactions**:
1. Enter email address
2. Submit form
3. View success message
4. Navigate back to sign-in

**Visual States**:
- **Initial**: Empty form, enabled submit button
- **Loading**: Disabled button, "Sending..." text or spinner
- **Success**: Success message + helpful instructions + form hidden
- **Error** (client-side only): Red error text for invalid email format

**Accessibility Requirements**:
- Form labels properly associated with inputs
- Error messages announced to screen readers
- Keyboard navigation support
- Focus management on error

---

### 2. Reset Password Page

**Route**: `/reset-password`

**Purpose**: Allow users to set a new password using a reset link from email

**URL Structure**:
```
http://localhost:3000/reset-password?token={encodedToken}&email={encodedEmail}
```

**Query Parameters**:
- `token` (required): Base64URL-encoded password reset token
- `email` (required): Base64URL-encoded user email address

**Page Contract**:
```typescript
interface ResetPasswordPageProps {
  // No props (reads from URL searchParams)
}

interface ResetPasswordPageState {
  token: string | null;           // From URL
  email: string | null;           // From URL (encoded)
  decodedEmail?: string;          // Optional (for display)
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}
```

**User Interactions**:
1. Land on page from email link
2. View decoded email address (optional display)
3. Enter new password
4. Enter confirm password
5. View password requirements
6. Submit form
7. View success message
8. Auto-redirect to sign-in after 2 seconds

**Visual States**:
- **Invalid Link**: Missing/malformed parameters → error state with link to forgot password
- **Initial (Valid)**: Show form with password requirements, enabled submit button
- **Loading**: Disabled button, "Resetting..." text or spinner
- **Success**: Green success message, "Redirecting..." countdown
- **Error**: Red error text for expired/invalid token, mismatched passwords, or weak password

**Accessibility Requirements**:
- Password input toggleable visibility (optional enhancement)
- Password requirements clearly listed and visible
- Error messages announced to screen readers
- Success message announced
- Auto-redirect announced with countdown

---

### 3. Sign-In Page (Modified)

**Route**: `/sign-in`

**Purpose**: Add "Forgot Password?" link

**URL Structure**:
```
http://localhost:3000/sign-in
```

**Modification Contract**:
```typescript
// Existing page - ADD this element
interface SignInPageAdditions {
  forgotPasswordLink: {
    text: string;           // "Forgot Password?"
    href: string;           // "/forgot-password"
    position: "below-form"; // After password field, before submit button
    className: string;      // "text-sm text-primary hover:underline"
  }
}
```

**User Interactions**:
- Click "Forgot Password?" link → navigate to `/forgot-password`

**Visual States**:
- Link should be clearly visible and styled as clickable
- Hover state with underline
- Positioned logically near password field

---

### 4. Sign-Up Page (Modified)

**Route**: `/sign-up`

**Purpose**: Add success message mentioning welcome email

**URL Structure**:
```
http://localhost:3000/sign-up
```

**Modification Contract**:
```typescript
// Existing page - MODIFY success handling
interface SignUpPageModifications {
  successMessage: {
    text: string;  // "Account created! Check your email for a welcome message."
    display: "after-success-api-call";
    duration: "3-seconds-before-redirect" | "shown-during-redirect";
    style: "info-box" | "inline-text";
  }
}
```

**User Interactions**:
- Complete signup form
- View success message (mentions email)
- Auto-redirect to homepage

**Visual States**:
- Success state should mention email check
- Positive visual feedback (green/blue info box or text)

---

## Component Contracts

### ForgotPasswordForm Component

**Purpose**: Reusable form component for password reset request

**Interface**:
```typescript
interface ForgotPasswordFormProps {
  onSuccess?: () => void;          // Optional callback after success
  onError?: (error: string) => void; // Optional error handler
  className?: string;               // Optional CSS classes
}
```

**Internal State**:
```typescript
{
  email: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}
```

**Events Emitted**:
- `onSuccess`: Fires after successful API call
- `onError`: Fires if validation fails (invalid email format)

**Rendered Elements**:
- Email input field
- Submit button ("Send Reset Link")
- Success message (conditional)
- Error message (conditional)
- Helper text / instructions (conditional)

---

### ResetPasswordForm Component

**Purpose**: Reusable form component for password reset

**Interface**:
```typescript
interface ResetPasswordFormProps {
  token: string;                    // From URL
  email: string;                    // From URL (encoded)
  onSuccess?: () => void;           // Optional callback
  onError?: (error: string) => void; // Optional error handler
  className?: string;
}
```

**Internal State**:
```typescript
{
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}
```

**Events Emitted**:
- `onSuccess`: Fires after successful password reset
- `onError`: Fires on validation or API error

**Rendered Elements**:
- Decoded email display (optional)
- New password input
- Confirm password input
- Password requirements list
- Submit button ("Reset Password")
- Success message (conditional)
- Error message (conditional)

---

### PasswordRequirements Component (Optional)

**Purpose**: Display password complexity requirements

**Interface**:
```typescript
interface PasswordRequirementsProps {
  password?: string;                 // Optional: for live validation
  showValidation?: boolean;          // Show checkmarks/X for each rule
  className?: string;
}
```

**Rendered Elements**:
```
Password requirements:
✓ At least 8 characters
✓ Contains uppercase and lowercase
✗ Contains numbers
✗ Contains special characters
```

**Behavior**:
- Static list if no `password` prop
- Live validation if `password` provided
- Green checkmark for met requirements
- Red X or gray text for unmet requirements

---

## User Flows

### Complete Password Reset Flow

```
1. User on /sign-in
   ↓
2. Click "Forgot Password?" link
   ↓
3. Land on /forgot-password
   ↓
4. Enter email address
   ↓
5. Submit form
   ↓
6. See success message:
   "If an account with that email exists,
    we've sent a password reset link.
    Please check your inbox."
   + Instructions about spam folder
   ↓
7. Check email (outside app)
   ↓
8. Click reset link in email
   ↓
9. Land on /reset-password?token=...&email=...
   ↓
10. See form with decoded email display:
    "Resetting password for user@example.com"
   ↓
11. Enter new password
   ↓
12. Enter confirm password
   ↓
13. See password requirements checklist
   ↓
14. Submit form
   ↓
15. See success message:
    "Password reset successful!
     You can now sign in with your new password.
     Redirecting to sign in..."
   ↓
16. Auto-redirect to /sign-in after 2 seconds
   ↓
17. Sign in with new password
```

### Sign-Up with Welcome Email

```
1. User on /sign-up
   ↓
2. Complete form (name, email, phone, password)
   ↓
3. Submit form
   ↓
4. Backend creates account + sends welcome email (async)
   ↓
5. See success message:
   "Account created! Check your email for a welcome message."
   ↓
6. Auto-redirect to homepage
   ↓
7. Check email (outside app)
   ↓
8. Read welcome email
   ↓
9. Click "Start Shopping" button → navigate to homepage
```

---

## Error States

### Forgot Password Errors

| Error | Trigger | Message | Action |
|-------|---------|---------|--------|
| Invalid email format | Client-side validation | "Please enter a valid email address" | Show inline error, keep form visible |
| Network failure | API request fails | "Network error. Please try again." | Show error, allow retry |

**Important**: NO error for "email not found" (security requirement)

---

### Reset Password Errors

| Error | Trigger | Message | Action |
|-------|---------|---------|--------|
| Missing URL parameters | No token/email in URL | "Invalid or missing reset link. Please request a new password reset." | Show error page with link to /forgot-password |
| Passwords don't match | Client-side validation | "Passwords must match" | Show inline error, keep form visible |
| Expired/invalid token | Backend 400 response | "This reset link has expired or been used. Please request a new password reset." | Show error with link to /forgot-password |
| Weak password | Backend 400 response | "Password does not meet requirements" | Show inline error, highlight requirements |
| Network failure | API request fails | "Network error. Please try again." | Show error, allow retry |

---

## Success States

### Forgot Password Success

**Visual**:
```
┌─────────────────────────────────────────────┐
│  ✓ Reset Link Sent                         │
│                                             │
│  If an account with that email exists,     │
│  we've sent a password reset link.         │
│  Please check your inbox.                  │
│                                             │
│  Didn't receive the email?                 │
│  • Check your spam folder                  │
│  • Make sure you entered the correct email │
│  • Wait a few minutes and try again        │
│                                             │
│  [Back to Sign In]                         │
└─────────────────────────────────────────────┘
```

**Behavior**:
- Hide form
- Show success message with instructions
- Provide link back to sign-in
- Keep page accessible (don't auto-redirect)

---

### Reset Password Success

**Visual**:
```
┌─────────────────────────────────────────────┐
│  ✓ Password Reset Successful!              │
│                                             │
│  You can now sign in with your new         │
│  password.                                  │
│                                             │
│  Redirecting to sign in in 2 seconds...    │
│                                             │
│  [Go to Sign In Now]                       │
└─────────────────────────────────────────────┘
```

**Behavior**:
- Show success message
- Start 2-second countdown
- Auto-redirect to /sign-in
- Provide manual link for immediate redirect
- Clear form state

---

## Responsive Design

### Mobile Considerations

**All Pages**:
- Single-column layout
- Full-width cards on mobile (with padding)
- Touch-friendly button sizes (min 44px height)
- Adequate spacing between fields (16px)
- Prevent zoom on input focus (font-size >= 16px)

**Forgot Password**:
- Keep success message concise
- Stack instructions vertically

**Reset Password**:
- Stack password requirements vertically
- Ensure requirements are visible without scrolling

---

## Internationalization (i18n) Contract

### Required Translation Keys

**Namespace**: `auth`

```json
{
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
```

**Usage in Components**:
```typescript
import { useTranslations } from "next-intl";

const t = useTranslations("auth");

// Then use:
t("forgotPasswordTitle")
t("sendResetLink")
// etc.
```

---

## Styling Contract

### Consistent with Existing Auth Pages

**Layout**:
```typescript
// Full-page centered card
className="flex min-h-screen items-center justify-center bg-background px-4 py-12"

// Card container
className="w-full max-w-md"

// Form spacing
className="space-y-4"
```

**Colors** (oklch via CSS variables):
- Background: `bg-background`
- Text: `text-foreground`
- Muted text: `text-muted-foreground`
- Error: `text-destructive` or `bg-destructive/10`
- Success: `text-green-600` or `bg-green-100`
- Primary action: `bg-primary text-primary-foreground`

**Components**:
- `Button` with `variant="default"` for primary actions
- `Input` with `type="email"` or `type="password"`
- `Label` with `htmlFor` matching input `id`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` for layout

---

## Performance Contract

### Loading States

**Target**: Show loading feedback within 100ms of user action

**Implementation**:
- Set `isLoading` state immediately on form submit
- Disable button and show loading indicator
- Prevent double-submission

### Success States

**Target**: Display success message within 100ms of API response

**Implementation**:
- Set `isSuccess` state immediately after API resolves
- Show success message
- Start auto-redirect timer

### Error States

**Target**: Display error message within 100ms of API error or validation failure

**Implementation**:
- Set `error` state immediately on failure
- Display error inline or in alert box
- Allow user to retry without page reload

---

## Security Contract

### Email Enumeration Prevention

**Requirement**: Never reveal whether an email exists in the system

**Implementation**:
- Forgot password ALWAYS shows same success message
- No distinction between existing/non-existing emails
- Backend returns 200 OK regardless

### Token Handling

**Requirement**: Preserve Base64URL encoding until backend

**Implementation**:
- Extract `token` and `email` from URL as-is
- Pass encoded values directly to API
- Optional decode for display only (do NOT send decoded values)

### Password Visibility

**Requirement**: Hide passwords by default

**Implementation**:
- Use `type="password"` on all password inputs
- Optional: Add toggle button for visibility (eye icon)

---

## Accessibility Contract

### WCAG 2.1 Level AA Compliance

**Requirements**:
- All form inputs have associated labels
- Error messages programmatically associated with inputs (`aria-describedby`)
- Success/error states announced to screen readers (`role="alert"`)
- Keyboard navigation works (tab order, enter to submit)
- Focus visible on all interactive elements
- Color contrast meets 4.5:1 minimum
- Text can be resized to 200% without loss of content

**Testing**:
- Test with keyboard only (no mouse)
- Test with screen reader (VoiceOver, NVDA, JAWS)
- Test with high contrast mode
- Test with 200% zoom

---

## Summary

This UI contract defines:
1. **4 page routes** (2 modified, 2 new)
2. **3+ components** (forms, requirements display)
3. **15+ visual states** (initial, loading, success, errors)
4. **2 complete user flows** (password reset, signup with email)
5. **20+ translation keys** (EN/VI support)
6. **Security requirements** (no email enumeration, token encoding)
7. **Accessibility requirements** (WCAG 2.1 AA)

All contracts follow existing Morii Coffee frontend patterns (shadcn UI, Tailwind CSS, next-intl, App Router).

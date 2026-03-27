# Quickstart: Email Integration for Welcome and Password Reset

**Feature**: Email Integration for Welcome and Password Reset
**Branch**: `001-email-integration`
**Date**: 2026-03-27

## What This Feature Does

Enhances the Morii Coffee frontend authentication flow to provide better user experience around email-based interactions:

1. **Password Reset Flow**: Users can request a password reset link via email, then use that link to set a new password
2. **Welcome Email Confirmation**: After signup, users see a message indicating they'll receive a welcome email
3. **Security**: Prevents email enumeration attacks by showing consistent messaging
4. **User Guidance**: Clear instructions, error messages, and success states throughout

**Backend Dependency**: Backend email service (Brevo/Sendinblue) must be configured and operational. This feature only implements the frontend UI.

---

## Quick Navigation

- [Prerequisites](#prerequisites)
- [What's Being Modified](#whats-being-modified)
- [Implementation Steps](#implementation-steps)
- [Testing the Feature](#testing-the-feature)
- [Common Issues](#common-issues)

---

## Prerequisites

### Environment Setup

1. **Backend API Running**:
   ```bash
   # Backend must be running at http://localhost:5000 (or configured API URL)
   # Endpoints required:
   # - POST /api/v1/auth/forgot-password
   # - POST /api/v1/auth/reset-password
   # - POST /api/v1/auth/signup (existing)
   ```

2. **Email Service Configured** (Backend):
   ```json
   // Backend appsettings.json must have:
   {
     "EmailSettings": {
       "FromEmail": "huulongn15@gmail.com",
       "FromName": "Morii Coffee",
       "StorefrontUrl": "http://localhost:3000",
       "ResetPasswordBaseUrl": "http://localhost:3000/reset-password"
     }
   }
   ```

3. **Frontend Environment**:
   ```bash
   # .env.local
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```

### Dependencies (Already Installed)

No new dependencies required. Feature uses:
- React 19
- Next.js 16 (App Router)
- next-intl (i18n)
- Radix UI + shadcn (UI components)
- Tailwind CSS

---

## What's Being Modified

### Files to Modify

1. **`src/app/sign-in/page.tsx`** ✏️
   - Add "Forgot Password?" link below password field

2. **`src/app/sign-up/page.tsx`** ✏️
   - Update success message to mention welcome email

3. **`src/app/forgot-password/page.tsx`** ✏️
   - Enhance success messaging
   - Add helpful instructions (check spam, wait time)

4. **`src/app/reset-password/page.tsx`** ✏️
   - Add parameter validation (token + email required)
   - Show decoded email address
   - Display password requirements checklist
   - Improve error handling for expired/invalid tokens
   - Add success state with auto-redirect

5. **`src/i18n/messages/en.json`** ✏️
   - Add 20+ new translation keys under `auth` namespace

6. **`src/i18n/messages/vi.json`** ✏️
   - Add Vietnamese translations for new keys

7. **`src/lib/utils.ts`** (Optional) ➕
   - Add `base64UrlDecode` utility function if not using inline implementation

### Files NOT Modified

- `src/services/auth-service.ts` - Already has `forgotPassword` and `resetPassword` functions
- `src/interfaces/auth/index.ts` - Already has `ForgotPasswordRequest` and `ResetPasswordRequest` types
- `src/lib/api.ts` - No changes needed to API client
- `src/stores/auth-store.ts` - No changes needed to auth state
- `src/types/api.ts` - No new types required

---

## Implementation Steps

### Step 1: Add i18n Messages

**File**: `src/i18n/messages/en.json`

Add these keys under the `auth` object:

```json
{
  "auth": {
    // ... existing keys ...
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

**File**: `src/i18n/messages/vi.json`

Add Vietnamese translations (work with translator or use machine translation as placeholder).

---

### Step 2: Add "Forgot Password?" Link to Sign-In Page

**File**: `src/app/sign-in/page.tsx`

**Location**: After the password input field, before the submit button

```tsx
import Link from "next/link";

// Inside the form component, after password field:
<div className="space-y-4">
  <div>
    <Label htmlFor="password">{t("password")}</Label>
    <Input
      id="password"
      type="password"
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
  </div>

  {/* ADD THIS: Forgot password link */}
  <div className="text-right">
    <Link
      href="/forgot-password"
      className="text-sm text-primary hover:underline"
    >
      {t("forgotPassword")}
    </Link>
  </div>

  <Button type="submit" className="w-full" disabled={isLoading}>
    {isLoading ? "..." : t("signIn")}
  </Button>
</div>
```

---

### Step 3: Update Sign-Up Success Message

**File**: `src/app/sign-up/page.tsx`

**Modification**: Update the success message or add info text

**Option A: Modify Success Redirect** (show message before redirect):
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    await signUp(email, phoneNumber, password, userName);

    // ADD THIS: Show success message
    alert(t("welcomeEmailSent")); // Or use toast/notification component

    router.push("/");
  } catch (err: any) {
    setError(err.message || "Signup failed");
  } finally {
    setIsLoading(false);
  }
};
```

**Option B: Add Info Text Below Form** (static):
```tsx
<CardContent>
  <form onSubmit={handleSubmit} className="space-y-4">
    {/* ... form fields ... */}

    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? "..." : t("createAccount")}
    </Button>
  </form>

  {/* ADD THIS: Info text */}
  <p className="mt-4 text-sm text-muted-foreground text-center">
    {t("welcomeEmailSent")}
  </p>
</CardContent>
```

---

### Step 4: Enhance Forgot Password Page

**File**: `src/app/forgot-password/page.tsx`

**Key Changes**:
- Show success message with instructions after submission
- Hide form after success
- Add helpful text about spam folder

```tsx
"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPassword } from "@/services/auth-service";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await forgotPassword({ email });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>{t("forgotPasswordTitle")}</CardTitle>
          {!isSuccess && (
            <CardDescription>{t("forgotPasswordDescription")}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            // Success state
            <div className="space-y-4 text-center">
              <div className="rounded-lg bg-green-100 p-4 text-green-800">
                <p className="font-medium">{t("resetLinkSent")}</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>{t("checkSpam")}</p>
              </div>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  {t("backToSignIn")}
                </Button>
              </Link>
            </div>
          ) : (
            // Form state
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "..." : t("sendResetLink")}
              </Button>

              <div className="text-center">
                <Link href="/sign-in" className="text-sm text-primary hover:underline">
                  {t("backToSignIn")}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Step 5: Enhance Reset Password Page

**File**: `src/app/reset-password/page.tsx`

**Key Changes**:
- Validate token/email parameters exist
- Decode email for display (optional)
- Show password requirements
- Handle expired/invalid token errors
- Add success state with auto-redirect

```tsx
"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/services/auth-service";

// Utility function for Base64URL decoding
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Decode email for display (optional)
  const decodedEmail = email ? base64UrlDecode(email) : null;

  // Auto-redirect after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  // Validate parameters exist
  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">{t("invalidResetLink")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{t("requestNewReset")}</p>
            <Link href="/forgot-password">
              <Button className="w-full">{t("forgotPassword")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError(t("passwordsMustMatch"));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ email, token, newPassword });
      setIsSuccess(true);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to reset password";
      if (errorMsg.includes("expired") || errorMsg.includes("invalid")) {
        setError(t("expiredResetLink"));
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>{t("resetPasswordTitle")}</CardTitle>
          {decodedEmail && (
            <CardDescription>
              {t("resetPasswordFor")} <strong>{decodedEmail}</strong>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            // Success state
            <div className="space-y-4 text-center">
              <div className="rounded-lg bg-green-100 p-4 text-green-800">
                <p className="font-medium">{t("resetSuccess")}</p>
                <p className="text-sm mt-2">{t("resetSuccessMessage")}</p>
              </div>
              <p className="text-sm text-muted-foreground">{t("redirectingToSignIn")}</p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  {t("backToSignIn")}
                </Button>
              </Link>
            </div>
          ) : (
            // Form state
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">{t("newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t("confirmNewPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password requirements */}
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-2">{t("passwordRequirements")}</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t("passwordReqLength")}</li>
                  <li>• {t("passwordReqUpperLower")}</li>
                  <li>• {t("passwordReqNumbers")}</li>
                  <li>• {t("passwordReqSpecial")}</li>
                </ul>
              </div>

              {error && (
                <div className="text-sm text-destructive">
                  {error}
                  {error.includes("expired") && (
                    <div className="mt-2">
                      <Link href="/forgot-password" className="underline">
                        {t("requestNewReset")}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "..." : t("resetPasswordButton")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
```

---

## Testing the Feature

### Manual Testing Checklist

#### 1. Forgot Password Flow

```bash
# Start backend and frontend
cd backend && dotnet run  # Terminal 1
cd frontend && pnpm dev   # Terminal 2
```

**Test Steps**:
1. Navigate to `http://localhost:3000/sign-in`
2. ✅ Verify "Forgot Password?" link is visible
3. Click the link → should navigate to `/forgot-password`
4. ✅ Enter a valid email address
5. ✅ Click "Send Reset Link"
6. ✅ Verify success message appears (same message for existing/non-existing emails)
7. ✅ Verify instructions about spam folder are shown
8. ✅ Check email inbox for reset link (if using real email)
9. ✅ Click reset link in email

#### 2. Reset Password Flow

**Test Steps**:
1. From email, click reset link → should navigate to `/reset-password?token=...&email=...`
2. ✅ Verify decoded email is displayed
3. ✅ Verify password requirements are listed
4. ✅ Enter new password
5. ✅ Enter mismatched confirm password
6. ✅ Click submit → should show "Passwords must match" error
7. Fix confirm password to match
8. ✅ Click submit → should show success message
9. ✅ Verify auto-redirect to `/sign-in` after 2 seconds
10. ✅ Sign in with new password → should succeed

#### 3. Sign-Up Flow

**Test Steps**:
1. Navigate to `http://localhost:3000/sign-up`
2. ✅ Complete signup form
3. ✅ Click submit
4. ✅ Verify success message mentions checking email
5. ✅ Check email inbox for welcome email (if using real email)
6. ✅ Click "Start Shopping" button in email → should navigate to homepage

#### 4. Error Scenarios

**Invalid Reset Link**:
1. Navigate to `/reset-password` (no parameters)
2. ✅ Should show "Invalid or missing reset link" error
3. ✅ Should show link to forgot password page

**Expired Token**:
1. Use a reset link that's older than 24 hours (or ask backend team to test)
2. ✅ Should show "This reset link has expired or been used" error
3. ✅ Should show link to request new reset

**Network Error**:
1. Stop backend server
2. Try to submit forgot password form
3. ✅ Should show network error message

---

## Common Issues

### Issue 1: Reset Link Returns 400 "Invalid Token"

**Symptoms**: Clicking reset link immediately shows error

**Causes**:
- Token already used (single-use enforcement)
- Token expired (>24 hours old)
- Token format invalid

**Solutions**:
- Request a new password reset link
- Check backend logs for token validation errors
- Verify backend `ResetPasswordBaseUrl` matches frontend URL

---

### Issue 2: Email Not Received

**Symptoms**: No email arrives after forgot password request

**Causes**:
- Email service (Brevo) not configured on backend
- Email in spam folder
- Backend email sending failed (check logs)

**Solutions**:
- Check backend `appsettings.json` for correct email settings
- Verify Brevo API key is valid
- Check backend logs for email sending errors
- Check spam/junk folder

**Backend Check**:
```bash
# Backend logs should show:
[INFO] Sending password reset email to user@example.com
[INFO] Email sent successfully via Brevo
```

---

### Issue 3: "Passwords Must Match" Error Persists

**Symptoms**: Error shows even when passwords match

**Causes**:
- Whitespace in password fields
- State not clearing after error

**Solutions**:
- Trim whitespace: `newPassword.trim() !== confirmPassword.trim()`
- Clear error state on input change: `onChange={() => setError("")}`

---

### Issue 4: i18n Keys Not Found

**Symptoms**: Shows `auth.forgotPasswordTitle` instead of "Forgot Password"

**Causes**:
- i18n messages not added to `en.json` or `vi.json`
- Typo in translation key
- next-intl cache not refreshed

**Solutions**:
- Verify all keys exist in both `en.json` and `vi.json`
- Restart dev server: `pnpm dev`
- Clear Next.js cache: `rm -rf .next && pnpm dev`

---

### Issue 5: Auto-Redirect Not Working

**Symptoms**: Success message shows but doesn't redirect

**Causes**:
- `useEffect` dependency issue
- Timer not clearing

**Solutions**:
```tsx
useEffect(() => {
  if (isSuccess) {
    const timer = setTimeout(() => {
      router.push("/sign-in");
    }, 2000);
    return () => clearTimeout(timer); // Cleanup
  }
}, [isSuccess, router]); // Include all dependencies
```

---

## Next Steps

After implementation and testing:

1. **Translation Review**: Have Vietnamese translations reviewed by native speaker
2. **Accessibility Audit**: Test with screen reader (VoiceOver, NVDA)
3. **Mobile Testing**: Test on real mobile devices (iOS Safari, Android Chrome)
4. **Performance**: Verify no performance regressions with Lighthouse
5. **Documentation**: Update user-facing help documentation

---

## Related Documentation

- **Feature Spec**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **UI Contracts**: [contracts/ui-contracts.md](./contracts/ui-contracts.md)
- **Backend Email Guide**: [docs/features/email-service/email-integration-guide.md](../../../docs/features/email-service/email-integration-guide.md)

---

## Getting Help

**Questions?** Check:
1. Backend API documentation for endpoint contracts
2. Existing auth pages (`sign-in`, `sign-up`) for implementation patterns
3. shadcn/Radix UI docs for component usage
4. next-intl docs for i18n patterns

**Bugs?** Report with:
- Steps to reproduce
- Expected vs actual behavior
- Browser console errors
- Network tab screenshot (for API errors)

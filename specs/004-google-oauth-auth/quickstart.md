# Quickstart: Google OAuth Implementation Guide

**Feature**: 004-google-oauth-auth
**Date**: 2026-03-28

## Overview

This guide provides step-by-step implementation instructions for Google OAuth external authentication. Follow these steps in order to integrate Google sign-in with the Morii Coffee Next.js frontend.

---

## Prerequisites

Before starting implementation:

1. ✅ Backend Google OAuth endpoints are implemented and deployed (`005-google-oauth` backend branch)
2. ✅ Backend has Google OAuth credentials configured in Google Cloud Console
3. ✅ Environment variable `NEXT_PUBLIC_API_BASE_URL` is set correctly
4. ✅ Existing UI components (LoadingSpinner, ErrorMessage, Button, Card) are available
5. ✅ Zustand auth store is working for email/password authentication

---

## Implementation Steps

### Step 1: Add Callback Route Constant

**File**: `src/constants/routes.ts`

**Action**: Add the OAuth callback route to the ROUTES object and mark it as public

```typescript
// Add to ROUTES object
export const ROUTES = {
  // ... existing routes
  AUTH_CALLBACK: "/auth/callback",
} as const;

// Add to isPublicRoute function
export function isPublicRoute(path: string): boolean {
  const publicRoutes = [
    ROUTES.HOME,
    ROUTES.MENU,
    ROUTES.ABOUT,
    ROUTES.STORES,
    ROUTES.BLOG,
    ROUTES.CONTACT,
    ROUTES.SIGN_IN,
    ROUTES.SIGN_UP,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
    ROUTES.AUTH_CALLBACK, // ← ADD THIS LINE
  ];

  return publicRoutes.some((route) => path === route || path.startsWith(route));
}
```

**Validation**:
- Run `pnpm build` - should complete with no TypeScript errors
- Verify `ROUTES.AUTH_CALLBACK` is accessible throughout codebase

---

### Step 2: Add i18n Translations

**File**: `src/i18n/messages/en.json`

**Action**: Add Google translation key

```json
{
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "dontHaveAccount": "Don't have an account?",
    "orContinueWith": "Or continue with",
    "google": "Google",  // ← ADD THIS LINE
    "facebook": "Facebook"
  }
}
```

**File**: `src/i18n/messages/vi.json`

**Action**: Add Google translation key (same value, brand name)

```json
{
  "auth": {
    "signIn": "Đăng nhập",
    "signUp": "Đăng ký",
    "email": "Email",
    "password": "Mật khẩu",
    "forgotPassword": "Quên mật khẩu?",
    "dontHaveAccount": "Chưa có tài khoản?",
    "orContinueWith": "Hoặc tiếp tục với",
    "google": "Google",  // ← ADD THIS LINE (same as English)
    "facebook": "Facebook"
  }
}
```

**Validation**:
- No build verification needed (JSON files are runtime-loaded)
- Will verify translation displays correctly in Step 4

---

### Step 3: Create OAuth Callback Page

**File**: `src/app/auth/callback/page.tsx` (NEW FILE)

**Action**: Create the callback route that extracts tokens and redirects user

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const getAndClearRedirectTo = useAuthStore((s) => s.getAndClearRedirectTo);

  useEffect(() => {
    const extractAndStoreTokens = async () => {
      try {
        // Check for error in URL params first
        const errorParam = searchParams.get("error");
        if (errorParam) {
          const errorMsg = searchParams.get("message") || "Authentication failed";
          setError(decodeURIComponent(errorMsg));
          setIsProcessing(false);
          return;
        }

        // Extract AuthTokenHolder cookie
        const cookies = document.cookie.split("; ");
        const authCookie = cookies.find((cookie) =>
          cookie.startsWith("AuthTokenHolder=")
        );

        if (!authCookie) {
          setError("No authentication token received. Please try again.");
          setIsProcessing(false);
          return;
        }

        // Parse cookie value
        const cookieValue = authCookie.split("=")[1];
        const decodedValue = decodeURIComponent(cookieValue);
        const authData = JSON.parse(decodedValue);

        // Validate required fields
        if (!authData.accessToken || !authData.refreshToken || !authData.user) {
          setError("Invalid authentication data received.");
          setIsProcessing(false);
          return;
        }

        // Store in Zustand auth store (same as normal sign-in)
        setTokens(authData.accessToken, authData.refreshToken);
        setUser(authData.user);

        // Delete the temporary cookie
        document.cookie = "AuthTokenHolder=; Max-Age=0; path=/;";

        // Redirect using the same pattern as normal sign-in
        const redirectPath = getAndClearRedirectTo();
        router.push(redirectPath || ROUTES.HOME);
      } catch (err) {
        console.error("Failed to process OAuth callback:", err);
        setError("Failed to process authentication. Please try again.");
        setIsProcessing(false);
      }
    };

    extractAndStoreTokens();
  }, [searchParams, setUser, setTokens, getAndClearRedirectTo, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ErrorMessage message={error} />
            <Button
              onClick={() => router.push(ROUTES.SIGN_IN)}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner variant="logo" size="md" />
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return null;
}
```

**Validation**:
- Run `pnpm build` - should complete with no TypeScript errors
- Cannot fully test yet (need Google button to trigger flow)

---

### Step 4: Update Sign-In Page with Google Button

**File**: `src/app/sign-in/page.tsx`

**Action**: Add Google OAuth button where the disabled Google button currently exists (around line 138-169)

**Find this section** (disabled Google button):
```typescript
<Button variant="outline" type="button" className="w-full" disabled>
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    {/* Google logo SVG */}
  </svg>
  {t("google")}
</Button>
```

**Replace with**:
```typescript
<Button
  variant="outline"
  type="button"
  className="w-full"
  onClick={() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5100/api";
    const oauthUrl = `${apiBaseUrl}/v1/auth/external-login?provider=Google`;
    window.location.href = oauthUrl;
  }}
>
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
  {t("google")}
</Button>
```

**Key Changes**:
- Remove `disabled` prop
- Add `onClick` handler that redirects to backend OAuth endpoint
- Google logo SVG remains the same

**Validation**:
- Run `pnpm build` - should complete with no TypeScript errors
- Ready for manual testing

---

## Manual Testing Checklist

### Test Scenario 1: Happy Path (Basic Sign-In)

1. Start backend with Google OAuth configured:
   ```bash
   cd morii-coffee
   bash deploy/run-docker-development.sh
   ```

2. Start frontend:
   ```bash
   cd morii-coffee-fe
   pnpm dev
   ```

3. Navigate to `http://localhost:3000/sign-in`

4. **Verify**: Google button is enabled (not disabled) and displays Google logo + text

5. **Verify**: Button text uses translation (check both EN and VI locales using language switcher)

6. Click "Sign in with Google" button

7. **Verify**: Redirected to Google OAuth consent screen

8. Complete Google authentication (sign in, grant permissions)

9. **Verify**: Redirected back to application at `/auth/callback`

10. **Verify**: Brief loading spinner with "Completing sign in..." text

11. **Verify**: Redirected to home page (`/`)

12. **Verify**: User is authenticated (can access protected routes like `/profile`)

13. **Verify**: User data stored in localStorage under `morii-auth` key

14. **Verify**: Can access protected routes without being redirected to sign-in

**Expected Result**: ✅ User successfully signed in via Google OAuth

---

### Test Scenario 2: Protected Route Redirect Flow

1. Ensure you are logged out (clear localStorage or click logout)

2. Navigate directly to a protected route: `http://localhost:3000/profile`

3. **Verify**: Redirected to `/sign-in`

4. Click "Sign in with Google" button

5. Complete Google OAuth flow

6. **Verify**: After authentication, redirected to `/profile` (NOT home page)

**Expected Result**: ✅ User returned to originally intended destination

---

### Test Scenario 3: Error Handling - User Denies Permissions

1. Navigate to `/sign-in`

2. Click "Sign in with Google" button

3. On Google consent screen, click "Cancel" or deny permissions

4. **Verify**: Redirected back to `/auth/callback`

5. **Verify**: Error message displayed: "Authentication cancelled" or similar

6. **Verify**: "Back to Sign In" button is present

7. Click "Back to Sign In" button

8. **Verify**: Redirected to `/sign-in` page

9. Can retry authentication with Google or use email/password

**Expected Result**: ✅ Graceful error handling with recovery option

---

### Test Scenario 4: Dark Mode Support

1. Navigate to `/sign-in`

2. Toggle dark mode (if toggle exists in header/settings)

3. **Verify**: Google button renders correctly in dark mode (outline visible, text readable)

4. Click Google button and complete OAuth flow

5. On `/auth/callback` page:
   - **Verify**: Loading spinner visible in dark mode
   - If error occurs, **verify**: Error card and message readable in dark mode

**Expected Result**: ✅ All OAuth UI supports dark mode

---

### Test Scenario 5: Internationalization (i18n)

1. Navigate to `/sign-in` with English locale

2. **Verify**: Google button text displays "Google"

3. Switch to Vietnamese locale (language switcher in header)

4. **Verify**: Google button text still displays "Google" (brand name doesn't translate)

5. Complete OAuth flow in Vietnamese locale

6. **Verify**: All OAuth UI text displays correctly (no missing translation keys)

**Expected Result**: ✅ OAuth flow works in both VI and EN locales

---

### Test Scenario 6: Multiple Sign-In Attempts

1. Navigate to `/sign-in`

2. Click "Sign in with Google" button

3. On Google consent screen, click browser back button

4. Back on `/sign-in`, click "Sign in with Google" again

5. Complete OAuth flow this time

6. **Verify**: Authentication succeeds without issues

**Expected Result**: ✅ Can retry OAuth after cancelling

---

### Test Scenario 7: Existing User Sign-In

1. Sign up for an account using email/password:
   - Email: test@example.com
   - Password: password123

2. Log out

3. Navigate to `/sign-in`

4. Click "Sign in with Google"

5. Use the same email (test@example.com) for Google account

6. **Verify**: User signed in successfully

7. **Verify**: User profile matches existing account (same user ID)

**Expected Result**: ✅ OAuth links to existing account by email

---

## Validation Checklist

After implementing all steps, verify:

- [ ] `pnpm build` completes with zero TypeScript errors
- [ ] `pnpm lint` produces zero errors and warnings
- [ ] Google button displays on sign-in page (not disabled)
- [ ] Google button uses i18n translation (`t("google")`)
- [ ] Clicking Google button redirects to Google OAuth
- [ ] OAuth callback page handles success case (extracts tokens, redirects)
- [ ] OAuth callback page handles error cases (missing cookie, user denial)
- [ ] Protected route redirect flow works (returns to intended page)
- [ ] Dark mode works for Google button and callback page
- [ ] Both locales (VI/EN) display correctly
- [ ] Authentication state matches email/password auth (same Zustand store)
- [ ] Authenticated user can access all protected routes
- [ ] User data persists across page refreshes (localStorage)

---

## Troubleshooting

### Issue: "No authentication token received"

**Cause**: Cookie not set by backend or expired before extraction

**Solutions**:
1. Verify backend is running and OAuth endpoints are working
2. Check backend logs for OAuth errors
3. Verify cookie properties (HttpOnly: false required for JS access)
4. Check if cookie is being set in browser DevTools (Application > Cookies)

---

### Issue: "CORS Error"

**Cause**: Frontend and backend on different origins without CORS configured

**Solutions**:
1. Verify backend CORS configuration allows frontend origin
2. Check `appsettings.json` in backend for CORS settings
3. Ensure backend includes frontend URL in allowed origins

---

### Issue: Google button disabled/not clickable

**Cause**: Still using old disabled button code

**Solutions**:
1. Verify `disabled` prop was removed from Button
2. Verify `onClick` handler was added
3. Rebuild with `pnpm build` to ensure changes applied

---

### Issue: Redirect loop (keeps redirecting to sign-in)

**Cause**: Tokens not being stored correctly in Zustand

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify Zustand store methods are called correctly
3. Check localStorage for `morii-auth` key and valid token data
4. Verify `isAuthenticated` is true after storing tokens

---

### Issue: User returned to home instead of protected route

**Cause**: `redirectTo` not being preserved

**Solutions**:
1. Verify `useProtectedRoute` is setting `redirectTo` correctly
2. Check Zustand store has `redirectTo` value before OAuth flow
3. Verify `getAndClearRedirectTo()` is being called in callback page
4. Check localStorage for `morii-auth` key with `redirectTo` field

---

## Performance Verification

After implementation, verify performance metrics:

- [ ] OAuth flow completes in under 15 seconds (from button click to authenticated)
- [ ] Callback page processes tokens in under 1 second
- [ ] No console errors or warnings
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Page loads remain fast (no added bundles for OAuth)

---

## Security Verification

Verify security measures are in place:

- [ ] OAuth secrets remain server-side (never exposed to frontend)
- [ ] `AuthTokenHolder` cookie is deleted after extraction
- [ ] Error messages don't expose sensitive information
- [ ] HTTPS is used in production (Secure cookie flag)
- [ ] CSRF protection via SameSite=Strict cookie
- [ ] State token validation handled by backend

---

## Next Steps

After successful implementation and testing:

1. Create git commit with descriptive message:
   ```bash
   git add src/app/auth/callback src/app/sign-in/page.tsx src/constants/routes.ts src/i18n/messages
   git commit -m "feat(auth): implement Google OAuth external authentication

   - Add OAuth callback page at /auth/callback
   - Enable Google sign-in button on sign-in page
   - Add AUTH_CALLBACK route constant
   - Add i18n translations for Google button
   - Integrate with existing Zustand auth store

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

2. Test in staging environment (if available)

3. Create pull request for review

4. Deploy to production after approval

5. Monitor for any OAuth-related errors in production logs

---

## Rollback Plan

If issues arise after deployment:

1. Remove Google button (re-add `disabled` prop)
2. Delete `/auth/callback` route
3. Revert changes to routes constants
4. Deploy rollback
5. Users can continue using email/password authentication
6. OAuth callback route remains public (safe even if unused)

**Impact of Rollback**: Minimal - only Google OAuth disabled, email/password auth unaffected

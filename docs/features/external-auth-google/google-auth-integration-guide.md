# Google OAuth Integration Guide for Morii Coffee Frontend

**Feature**: Google OAuth External Authentication
**Backend Branch**: `005-google-oauth`
**Last Updated**: 2026-03-28
**Target**: Morii Coffee Next.js Frontend

---

## Overview

This guide explains how to integrate Google OAuth authentication with the Morii Coffee Next.js frontend. The integration follows the same patterns as normal email/password authentication, using the existing Zustand auth store and redirect flow.

**Backend Endpoints**:
1. **POST /api/v1/auth/external-login** - Initiates OAuth flow
2. **GET /api/v1/auth/external-auth-callback** - Processes callback and issues tokens

---

## OAuth Flow Diagram

```
User clicks "Sign in with Google"
    ↓
Frontend stores current path in Zustand redirectTo (if needed)
    ↓
Frontend redirects to: POST /api/v1/auth/external-login?provider=Google
    ↓
Backend redirects to Google OAuth consent screen
    ↓
User authenticates and grants permissions on Google
    ↓
Google redirects to: GET /api/v1/auth/external-auth-callback?code=...&state=...
    ↓
Backend processes callback:
  - Creates account if new user
  - Assigns CUSTOMER role
  - Sends welcome email
  - Generates JWT tokens
    ↓
Backend sets AuthTokenHolder cookie and redirects to /auth/callback
    ↓
Frontend callback page extracts tokens and stores in Zustand auth store
    ↓
User is authenticated and redirected using getAndClearRedirectTo() (same as normal auth)
```

---

## Backend Endpoints

### 1. Initiate OAuth Flow

**Endpoint**: `POST /api/v1/auth/external-login`

**Query Parameters**:
- `provider` (string, required): OAuth provider name. Must be "Google" (case-insensitive).

**Response**: HTTP 302 redirect to Google's OAuth consent screen.

**Example**:
```
POST {API_BASE_URL}/v1/auth/external-login?provider=Google
```

---

### 2. OAuth Callback (Handled by Backend)

**Endpoint**: `GET /api/v1/auth/external-auth-callback`

**Query Parameters**:
- `code` (string): Authorization code from Google
- `state` (string): CSRF protection token
- `error` (string, optional): Error code if user denied
- `error_description` (string, optional): Error description

**Response**: HTTP 302 redirect to `/auth/callback` with `AuthTokenHolder` cookie containing tokens.

**Cookie Format**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": { /* ApiUserProfile */ }
}
```

**Cookie Properties**:
- Name: `AuthTokenHolder`
- Max-Age: 300 seconds (5 minutes)
- HttpOnly: false (needs to be readable by JavaScript)
- Secure: true (HTTPS only in production)
- SameSite: Strict
- Path: /

---

## Frontend Implementation

### Step 1: Add OAuth Callback Route

The callback route must be `/auth/callback` to receive the redirect from the backend. This page extracts tokens from the cookie and stores them in the Zustand auth store.

```tsx
// src/app/auth/callback/page.tsx
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

---

### Step 2: Update Sign-In Page with Google Button

The Google OAuth button should be integrated into the existing sign-in page. The button should store the current path in `redirectTo` (just like protected routes do) before redirecting.

```tsx
// Update src/app/sign-in/page.tsx
// Add the Google button where the disabled buttons currently are (around line 138-169)

// First, create the Google button component or add inline:

const handleGoogleSignIn = () => {
  // Store current redirect intent (if any) before OAuth flow
  // This is already managed by useAuthGuard, so no action needed here

  // Construct backend OAuth initiation URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5100/api";
  const oauthUrl = `${apiBaseUrl}/v1/auth/external-login?provider=Google`;

  // Redirect to backend OAuth endpoint
  window.location.href = oauthUrl;
};

// Then replace the disabled Google button with:
<Button
  variant="outline"
  type="button"
  className="w-full"
  onClick={handleGoogleSignIn}
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

**Key differences from the guide**:
- ✅ Uses existing `useAuthGuard` hook (no changes needed)
- ✅ Uses `process.env.NEXT_PUBLIC_API_BASE_URL` (consistent with project)
- ✅ No need to manually pass `returnUrl` - the Zustand store already handles this via `redirectTo`
- ✅ Integrates seamlessly with existing sign-in page

---

### Step 3: Add Callback Route to Public Routes

Update the routes configuration to mark the callback route as public (if not already):

```tsx
// src/constants/routes.ts
// Add to ROUTES object:
AUTH_CALLBACK: "/auth/callback",

// Update isPublicRoute function to include:
ROUTES.AUTH_CALLBACK,
```

---

## Environment Variables

The project already uses `NEXT_PUBLIC_API_BASE_URL`. Ensure it's set correctly:

```env
# .env.local (development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5100/api
```

```env
# Production
NEXT_PUBLIC_API_BASE_URL=https://api.moriicoffee.com/api
```

---

## Testing the Integration

### 1. Local Development Setup

1. **Start Backend** (with Google OAuth configured):
   ```bash
   cd morii-coffee
   bash deploy/run-docker-development.sh
   ```

2. **Start Frontend**:
   ```bash
   cd morii-coffee-fe
   pnpm dev
   ```

3. **Test OAuth Flow**:
   - Navigate to http://localhost:3000/sign-in
   - Click "Sign in with Google" button
   - Complete Google authentication
   - Verify redirect to home page (or stored redirect path)
   - Check authentication state in browser

---

### 2. Verify Authentication State

After successful Google sign-in, the auth state should match normal email/password auth:

```javascript
// Open browser console and check Zustand persisted state:
console.log(localStorage.getItem('morii-auth'));

// Should see structure like:
// {
//   "state": {
//     "user": { ...user object... },
//     "accessToken": "eyJ...",
//     "refreshToken": "...",
//     "isAuthenticated": true,
//     "redirectTo": null
//   },
//   "version": 0
// }
```

---

### 3. Test Redirect Flow

1. **While logged out**, navigate to a protected route (e.g., `/profile`)
2. You should be redirected to `/sign-in`
3. Click "Sign in with Google"
4. After successful OAuth, you should be redirected back to `/profile` (not home)

This verifies the `setRedirectTo` → `getAndClearRedirectTo` flow works correctly.

---

### 4. Test API Calls

After OAuth sign-in, all authenticated API calls should work automatically:

```tsx
// Example: Fetch user profile using existing service
import { getMe } from '@/services/user-service';

const user = await getMe();
console.log('Current user:', user);
```

The existing `src/lib/api.ts` client automatically handles token refresh and authentication.

---

## Error Handling

### Common Errors and Solutions

#### 1. "No authentication token received"

**Cause**: Cookie not set or expired before extraction.

**Solution**:
- Ensure callback page extracts tokens immediately
- Check cookie settings (HttpOnly must be false if extracting from JS, or use a different approach)
- Verify backend sets cookie correctly

#### 2. "CORS Error"

**Cause**: Frontend and backend on different origins without CORS configuration.

**Solution**:
- Backend must allow frontend origin in CORS settings
- Check `source/MoriiCoffee.Presentation/appsettings.json` CORS configuration

#### 3. "Invalid state parameter"

**Cause**: CSRF token validation failed.

**Solution**:
- Complete OAuth flow within 15 minutes
- Don't clear cookies between initiation and callback
- Restart OAuth flow

#### 4. "User denied permission"

**Cause**: User clicked "Cancel" on Google consent screen.

**Solution**:
- Display friendly error message
- Offer to retry or use email/password sign-in

---

## Security Considerations

### 1. Token Storage

**Current Approach**: localStorage (simple, works for most cases)

**Production Recommendations**:
- Consider using httpOnly cookies for tokens (requires backend changes)
- Implement token rotation on every request
- Clear tokens on sign out

### 2. HTTPS Required

**Development**: HTTP is acceptable for localhost

**Production**: MUST use HTTPS for:
- OAuth redirect URIs
- Cookie security (Secure flag)
- Token transmission

### 3. State Management

**Recommendations**:
- Store user profile in React Context or state management library (Redux, Zustand)
- Don't rely solely on localStorage for auth state
- Implement proper loading and error states

---
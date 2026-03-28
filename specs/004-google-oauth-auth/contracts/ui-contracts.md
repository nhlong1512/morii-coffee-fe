# UI Contracts: Google OAuth Components

**Feature**: 004-google-oauth-auth
**Date**: 2026-03-28

## Overview

This document defines the component interfaces, props, and usage contracts for the Google OAuth authentication feature. All components follow the Morii Coffee patterns documented in the `morii-coffee-patterns` skill.

---

## 1. OAuth Callback Page

### Component Contract

**Location**: `src/app/auth/callback/page.tsx`

**Type**: Client Component (App Router page)

**Purpose**: Extract OAuth tokens from cookie, store in Zustand, and redirect user to intended destination

**Component Signature**:
```typescript
export default function AuthCallbackPage(): JSX.Element
```

**Required Imports**:
```typescript
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
```

**State Management**:
```typescript
interface ComponentState {
  error: string | null;
  isProcessing: boolean;
}
```

**Zustand Store Access**:
```typescript
const setUser = useAuthStore((s) => s.setUser);
const setTokens = useAuthStore((s) => s.setTokens);
const getAndClearRedirectTo = useAuthStore((s) => s.getAndClearRedirectTo);
```

**Render States**:

1. **Processing State** (initial):
   ```typescript
   <div className="flex min-h-screen items-center justify-center bg-background">
     <div className="text-center space-y-4">
       <LoadingSpinner variant="logo" size="md" />
       <p className="text-muted-foreground">Completing sign in...</p>
     </div>
   </div>
   ```

2. **Error State**:
   ```typescript
   <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
     <Card className="w-full max-w-md">
       <CardHeader>
         <CardTitle className="text-center text-destructive">
           Authentication Error
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <ErrorMessage message={error} />
         <Button onClick={() => router.push(ROUTES.SIGN_IN)} className="w-full">
           Back to Sign In
         </Button>
       </CardContent>
     </Card>
   </div>
   ```

3. **Success State**: Component immediately redirects (returns null)

**Behavior Contract**:

1. **On Mount** (via useEffect):
   - Check URL search params for error parameters
   - If error param exists, display error and stop
   - Extract `AuthTokenHolder` cookie from `document.cookie`
   - If cookie missing, display error and stop
   - Parse cookie value as JSON
   - If parse fails, display error and stop
   - Validate required fields (accessToken, refreshToken, user)
   - If validation fails, display error and stop
   - Store tokens via `setTokens(accessToken, refreshToken)`
   - Store user via `setUser(user)`
   - Delete cookie: `document.cookie = "AuthTokenHolder=; Max-Age=0; path=/;"`
   - Retrieve redirect path via `getAndClearRedirectTo()`
   - Navigate to redirect path or `ROUTES.HOME` via `router.push()`

2. **Error Handling**:
   - All errors caught and stored in `error` state
   - Processing flag set to false
   - Error message displayed with recovery button

**Styling Contract**:
- Must support dark mode (all components already handle via Tailwind)
- Must be responsive (full-screen centered layout)
- Must follow Morii Coffee design system colors

**Accessibility**:
- Loading state has descriptive text
- Error messages are clear and actionable
- Button has clear text indicating action

---

## 2. Google OAuth Button (Sign-In Page Integration)

### Component Contract

**Location**: `src/app/sign-in/page.tsx` (inline handler, not separate component)

**Purpose**: Initiate Google OAuth flow when clicked

**Handler Signature**:
```typescript
const handleGoogleSignIn = (): void => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api";
  const oauthUrl = `${apiBaseUrl}/v1/auth/external-login?provider=Google`;

  // Create a form and submit it programmatically to make a POST request
  const form = document.createElement("form");
  form.method = "POST";
  form.action = oauthUrl;
  document.body.appendChild(form);
  form.submit();
};
```

**Button Usage**:
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations("auth");

<Button
  variant="outline"
  type="button"
  className="w-full"
  onClick={handleGoogleSignIn}
>
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    {/* Google logo SVG paths */}
  </svg>
  {t("google")}
</Button>
```

**Google Logo SVG** (inline in button):
```typescript
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
```

**Behavior Contract**:
- On click, construct OAuth initiation URL using environment variable
- Create and submit a hidden POST form to backend OAuth endpoint (required: backend expects POST)
- Browser follows 302 redirect from backend to Google OAuth consent screen
- No loading state needed (page immediately navigates away)
- No error handling needed (errors handled by backend or callback page)

**Placement**:
- Located in sign-in page alongside Facebook button (both social login options)
- Within the existing social login section (after email/password form separator)
- Uses existing grid layout: `<div className="grid grid-cols-2 gap-3">`

**i18n Integration**:
- Button text uses `useTranslations("auth")` hook
- Translation key: `"google"` (value: "Google" in both en.json and vi.json)
- No hardcoded English strings

**Styling Contract**:
- Variant: `outline` (consistent with Facebook button)
- Full width within grid column: `className="w-full"`
- Icon positioned left of text: `className="mr-2 h-4 w-4"`
- Must support dark mode (Button component handles automatically)

---

## 3. Routes Constants Contract

### Update Contract

**Location**: `src/constants/routes.ts`

**Addition to ROUTES Object**:
```typescript
export const ROUTES = {
  // ... existing routes (HOME, SIGN_IN, SIGN_UP, etc.)

  // OAuth callback route (NEW)
  AUTH_CALLBACK: "/auth/callback",
} as const;
```

**Update to isPublicRoute Function**:
```typescript
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
    ROUTES.AUTH_CALLBACK, // ← ADD THIS
  ];

  return publicRoutes.some((route) => path === route || path.startsWith(route));
}
```

**Type Safety**:
- Uses `as const` for literal type inference
- TypeScript will enforce correct usage throughout codebase

---

## 4. i18n Translation Contract

### Message Files Contract

**Location**: `src/i18n/messages/en.json`

**Addition**:
```json
{
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    // ... existing translations
    "google": "Google"  // ← ADD THIS
  }
}
```

**Location**: `src/i18n/messages/vi.json`

**Addition**:
```json
{
  "auth": {
    "signIn": "Đăng nhập",
    "signUp": "Đăng ký",
    // ... existing translations
    "google": "Google"  // ← ADD THIS (same as English - brand name)
  }
}
```

**Usage Contract**:
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations("auth");
const buttonText = t("google"); // "Google" in both locales
```

---

## 5. Zustand Store Contract (No Changes)

### Existing Methods Used

**Location**: `src/stores/auth-store.ts`

**Methods Used by OAuth Flow**:

```typescript
// Store user profile after OAuth
setUser: (user: ApiUserProfile) => void;

// Store authentication tokens after OAuth
setTokens: (accessToken: string, refreshToken: string) => void;

// Retrieve and clear redirect destination
getAndClearRedirectTo: () => string | null;
```

**No Changes Required**: OAuth flow uses existing store methods without modification

**Contract Guarantee**: OAuth-authenticated users have identical store state to email/password users

---

## 6. Environment Variables Contract

### Required Variables

**Location**: `.env.local` (development) or `.env.production` (production)

```bash
# Backend API base URL (must not have trailing slash)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002/api  # Development
NEXT_PUBLIC_API_BASE_URL=https://api.moriicoffee.com/api  # Production
```

**Usage in Code**:
```typescript
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api";
```

**Validation**:
- Variable must be set at build time
- Must be a valid URL without trailing slash
- Fallback to localhost URL if not set (development only)

---

## 7. Cookie Contract (Backend-Set)

### AuthTokenHolder Cookie

**Set By**: Backend after successful OAuth callback

**Read By**: Frontend callback page

**Properties**:
- **Name**: `AuthTokenHolder`
- **Value**: URL-encoded JSON string
- **Max-Age**: 300 seconds (5 minutes)
- **HttpOnly**: false (must be readable by JavaScript)
- **SameSite**: Strict
- **Secure**: true (production only)
- **Path**: /

**Value Structure**:
```typescript
{
  "accessToken": "eyJ...",
  "refreshToken": "abc...",
  "user": {
    "id": "...",
    "email": "...",
    // ... full ApiUserProfile structure
  }
}
```

**Frontend Extraction**:
```typescript
const cookies = document.cookie.split("; ");
const authCookie = cookies.find((cookie) =>
  cookie.startsWith("AuthTokenHolder=")
);

if (authCookie) {
  const cookieValue = authCookie.split("=")[1];
  const decodedValue = decodeURIComponent(cookieValue);
  const authData = JSON.parse(decodedValue);

  // Validate and use authData
}
```

**Cleanup After Use**:
```typescript
document.cookie = "AuthTokenHolder=; Max-Age=0; path=/;";
```

---

## 8. Error Display Contract

### Error Messages

**User-Facing Error Messages**:

```typescript
const ERROR_MESSAGES = {
  USER_DENIED: "Authentication cancelled",
  MISSING_COOKIE: "No authentication token received. Please try again.",
  INVALID_COOKIE: "Invalid authentication data received.",
  PROCESSING_ERROR: "Failed to process authentication. Please try again.",
} as const;
```

**Error Display Pattern**:
- Use `ErrorMessage` component from `@/components/ui/error-message`
- Display in Card with destructive-colored title
- Provide "Back to Sign In" button for recovery
- No technical details or stack traces in user-facing messages

**Error State Structure**:
```typescript
interface ErrorState {
  hasError: boolean;
  message: string;
}
```

---

## 9. Dark Mode Contract

### Automatic Support

**All components automatically support dark mode** via Tailwind CSS variables:

```typescript
// ✅ Correct - Components use semantic color classes
<div className="bg-background text-foreground">
  <span className="text-muted-foreground">...</span>
  <span className="text-destructive">...</span>
</div>

// ❌ Wrong - Don't use hardcoded colors
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">
  ...
</div>
```

**Components Used**:
- LoadingSpinner: Already supports dark mode
- ErrorMessage: Already supports dark mode
- Button: Already supports dark mode
- Card: Already supports dark mode

**No Special Handling Required**: Dark mode works automatically

---

## 10. Validation Contract

### Cookie Validation

**Required Validation Steps** (in callback page):

1. **Cookie Existence Check**:
   ```typescript
   const cookies = document.cookie.split("; ");
   const authCookie = cookies.find(c => c.startsWith("AuthTokenHolder="));
   if (!authCookie) {
     throw new Error("No authentication token received");
   }
   ```

2. **JSON Parsing**:
   ```typescript
   try {
     const cookieValue = authCookie.split("=")[1];
     const decodedValue = decodeURIComponent(cookieValue);
     const authData = JSON.parse(decodedValue);
   } catch (error) {
     throw new Error("Invalid authentication data received");
   }
   ```

3. **Required Fields Check**:
   ```typescript
   if (!authData.accessToken || !authData.refreshToken || !authData.user) {
     throw new Error("Invalid authentication data received");
   }
   ```

4. **User Profile Validation**:
   ```typescript
   if (!authData.user.id || !authData.user.email || !authData.user.userName) {
     throw new Error("Invalid authentication data received");
   }
   ```

---

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────┐
│              Sign-In Page                           │
│  ┌─────────────────────────────────────────────┐   │
│  │  [Email/Password Form]                      │   │
│  ├─────────────────────────────────────────────┤   │
│  │  Or continue with                           │   │
│  ├─────────────────────────────────────────────┤   │
│  │  [Google Button] | [Facebook Button]       │   │
│  │     ↓ onClick                               │   │
│  │     handleGoogleSignIn()                    │   │
│  │     window.location = OAuth URL             │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                     ↓
         (User completes OAuth on Google)
                     ↓
         (Backend processes and redirects)
                     ↓
┌─────────────────────────────────────────────────────┐
│        OAuth Callback Page (/auth/callback)         │
│  ┌─────────────────────────────────────────────┐   │
│  │  useEffect runs on mount:                   │   │
│  │  1. Check URL params for errors             │   │
│  │  2. Extract AuthTokenHolder cookie          │   │
│  │  3. Validate cookie structure               │   │
│  │  4. setUser(user)                          │   │
│  │  5. setTokens(accessToken, refreshToken)   │   │
│  │  6. Delete cookie                          │   │
│  │  7. redirectPath = getAndClearRedirectTo()  │   │
│  │  8. router.push(redirectPath || HOME)      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Render states:                                     │
│  - Processing: <LoadingSpinner /> with text        │
│  - Error: <ErrorMessage /> with retry button       │
│  - Success: null (immediately redirects)           │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│           Authenticated User State                   │
│  - User is signed in via Zustand store              │
│  - Can access protected routes                      │
│  - Tokens used for API calls                        │
└─────────────────────────────────────────────────────┘
```

---

## Contract Guarantees

All components and integrations guarantee:

1. **Type Safety**: Full TypeScript type definitions for all props and data structures
2. **Dark Mode**: All UI components support dark mode via Tailwind semantic colors
3. **i18n Compatibility**: All user-facing text uses next-intl translation system
4. **Error Handling**: All async operations handle errors with user-friendly messages
5. **Loading States**: Clear loading indicators during asynchronous processing
6. **Accessibility**: Descriptive text for screen readers, keyboard navigation support
7. **Consistency**: OAuth authentication produces identical state to email/password auth
8. **Security**: Tokens handled securely, cookie deleted after extraction, no sensitive data in errors

---

## Migration Notes

When implementing these contracts:

1. **Callback Page**: Create new file, no existing code to migrate
2. **Sign-In Page**: Add button and handler, minimal changes to existing page
3. **Routes Constants**: Single line addition to existing file
4. **i18n Messages**: Single translation key addition to both locale files
5. **Zustand Store**: No changes required, reuse existing methods
6. **Environment Variables**: Already exists, no changes needed

All changes are additive - no breaking changes to existing code.

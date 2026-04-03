# Research: Google OAuth Integration Approach

**Date**: 2026-03-28
**Feature**: 004-google-oauth-auth

## Overview

This document consolidates research findings for implementing Google OAuth external authentication in the Morii Coffee Next.js frontend. The implementation integrates with the existing backend OAuth endpoints and maintains consistency with the current email/password authentication system.

---

## 1. OAuth Flow Architecture

### Decision: Backend-Driven OAuth with Frontend Token Extraction

**Rationale**:
- The backend already implements OAuth endpoints (`/v1/auth/external-login` and `/v1/auth/external-auth-callback`)
- Backend handles all OAuth security concerns (state tokens, CSRF protection, token exchange with Google)
- Frontend only needs to initiate the flow and extract tokens from the callback
- This separation of concerns follows security best practices by keeping OAuth secrets server-side
- Consistent with the existing auth pattern where backend issues JWT tokens

**Flow Steps**:
1. User clicks "Sign in with Google" button on sign-in page
2. Frontend redirects to backend endpoint: `POST /v1/auth/external-login?provider=Google`
3. Backend redirects to Google OAuth consent screen
4. User authenticates and grants permissions on Google
5. Google redirects to backend callback: `GET /v1/auth/external-auth-callback?code=...&state=...`
6. Backend processes OAuth callback, creates/locates user account, issues JWT tokens
7. Backend sets `AuthTokenHolder` cookie and redirects to frontend: `/auth/callback`
8. Frontend callback page extracts tokens from cookie and stores in Zustand
9. Frontend redirects user to intended destination

**Alternatives Considered**:
- **Client-side OAuth (Google Sign-In SDK)**: Rejected because backend needs to verify tokens anyway, and dual OAuth flows would be complex
- **Server-side rendering with sessions**: Rejected because frontend is SPA with token-based auth
- **Direct Google SDK integration**: Rejected to avoid client-side secret management and maintain consistency with backend OAuth implementation

---

## 2. Token Storage Strategy

### Decision: Zustand Store with LocalStorage Persistence (Consistent with Existing Auth)

**Rationale**:
- The existing email/password authentication uses Zustand with persist middleware
- Maintaining identical token storage ensures OAuth users have the same experience
- The `auth-store.ts` already has `setUser`, `setTokens`, and `getAndClearRedirectTo` methods
- No changes needed to existing authentication guards or protected routes
- Consistent with project patterns established in previous features

**Storage Flow**:
1. Backend sets `AuthTokenHolder` cookie with `{ accessToken, refreshToken, user }`
2. Frontend callback page reads cookie value using `document.cookie`
3. Tokens are stored via `useAuthStore.setUser()` and `useAuthStore.setTokens()`
4. Zustand persist middleware automatically syncs to localStorage
5. Cookie is deleted immediately after extraction to prevent token leakage

**Cookie Properties** (set by backend):
- Name: `AuthTokenHolder`
- Max-Age: 300 seconds (5 minutes - temporary)
- HttpOnly: false (must be readable by JavaScript for extraction)
- SameSite: Strict (CSRF protection)
- Secure: true (HTTPS only in production)
- Path: /

**Alternatives Considered**:
- **httpOnly cookies only**: Rejected because would require changing entire auth system to cookie-based
- **SessionStorage**: Rejected because Zustand persist already uses localStorage and we maintain consistency
- **No persistence**: Rejected because users expect to stay logged in across page refreshes

---

## 3. Callback Page Implementation

### Decision: Client Component with Cookie Extraction Pattern

**Rationale**:
- Must be client component (`"use client"`) to access `document.cookie` and browser APIs
- Uses Next.js App Router conventions with `useSearchParams` for error handling
- Follows existing project patterns for error display and loading states
- Reuses existing UI components (LoadingSpinner, ErrorMessage, Button, Card)

**Implementation Pattern**:
```typescript
// src/app/auth/callback/page.tsx
"use client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const getAndClearRedirectTo = useAuthStore((s) => s.getAndClearRedirectTo);

  useEffect(() => {
    // Extract and validate tokens from cookie
    // Store in Zustand
    // Redirect to intended destination
  }, []);

  // Render loading/error states
}
```

**Error Handling Strategy**:
- Check URL params for error first (user denied, backend error)
- Validate cookie exists and contains required fields
- Validate token structure before storing
- Display user-friendly error messages
- Provide "Back to Sign In" button for recovery
- No sensitive information in error messages

**Alternatives Considered**:
- **Server component with cookies()**: Rejected because need client-side state management and Zustand access
- **API route for token extraction**: Rejected as unnecessary complexity and doesn't fit App Router patterns
- **Middleware for token handling**: Rejected because tokens need to go into client-side Zustand store

---

## 4. Sign-In Page Integration

### Decision: Inline Google Button Handler with Existing UI

**Rationale**:
- Google button placed alongside existing social login buttons (Facebook is disabled)
- Uses existing Button component with outline variant for consistency
- Handler directly redirects to backend OAuth endpoint
- No state management needed on sign-in page (Zustand already handles redirectTo)
- Follows shadcn/ui patterns used throughout the project

**Button Implementation**:
```typescript
const handleGoogleSignIn = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5100/api";
  const oauthUrl = `${apiBaseUrl}/v1/auth/external-login?provider=Google`;
  window.location.href = oauthUrl;
};

<Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn}>
  <GoogleLogo className="mr-2 h-4 w-4" />
  {t("google")}
</Button>
```

**i18n Integration**:
- Add `"google": "Google"` to `messages/en.json`
- Add `"google": "Google"` to `messages/vi.json`
- Use `useTranslations("auth")` to access translation

**Alternatives Considered**:
- **Separate GoogleSignInButton component**: Rejected as over-engineering for a simple onClick handler
- **Custom hook for OAuth initiation**: Rejected because no complex logic needed
- **Loading state on button**: Rejected because page immediately navigates away

---

## 5. Protected Route Redirect Flow

### Decision: Reuse Existing redirectTo Mechanism (No Changes Needed)

**Rationale**:
- The existing `useProtectedRoute` hook already stores intended destination in `redirectTo`
- The existing `useAuthGuard` hook prevents authenticated users from accessing sign-in page
- The callback page uses `getAndClearRedirectTo()` to retrieve stored path
- OAuth flow inherits this behavior automatically with zero changes
- Maintains consistency between email/password and OAuth authentication

**Flow Verification**:
1. Unauthenticated user navigates to `/profile`
2. `useProtectedRoute` stores `/profile` in Zustand `redirectTo`
3. User redirected to `/sign-in`
4. User clicks "Sign in with Google"
5. After OAuth completion, callback page calls `getAndClearRedirectTo()`
6. Returns `/profile` (or null if signed in directly)
7. User redirected to `/profile` (or home page if null)

**Alternatives Considered**:
- **Pass returnUrl in OAuth URL**: Rejected because Zustand already handles this
- **URL params for redirect**: Rejected as less secure and Zustand is more reliable
- **SessionStorage for redirect**: Rejected because Zustand persist already handles it

---

## 6. Routes Configuration

### Decision: Add AUTH_CALLBACK Constant and Public Route Entry

**Rationale**:
- Maintains consistency with existing routes constants pattern
- The callback route must be public (no auth required)
- Follows established pattern in `constants/routes.ts`
- Easy to reference throughout codebase

**Updates Required**:
```typescript
// src/constants/routes.ts
export const ROUTES = {
  // ... existing routes
  AUTH_CALLBACK: "/auth/callback",
} as const;

// Update isPublicRoute function
export function isPublicRoute(path: string): boolean {
  const publicRoutes = [
    // ... existing public routes
    ROUTES.AUTH_CALLBACK,
  ];
  return publicRoutes.some((route) => path === route || path.startsWith(route));
}
```

**Alternatives Considered**:
- **Hardcoded route strings**: Rejected to maintain type safety and consistency
- **Dynamic route determination**: Rejected as unnecessary complexity

---

## 7. Dark Mode and i18n Support

### Decision: Use Existing Patterns (No Special Handling Needed)

**Rationale**:
- All existing UI components support dark mode via Tailwind CSS variables
- The callback page uses existing components (LoadingSpinner, ErrorMessage, Button, Card)
- i18n handled via next-intl with existing translation infrastructure
- Following Morii Coffee patterns documented in `morii-coffee-patterns` skill

**Dark Mode Pattern**:
```typescript
// Existing components handle dark mode automatically via Tailwind classes
<div className="bg-background text-foreground">
  <span className="text-muted-foreground">
    {/* Dark mode handled by CSS variables */}
  </span>
</div>
```

**i18n Pattern**:
```typescript
// Use existing useTranslations hook
const t = useTranslations("auth");
<button>{t("google")}</button>
```

**Alternatives Considered**:
- **Manual dark mode detection**: Rejected because components already handle it
- **Separate translations file**: Rejected because auth translations already exist

---

## 8. Error Scenarios and Recovery

### Decision: Comprehensive Error Handling with User-Friendly Messages

**Rationale**:
- OAuth has multiple failure points (user denial, network issues, invalid tokens)
- Users need clear guidance on what went wrong and how to recover
- Security-conscious error messages (no sensitive data exposure)
- Consistent with existing error handling patterns

**Error Scenarios**:
1. **User denies Google permissions**: Display "Authentication cancelled" with retry option
2. **Missing/expired cookie**: Display "No authentication token received" with sign-in link
3. **Invalid token data**: Display "Invalid authentication data" with sign-in link
4. **Network errors**: Display "Failed to process authentication" with retry option
5. **Backend error in URL params**: Display error message from backend

**Error Display Pattern**:
```typescript
if (error) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-destructive">Authentication Error</CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorMessage message={error} />
        <Button onClick={() => router.push(ROUTES.SIGN_IN)}>
          Back to Sign In
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Alternatives Considered**:
- **Generic error messages**: Rejected because users need specific guidance
- **Automatic retry**: Rejected because some errors are user-initiated (denial)
- **Toast notifications**: Rejected because errors should be persistent on callback page

---

## 9. Security Considerations

### Decision: Rely on Backend Security + Client-Side Validation

**Rationale**:
- Backend handles all OAuth security (state tokens, CSRF, token exchange)
- Frontend validates token structure before storing
- Cookie deleted immediately after extraction
- No sensitive OAuth credentials on frontend
- HTTPS enforced in production via backend cookie Secure flag

**Security Measures**:
1. **State token validation**: Handled by backend
2. **CSRF protection**: SameSite=Strict cookie attribute
3. **Token validation**: Frontend checks for required fields before storing
4. **Temporary cookie**: 5-minute expiration reduces exposure window
5. **Cookie cleanup**: Deleted immediately after extraction
6. **HTTPS requirement**: Production enforces Secure cookie flag

**Alternatives Considered**:
- **Client-side state token management**: Rejected to avoid complexity and security risks
- **Persistent auth cookies**: Rejected because token-based auth is established pattern
- **Additional client-side validation**: Rejected as backend already validates thoroughly

---

## 10. Testing Strategy

### Decision: Manual Testing with Defined Test Scenarios

**Rationale**:
- Project uses manual testing (no automated test infrastructure)
- Focus on key user flows and error scenarios
- Test both light/dark mode and both locales (VI/EN)
- Verify consistency with email/password authentication

**Test Scenarios**:
1. **Happy path**: Click Google button → consent → authenticated → home page
2. **Protected route redirect**: Access `/profile` logged out → sign in with Google → return to `/profile`
3. **User denial**: Click Google button → deny permissions → see error → retry
4. **Missing cookie**: Simulate missing cookie → see error → return to sign-in
5. **Dark mode**: Verify all OAuth UI renders correctly in dark mode
6. **i18n**: Verify button text and error messages in both VI and EN
7. **Multiple attempts**: Verify no issues with clicking Google button multiple times

**Alternatives Considered**:
- **Automated E2E tests**: Rejected because project has no test infrastructure
- **Unit tests**: Rejected as no test framework configured
- **Backend integration tests**: Out of scope (backend feature already implemented)

---

## Summary of Key Decisions

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| **OAuth Architecture** | Backend-driven with frontend token extraction | Security best practices, backend handles OAuth secrets |
| **Token Storage** | Zustand with localStorage persist (existing pattern) | Consistency with email/password auth, no system changes |
| **Callback Implementation** | Client component with cookie extraction | Access to browser APIs, Zustand integration |
| **Sign-In Integration** | Inline button handler with existing UI | Simple, consistent with project patterns |
| **Redirect Flow** | Reuse existing redirectTo mechanism | Zero changes needed, inherits behavior |
| **Routes Configuration** | Add AUTH_CALLBACK constant | Type safety, consistency with existing patterns |
| **Dark Mode/i18n** | Use existing component patterns | Components already handle it automatically |
| **Error Handling** | Comprehensive with user-friendly messages | Multiple failure points need clear guidance |
| **Security** | Backend + client-side validation | Separation of concerns, defense in depth |
| **Testing** | Manual with defined scenarios | Aligns with project testing approach |

---

## Next Steps

With research complete, proceed to Phase 1:
1. Create data model document (authentication flow state, token structure)
2. Define UI contracts (callback page component, Google button interface)
3. Write quickstart guide (implementation steps and validation)

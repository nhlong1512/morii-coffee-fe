# Data Model: Google OAuth Authentication

**Feature**: 004-google-oauth-auth
**Date**: 2026-03-28

## Overview

This document defines the data structures, state shapes, and validation rules for the Google OAuth authentication feature. The model integrates with the existing Zustand auth store and maintains consistency with email/password authentication patterns.

---

## 1. Authentication Token Cookie

**Entity**: AuthTokenHolder Cookie (temporary, set by backend)

**Purpose**: Transport authentication tokens from backend OAuth callback to frontend callback page

**Structure**:
```typescript
interface AuthTokenHolderCookie {
  accessToken: string;       // JWT access token for API authentication
  refreshToken: string;      // JWT refresh token for token renewal
  user: ApiUserProfile;      // User profile data from backend
}
```

**Cookie Properties**:
- **Name**: `AuthTokenHolder`
- **Max-Age**: 300 seconds (5 minutes)
- **HttpOnly**: false (must be readable by JavaScript)
- **SameSite**: Strict
- **Secure**: true (HTTPS only in production)
- **Path**: /

**Validation Rules**:
1. Cookie must exist when callback page loads
2. Cookie value must be valid JSON
3. All three fields (accessToken, refreshToken, user) must be present
4. Token strings must not be empty
5. User object must conform to ApiUserProfile structure

**Lifecycle**:
1. Created by backend after successful OAuth callback
2. Read by frontend callback page within 5 minutes
3. Deleted by frontend immediately after extraction
4. Automatically expires after 5 minutes if not extracted

---

## 2. Zustand Auth Store State

**Entity**: Authentication State (existing, reused)

**Purpose**: Client-side authentication state management with localStorage persistence

**Structure** (from `src/stores/auth-store.ts`):
```typescript
interface AuthState {
  user: ApiUserProfile | null;        // Current authenticated user or null
  accessToken: string | null;         // JWT access token or null
  refreshToken: string | null;        // JWT refresh token or null
  isAuthenticated: boolean;           // Computed: true if user and tokens exist
  redirectTo: string | null;          // Intended navigation destination

  // Actions (methods used by OAuth flow)
  setUser: (user: ApiUserProfile) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  getAndClearRedirectTo: () => string | null;
  // ... other methods
}
```

**OAuth Integration**:
- OAuth authentication sets the same state fields as email/password
- `setUser()` stores user profile from OAuth cookie
- `setTokens()` stores access and refresh tokens from OAuth cookie
- `getAndClearRedirectTo()` retrieves stored redirect path after protected route trigger
- No modifications to existing store structure required

**Persistence**:
- Zustand persist middleware syncs to localStorage under key `morii-auth`
- State survives page refreshes and browser restarts
- Logged out state clears all fields

---

## 3. User Profile

**Entity**: ApiUserProfile (existing, defined in `src/types/api.ts`)

**Purpose**: User account information returned by backend after OAuth authentication

**Structure** (existing):
```typescript
interface ApiUserProfile {
  id: string;                    // Unique user identifier
  email: string;                 // User's Google email
  phoneNumber: string | null;    // Phone number (null for OAuth users)
  userName: string;              // Username derived from Google profile
  fullName: string | null;       // Full name from Google profile
  dob: string | null;            // Date of birth (null for OAuth users)
  gender: EGender | null;        // Gender (null for OAuth users)
  bio: string | null;            // Biography (null for OAuth users)
  avatarUrl: string | null;      // Google profile picture URL
  status: EUserStatus;           // Account status (Active for OAuth)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  roles: UserRole[];             // ['CUSTOMER'] for OAuth users
}
```

**OAuth-Specific Values**:
- `phoneNumber`: Typically null (not provided by Google)
- `dob`: Typically null (Google doesn't provide by default)
- `gender`: Typically null (Google doesn't provide by default)
- `bio`: Typically null (no Google equivalent)
- `avatarUrl`: Google profile picture if available
- `roles`: Automatically set to `['CUSTOMER']` by backend

**Validation Rules**:
1. `id` must be non-empty string
2. `email` must be valid email format
3. `userName` must be non-empty string
4. `roles` must contain at least one role
5. `createdAt` and `updatedAt` must be valid ISO 8601 timestamps

---

## 4. Callback Page State

**Entity**: Callback Page Component State (local)

**Purpose**: Track processing and error states during token extraction

**Structure**:
```typescript
interface CallbackPageState {
  error: string | null;          // Error message to display, or null
  isProcessing: boolean;         // True while extracting/storing tokens
}
```

**State Transitions**:
1. **Initial**: `{ error: null, isProcessing: true }`
2. **Success**: Component redirects (no state change needed)
3. **Error**: `{ error: "error message", isProcessing: false }`

**Error Messages** (user-facing):
- `"Authentication cancelled"` - User denied Google permissions
- `"No authentication token received. Please try again."` - Cookie missing
- `"Invalid authentication data received."` - Cookie malformed
- `"Failed to process authentication. Please try again."` - Unknown error

---

## 5. OAuth Flow URLs

**Entity**: URL Patterns (routing and redirection)

**Purpose**: Define all URLs involved in the OAuth flow

**URLs**:
```typescript
// Backend endpoints (environment-specific)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api";

const OAUTH_ENDPOINTS = {
  // Initiate OAuth flow
  INITIATE: `${API_BASE_URL}/v1/auth/external-login?provider=Google`,

  // Backend callback (handled by backend, not called by frontend)
  BACKEND_CALLBACK: `${API_BASE_URL}/v1/auth/external-auth-callback`,
};

// Frontend routes (from src/constants/routes.ts)
const ROUTES = {
  SIGN_IN: "/sign-in",           // Sign-in page with Google button
  AUTH_CALLBACK: "/auth/callback", // OAuth callback page (NEW)
  HOME: "/",                     // Default redirect after auth
  // ... other routes
};
```

**Redirect Flow**:
1. User at: `/sign-in`
2. Redirects to: `${API_BASE_URL}/v1/auth/external-login?provider=Google`
3. Backend redirects to: Google OAuth consent screen
4. Google redirects to: `${API_BASE_URL}/v1/auth/external-auth-callback?code=...`
5. Backend redirects to: `/auth/callback`
6. Frontend redirects to: `redirectTo` path or `/` (home)

---

## 6. Error State

**Entity**: OAuth Error Information (from URL params or processing)

**Purpose**: Communicate error details to callback page

**URL Error Parameters** (set by backend on auth failure):
```typescript
interface OAuthErrorParams {
  error: string;                 // Error code (e.g., "access_denied")
  message?: string;              // Human-readable error message
}

// Example: /auth/callback?error=access_denied&message=User%20cancelled
```

**Processing Errors** (caught by frontend):
```typescript
enum OAuthErrorType {
  MISSING_COOKIE = "No authentication token received",
  INVALID_COOKIE = "Invalid authentication data received",
  MALFORMED_DATA = "Failed to process authentication",
  NETWORK_ERROR = "Failed to process authentication",
}
```

**Error Handling Strategy**:
1. Check URL params first for backend-originated errors
2. Check cookie existence
3. Validate cookie structure
4. Catch JSON parse errors
5. Display user-friendly message with recovery option

---

## 7. i18n Translation Keys

**Entity**: Translation Keys (additions to existing i18n messages)

**Purpose**: Support Google OAuth button text in multiple locales

**Additions to `src/i18n/messages/en.json`**:
```json
{
  "auth": {
    // ... existing translations
    "google": "Google"
  }
}
```

**Additions to `src/i18n/messages/vi.json`**:
```json
{
  "auth": {
    // ... existing translations
    "google": "Google"
  }
}
```

**Note**: "Google" remains "Google" in both languages as it's a brand name.

---

## 8. Environment Configuration

**Entity**: Environment Variables (existing, reused)

**Purpose**: Configure backend API endpoints for OAuth

**Required Variables**:
```bash
# .env.local (development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002/api

# .env.production (production)
NEXT_PUBLIC_API_BASE_URL=https://api.moriicoffee.com/api
```

**Usage in Code**:
```typescript
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api";
const oauthUrl = `${apiBaseUrl}/v1/auth/external-login?provider=Google`;
```

**Validation**:
- Variable must be set before build (checked at build time)
- Must be a valid URL without trailing slash
- Must use HTTPS in production

---

## 9. Type Definitions Summary

**New Types** (to be added):
```typescript
// src/types/oauth.ts (optional, or inline in components)

/** Cookie structure set by backend after OAuth callback */
interface AuthTokenHolderCookie {
  accessToken: string;
  refreshToken: string;
  user: ApiUserProfile;
}

/** OAuth error parameters from URL */
interface OAuthErrorParams {
  error: string;
  message?: string;
}
```

**Existing Types** (reused, no changes):
- `ApiUserProfile` - from `src/types/api.ts`
- `UserRole` - from `src/enums`
- `AuthState` - from `src/stores/auth-store.ts`

---

## 10. State Validation Rules

### AuthTokenHolderCookie Validation

**Rules**:
1. Cookie must exist: `document.cookie.includes("AuthTokenHolder=")`
2. Cookie value must be URL-decodable
3. Decoded value must be valid JSON
4. JSON must have all required fields: `accessToken`, `refreshToken`, `user`
5. `accessToken` must be non-empty string
6. `refreshToken` must be non-empty string
7. `user` must be valid `ApiUserProfile` object with non-empty `id`, `email`, `userName`

**Validation Code Pattern**:
```typescript
function validateAuthCookie(cookieValue: string): AuthTokenHolderCookie | null {
  try {
    const decodedValue = decodeURIComponent(cookieValue);
    const authData = JSON.parse(decodedValue);

    if (!authData.accessToken || !authData.refreshToken || !authData.user) {
      return null;
    }

    if (!authData.user.id || !authData.user.email || !authData.user.userName) {
      return null;
    }

    return authData as AuthTokenHolderCookie;
  } catch (error) {
    return null;
  }
}
```

### Zustand State Validation

**Rules** (enforced by Zustand store):
1. `isAuthenticated` is true only when `user`, `accessToken`, and `refreshToken` all exist
2. All tokens must be non-empty strings when set
3. User must be valid `ApiUserProfile` when set
4. `redirectTo` can be null or a valid URL path string

---

## Data Flow Diagram

```
┌─────────────────┐
│   Sign-In Page  │
│  (User clicks)  │
└────────┬────────┘
         │
         ├─ redirectTo stored (if from protected route)
         │
         ▼
┌─────────────────┐
│ Backend OAuth   │──► Google Consent Screen
│   Initiation    │◄─┐
└─────────────────┘  │
                     │ User authenticates
                     │
┌─────────────────┐  │
│ Backend OAuth   │◄─┘
│    Callback     │
└────────┬────────┘
         │
         ├─ Create/locate user account
         ├─ Generate JWT tokens
         ├─ Set AuthTokenHolder cookie
         │
         ▼
┌─────────────────┐
│ Frontend Callback│
│      Page       │
└────────┬────────┘
         │
         ├─ Extract cookie
         ├─ Validate structure
         ├─ Store in Zustand: setUser(), setTokens()
         ├─ Delete cookie
         ├─ Get redirectTo: getAndClearRedirectTo()
         │
         ▼
┌─────────────────┐
│  Authenticated  │
│   User State    │
└─────────────────┘
```

---

## Summary

The Google OAuth authentication feature reuses the existing data structures from email/password authentication:
- **Zustand auth store**: No changes, uses existing methods
- **ApiUserProfile**: No changes, same structure
- **Routes constants**: One addition (`AUTH_CALLBACK`)
- **New structures**: Only `AuthTokenHolderCookie` (temporary) and callback page state (local)

This minimal data model maintains consistency with the existing authentication system and requires no database schema changes or backend API modifications beyond what already exists.

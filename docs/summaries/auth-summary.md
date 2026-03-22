# Auth Feature — Implementation Summary

## Overview

Full authentication flow wired to the real backend API. Covers sign-in, sign-up, forgot password, reset password, and token management with automatic refresh. The auth store is the single source of truth for user session state across both the client site and admin panel.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/services/auth-service.ts` | 5 API functions: `signUp`, `signIn`, `refreshToken`, `forgotPassword`, `resetPassword` |
| `src/interfaces/auth/index.ts` | All request/param types: `SignInRequest`, `SignUpRequest`, `RefreshTokenRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `UpdateProfileRequest`, `ChangePasswordRequest`, `AssignRolesRequest`, `GetUsersParams` |
| `src/app/reset-password/page.tsx` | New page — parses `token` + `email` from URL, calls `resetPassword()`, redirects to sign-in on success |
| `docs/api/auth-users-api-structure.md` | Full API contract documentation for all 12 endpoints |

## Files Modified

| File | Change |
|------|--------|
| `src/lib/api.ts` | Added `registerAuthHandlers()` pattern for token interceptor; auto-attaches Bearer token, auto-refreshes on 401 with concurrent refresh guard; added `skipAuth` option |
| `src/stores/auth-store.ts` | Rewritten — uses `ApiUserProfile`, stores `accessToken`/`refreshToken`, async `signIn`/`signUp` actions, registers auth handlers on module load |
| `src/enums/index.ts` | Added `UserRole`, `EUserStatus`, `EGender` enums |
| `src/types/api.ts` | Added `ApiUserProfile`, `ApiAuthResponse`, `ApiUserListItem` interfaces |
| `src/app/sign-in/page.tsx` | Wired to real API via store's `signIn()` action |
| `src/app/sign-up/page.tsx` | Wired to real API; updated fields to `userName`, `phoneNumber` |
| `src/app/forgot-password/page.tsx` | Calls `forgotPassword()` from auth-service; anti-enumeration (always shows success) |
| `src/app/change-password/page.tsx` | Calls `changePassword()` from user-service |
| `src/app/admin/login/page.tsx` | Wired to real API via store's `signIn()` action |
| `src/app/admin/layout.tsx` | Auth guard uses `UserRole.Admin` enum; uses `ApiUserProfile` fields |
| `src/components/layout/header.tsx` | Uses `user.fullName || user.userName` and `user.avatarUrl` |
| `src/components/layout/mobile-menu.tsx` | Shows authenticated user name or sign-in button |

---

## API Endpoints Used

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/signup` | Register new user — returns `ApiAuthResponse` |
| `POST` | `/api/v1/auth/signin` | Login — returns `ApiAuthResponse` |
| `POST` | `/api/v1/auth/refresh` | Refresh access token — returns `ApiAuthResponse` |
| `POST` | `/api/v1/auth/forgot-password` | Send password reset email — returns 200 |
| `POST` | `/api/v1/auth/reset-password` | Reset password with token — returns 200 |

All auth endpoints use `skipAuth: true` to avoid attaching Bearer tokens.

---

## Token Management

### Flow
1. On sign-in/sign-up: tokens stored in Zustand persist store (localStorage key: `morii-auth`)
2. Every API call: `apiFetch` auto-attaches `Authorization: Bearer <accessToken>` header
3. On 401 response: interceptor calls `POST /v1/auth/refresh` with the refresh token
4. If refresh succeeds: retries the original request with the new access token
5. If refresh fails: clears session and redirects to `/sign-in`

### Concurrent Refresh Guard
- Uses `_refreshPromise` deduplication — if multiple requests fail with 401 simultaneously, only one refresh call is made
- All waiting requests receive the same refreshed token

### Circular Import Prevention
- `api.ts` does not import `auth-store.ts` directly
- Instead, `registerAuthHandlers(getTokens, setTokens, clearSession)` is called from the store module, passing closures that access store state

---

## Auth Guard Behavior

### Client Site
- Header and mobile menu check `isAuthenticated` to show user info or sign-in button
- No route-level guards on client pages (anyone can visit products, blog, etc.)
- Profile and change-password pages redirect to sign-in if not authenticated (handled in-component)

### Admin Panel
- `admin/layout.tsx` runs an auth guard on mount
- Checks `isAuthenticated` AND `user.roles.includes(UserRole.Admin)`
- Non-admin users are redirected to `/admin/login`
- Login page bypasses the guard (early return)
- Loading state shown during hydration and redirect

---

## Business Rules Applied

| Rule | Implementation |
|------|---------------|
| `identity` field accepts email or phone | Sign-in form label says "Email or Phone Number" |
| Anti-enumeration on forgot-password | Always shows "Check your email" regardless of API result |
| Reset password token from URL params | Uses `useSearchParams()` wrapped in `Suspense` |
| OAuth buttons present but disabled | Google/Facebook buttons render with `disabled` prop |
| Persist key migration | Changed from `morii-admin-auth` to `morii-auth` to avoid stale data hydration |
| At least one role required for role assignment | Save button disabled when `editRoles.length === 0` |

---

## End-to-End Testing Checklist

### Sign In
1. Navigate to `/sign-in` → enter valid email + password → verify redirect to `/`
2. Enter invalid credentials → verify "Invalid credentials" error shown
3. Verify header shows user's display name and avatar after login

### Sign Up
1. Navigate to `/sign-up` → fill email, phone, username, password → verify redirect to `/`
2. Use duplicate email → verify error message shown

### Forgot Password
1. Navigate to `/forgot-password` → enter email → verify success message shown
2. Enter non-existent email → verify same success message (anti-enumeration)

### Reset Password
1. Navigate to `/reset-password?token=...&email=...` → enter new password → verify success and redirect to sign-in
2. Use expired/invalid token → verify error message

### Change Password
1. Navigate to `/change-password` (while logged in) → enter current + new password → verify success
2. Enter wrong current password → verify error message

### Token Refresh
1. Wait for access token to expire → make an API call → verify automatic refresh and successful retry
2. With expired refresh token → verify redirect to sign-in

### Admin Login
1. Navigate to `/admin/login` → sign in with admin credentials → verify redirect to `/admin/reports`
2. Sign in with non-admin user → verify redirect back to `/admin/login`

# Users Feature — Implementation Summary

## Overview

User profile management and admin user management wired to the real backend API. Self-service users can view/edit their profile, change their avatar, and update their password. Admins can list all users with search/filter/pagination and manage user roles.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/services/user-service.ts` | 7 API functions: `getMe`, `updateProfile`, `changeAvatar`, `changePassword`, `getUsers`, `getUserById`, `assignRoles` |

## Files Modified

| File | Change |
|------|--------|
| `src/app/profile/page.tsx` | Rewritten — uses `ApiUserProfile` fields, avatar upload via `changeAvatar()`, profile edit via `updateProfile()`, gender select, dob date picker, bio textarea |
| `src/app/change-password/page.tsx` | Wired to `changePassword()` from user-service |
| `src/app/admin/users/page.tsx` | Rewritten — fetches from real API via `getUsers()`, server-side pagination, search and status filter |
| `src/app/admin/users/[id]/page.tsx` | Rewritten — fetches user via `getUserById()`, role management with checkbox UI, calls `assignRoles()` |

---

## API Endpoints Used

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/users/me` | Bearer | Get current user's profile |
| `PUT` | `/api/v1/users/me/profile` | Bearer | Update profile (fullName, dob, gender, bio) |
| `PUT` | `/api/v1/users/me/avatar` | Bearer | Upload avatar — `multipart/form-data`, field name `Avatar` |
| `PUT` | `/api/v1/users/me/change-password` | Bearer | Change password (currentPassword, newPassword) |
| `GET` | `/api/v1/users` | Admin | List users with pagination + search + status filter |
| `GET` | `/api/v1/users/{id}` | Admin | Get user by ID — returns full `ApiUserProfile` |
| `PUT` | `/api/v1/users/{id}/roles` | Admin | Assign roles — full replacement, sends complete role list |

---

## Self-Service Profile (`/profile`)

### Profile Tab
- Displays avatar with Camera button overlay for upload
- Avatar upload: file input accepts `image/*`, calls `changeAvatar(file)` (multipart `Avatar` field), updates store
- Edit mode toggle for profile fields: fullName, dob, gender, bio
- Gender uses `<Select>` with `EGender` enum values (Male, Female, Other)
- DOB uses `<input type="date" />`
- Bio uses `<Textarea>`
- Save calls `updateProfile()` then `setUser()` to sync auth store
- Change Password link navigates to `/change-password`

### Orders Tab
- Displays user's order history (still using mock data — orders API not yet wired)

### Wishlist Tab
- Shows wishlist items from Zustand store (client-side only, no API)

---

## Admin User Management

### User List (`/admin/users`)
- Table with columns: User (avatar + name + email), Status badge, Actions (eye icon → detail)
- Search input filters by name or email
- Status filter dropdown: All, Active, Inactive
- Server-side pagination: Previous/Next buttons, "Page X of Y" indicator
- Page size: 10
- Resets to page 1 when filters change

### User Detail (`/admin/users/[id]`)
- Header: display name, role badges (color-coded: Admin=purple, Staff=blue, Customer=gray), status badge
- Profile card: avatar, full name, email, username, phone, join date
- Profile information grid: full name, username, email, phone, DOB, gender, bio
- Role management section:
  - Checkboxes for all `UserRole` enum values
  - Save button disabled when no changes or zero roles selected
  - Calls `assignRoles(userId, roles)` — full replacement (not append)
  - Success/error feedback message
  - Refetches user after save to confirm

---

## Cleanup Performed

| Item | Action |
|------|--------|
| `src/data/user.ts` | Deleted — `dummyUser` no longer used anywhere |
| `src/data/admin/users.ts` | Deleted — admin users page wired to real API |
| `src/types/index.ts` | Removed old `UserProfile` interface (replaced by `ApiUserProfile`) |
| `src/app/loyalty/page.tsx` | Replaced `dummyUser.loyaltyPoints`/`tier` with placeholder values (loyalty API not yet available) |

---

## Business Rules Applied

| Rule | Implementation |
|------|---------------|
| Avatar upload field name is `Avatar` (capital A) | `fd.append("Avatar", file)` in `changeAvatar()` |
| Role assignment is full replacement | UI sends complete checked list; button disabled if zero selected |
| Profile update is partial | Only sends `fullName`, `dob`, `gender`, `bio` — email and username are read-only |
| Admin-only endpoints | Admin layout auth guard checks `UserRole.Admin` before rendering |

---

## End-to-End Testing Checklist

### Profile
1. Navigate to `/profile` → verify user info loads from API
2. Click camera icon → select image → verify avatar updates
3. Enable edit mode → change full name → save → verify updated in header
4. Change DOB, gender, bio → save → reload → verify persisted

### Change Password
1. Navigate to `/change-password` → enter current + new password → verify success
2. Enter wrong current password → verify error

### Admin User List
1. Navigate to `/admin/users` → verify list loads with pagination
2. Type in search → verify results filter
3. Select status filter → verify results filter
4. Click eye icon → verify navigates to user detail

### Admin User Detail
1. Navigate to `/admin/users/[id]` → verify profile info loads
2. Check/uncheck role checkboxes → Save Roles → verify success message
3. Try to save with zero roles → verify button is disabled

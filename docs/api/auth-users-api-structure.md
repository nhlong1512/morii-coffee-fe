# Auth API Structure & Contracts

This document describes all Authentication endpoints consumed by the Morii Coffee frontend, including exact TypeScript interfaces derived from real API responses.

> **Base URL:** `http://localhost:8002/api/v1` (development)
>
> **Auth Strategy:** JWT Bearer tokens — `accessToken` (short-lived) + `refreshToken` (long-lived, opaque string). Store both in the Zustand auth store with `persist` middleware.

---

## Enums & Shared Types

```typescript
// User role — controls access level throughout the application
type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER'

// User account status
type EUserStatus = 'Active' | 'Inactive'   // Inactive = banned

// Gender
type EGender = 'Male' | 'Female' | 'Other'
```

### Role Access Table

| Role       | Access Level                                                                           |
|------------|----------------------------------------------------------------------------------------|
| `ADMIN`    | Full access — manage users, products, banners, categories, orders, all permissions    |
| `STAFF`    | Manage orders, view products, view banners, view users                                 |
| `CUSTOMER` | Place orders, view products, view banners, manage own profile                          |

---

## Shared Interfaces

These interfaces are returned by all auth endpoints.

```typescript
interface UserProfile {
  id: string
  email: string
  phoneNumber: string | null
  userName: string
  fullName: string | null
  dob: string | null          // ISO 8601 datetime, nullable
  gender: EGender | null
  bio: string | null
  avatarUrl: string | null
  status: EUserStatus         // 'Active' | 'Inactive'
  createdAt: string           // ISO 8601 datetime
  updatedAt: string           // ISO 8601 datetime
  roles: UserRole[]           // e.g. ['CUSTOMER']
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserProfile
}
```

### Standard API Envelope

All responses are wrapped in a consistent envelope shape:

```typescript
interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
  errors: string[] | null
}
```

---

## Endpoint 1 — Sign Up

```
POST /api/v1/auth/signup
Content-Type: application/json
HTTP 201 Created
```

**Usage:** New user registration — creates an account and logs the user in immediately.

### TypeScript Interface

```typescript
interface SignUpRequest {
  email: string
  phoneNumber: string
  password: string
  userName: string
}

// Response — HTTP 201, wrapped in ApiResponse<AuthResponse>
type SignUpResponse = AuthResponse
```

### Example curl

```bash
curl -X 'POST' 'http://localhost:8002/api/v1/auth/signup' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "moriicoffee03.@client.com",
    "phoneNumber": "01234562204",
    "password": "MoriiCoffee03@Client",
    "userName": "moriicoffee03client"
  }'
```

### Example Response — HTTP 201

```json
{
  "statusCode": 201,
  "message": "Created",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "0058c37c88c94c80a9a1e8c892cfb94e",
    "user": {
      "id": "e9252306-4db6-4c12-9bf5-08de87fa96ce",
      "email": "moriicoffee03.@client.com",
      "phoneNumber": "01234562204",
      "userName": "moriicoffee03client",
      "fullName": null,
      "dob": null,
      "gender": null,
      "bio": null,
      "avatarUrl": null,
      "status": "Active",
      "createdAt": "2026-03-22T10:05:47.5186536Z",
      "updatedAt": "2026-03-22T10:05:47.8255132Z",
      "roles": ["CUSTOMER"]
    }
  },
  "errors": null
}
```

### Notes

- **Auto-login:** Sign up immediately returns `accessToken` and `refreshToken` — log the user in automatically, no separate sign in step needed.
- **Default role:** New accounts are automatically assigned the `CUSTOMER` role.
- **Null profile fields:** `fullName`, `dob`, `gender`, `bio`, `avatarUrl` are all `null` on initial signup — prompt users to complete their profile after registration.
- **Uniqueness:** `email`, `phoneNumber`, and `userName` must all be unique across the system — `400 Bad Request` is returned if any are already taken.
- **HTTP 201:** A successful sign up returns `201 Created`, not `200 OK`.
- **Error responses:** `400 Bad Request` (validation / duplicate field), `500 Internal Server Error`.

---

## Endpoint 2 — Sign In

```
POST /api/v1/auth/signin
Content-Type: application/json
HTTP 200 OK
```

**Usage:** User login — accepts email or phone number as identity, returns tokens and full user profile.

### TypeScript Interface

```typescript
interface SignInRequest {
  identity: string   // accepts: email OR phone number
  password: string
}

// Response — HTTP 200, wrapped in ApiResponse<AuthResponse>
type SignInResponse = AuthResponse
```

### Example curl — Sign in with email

```bash
curl -X 'POST' 'http://localhost:8002/api/v1/auth/signin' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "identity": "moriicoffee03.@client.com",
    "password": "MoriiCoffee03@Client"
  }'
```

### Example curl — Sign in with phone number

```bash
curl -X 'POST' 'http://localhost:8002/api/v1/auth/signin' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "identity": "01234562204",
    "password": "MoriiCoffee03@Client"
  }'
```

### Example Response — HTTP 200

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "7f935893e5734d30a1c90bd3bc06c9bd",
    "user": {
      "id": "e9252306-4db6-4c12-9bf5-08de87fa96ce",
      "email": "moriicoffee03.@client.com",
      "phoneNumber": "01234562204",
      "userName": "moriicoffee03client",
      "fullName": null,
      "dob": null,
      "gender": null,
      "bio": null,
      "avatarUrl": null,
      "status": "Active",
      "createdAt": "2026-03-22T10:05:47.5186536",
      "updatedAt": "2026-03-22T10:06:19.1499753Z",
      "roles": ["CUSTOMER"]
    }
  },
  "errors": null
}
```

### Notes

- **Flexible identity:** `identity` accepts **email** or **phone number** — the backend resolves automatically. The frontend does not need to detect or validate which type is provided.
- **Roles casing:** `roles` returns uppercase strings (e.g. `'CUSTOMER'`). Always normalize or handle case-insensitively on the frontend.
- **Generic error message:** On `401 Unauthorized` — display a generic `"Invalid credentials"` message. Do not reveal whether the email/phone exists in the system.
- **Banned users:** If `status` is `'Inactive'` in the response, the account is banned — display an appropriate message and block access.
- **Error responses:** `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`.

---

## Endpoint 3 — Refresh Token

```
POST /api/v1/auth/refresh-token
Content-Type: application/json
Authorization: Bearer <expired_access_token>
HTTP 200 OK
```

**Usage:** Silently refresh an expired `accessToken` using the stored `refreshToken`. Implement via an axios/fetch interceptor that fires automatically on any `401` from a protected endpoint.

### TypeScript Interface

```typescript
interface RefreshTokenRequest {
  refreshToken: string   // only refreshToken in the body
}

// Response — HTTP 200, wrapped in ApiResponse<AuthResponse>
type RefreshTokenResponse = AuthResponse
```

### Example curl

```bash
curl -X 'POST' 'http://localhost:8002/api/v1/auth/refresh-token' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "refreshToken": "7f935893e5734d30a1c90bd3bc06c9bd"
  }'
```

### Example Response — HTTP 200

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "7944159ce22c491997d017bd41f52d95",
    "user": {
      "id": "e9252306-4db6-4c12-9bf5-08de87fa96ce",
      "email": "moriicoffee03.@client.com",
      "phoneNumber": "01234562204",
      "userName": "moriicoffee03client",
      "fullName": null,
      "dob": null,
      "gender": null,
      "bio": null,
      "avatarUrl": null,
      "status": "Active",
      "createdAt": "2026-03-22T10:05:47.5186536",
      "updatedAt": "2026-03-22T10:06:51.7672814Z",
      "roles": ["CUSTOMER"]
    }
  },
  "errors": null
}
```

### Notes

- **Dual token placement:** Send the **expired `accessToken`** in the `Authorization: Bearer` header and the `refreshToken` in the request body — both are required.
- **Rotating refresh tokens:** The response issues a **new** `refreshToken` every time — always replace both `accessToken` and `refreshToken` in the Zustand auth store after a successful refresh.
- **Interceptor pattern:** Implement a fetch/axios interceptor that automatically calls this endpoint when any protected API call returns `401`, then retries the original request with the new `accessToken`.
- **Refresh failure:** If this endpoint returns `401` → clear the Zustand auth store entirely and redirect the user to the sign in page.
- **Concurrent requests:** Guard against multiple simultaneous refresh calls (e.g. with a `isRefreshing` flag + a queue) to avoid issuing multiple refresh requests when several API calls expire at the same time.
- **Error responses:** `401 Unauthorized` (invalid/expired refresh token), `500 Internal Server Error`.

---

## Endpoint 4 — Forgot Password

```
POST /api/v1/auth/forgot-password
Content-Type: application/json
HTTP 200 OK (always)
```

**Usage:** Initiate password reset — sends a reset link to the user's email if the account exists.

### TypeScript Interface

```typescript
interface ForgotPasswordRequest {
  email: string
}

// Response — HTTP 200
interface ForgotPasswordResponse {
  statusCode: 200
  message: 'Success'
  data: string   // e.g. "If the email exists, a reset link has been sent."
  errors: null
}
```

### Example curl

```bash
curl -X 'POST' 'http://localhost:8002/api/v1/auth/forgot-password' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{ "email": "moriicoffee03.@client.com" }'
```

### Example Response — HTTP 200

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": "If the email exists, a reset link has been sent.",
  "errors": null
}
```

### Notes

- **Always 200:** This endpoint always returns `200 OK` regardless of whether the email exists — intentional to prevent email enumeration attacks.
- **Neutral UI message:** Always display this exact generic message to the user: `"If an account with this email exists, you will receive a password reset link shortly."` — never show different UI based on success vs. failure.
- **No conditional branching:** Do not change the UI, toast color, or button state based on whether the email matched — always show the same neutral confirmation state.
- **Error responses:** `400 Bad Request` (invalid email format), `500 Internal Server Error`.

---

## Endpoint 5 — Reset Password

```
POST /api/v1/auth/reset-password
Content-Type: application/json
HTTP 200 OK
```

**Usage:** Complete password reset using the token received via email. The reset page parses both `token` and `email` from the URL query string and submits them automatically.

### TypeScript Interface

```typescript
interface ResetPasswordRequest {
  email: string
  token: string        // token received via email reset link (parsed from URL query param)
  newPassword: string
}

// Response — HTTP 200
interface ResetPasswordResponse {
  statusCode: 200
  message: 'Success'
  data: string   // e.g. "Password has been reset successfully."
  errors: null
}
```

### Example curl

```bash
curl -X 'POST' 'http://localhost:8002/api/v1/auth/reset-password' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "moriicoffee03.@client.com",
    "token": "reset-token-from-email",
    "newPassword": "NewPassword01@"
  }'
```

### Example Response — HTTP 200

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": "Password has been reset successfully.",
  "errors": null
}
```

### Notes

- **Token source:** `token` is parsed from the reset URL query parameter — e.g. `/reset-password?token=xxx&email=yyy`. Parse both `token` and `email` from the URL on the reset password page and send them automatically — do not ask the user to enter the token manually.
- **Pre-fill email:** Parse `email` from the URL query param as well and pre-fill or send it silently — do not require the user to re-enter their email on this page.
- **Invalid/expired token:** On `400 Bad Request` — display a user-friendly error: `"Reset link is invalid or has expired. Please request a new one."` with a link back to the forgot password page.
- **On success:** Redirect the user to the sign in page and show a success toast: `"Password reset successfully. Please sign in with your new password."`.
- **Error responses:** `400 Bad Request` (invalid/expired token), `500 Internal Server Error`.

---

# Users API

> All Users endpoints require a valid `Authorization: Bearer <access_token>` header. A missing or expired token returns `401 Unauthorized`.

---

## Endpoint 6 — Get My Profile

```
GET /api/v1/users/me
Authorization: Bearer <access_token>
HTTP 200 OK
```

**Usage:** Fetch the currently authenticated user's full profile. Call on app load after restoring tokens from storage to verify the session and sync the latest user data.

### TypeScript Interface

```typescript
// Response — HTTP 200, wrapped in ApiResponse<UserProfile>
type GetMyProfileResponse = UserProfile
```

### Example curl

```bash
curl -X 'GET' 'http://localhost:8002/api/v1/users/me' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example Response — HTTP 200

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "e9252306-4db6-4c12-9bf5-08de87fa96ce",
    "email": "moriicoffee03.@client.com",
    "phoneNumber": "01234562204",
    "userName": "moriicoffee03client",
    "fullName": "Zephyr Nguyen Morii",
    "dob": "2002-03-22T10:16:53.511",
    "gender": "Male",
    "bio": "No bio",
    "avatarUrl": null,
    "status": "Active",
    "createdAt": "2026-03-22T10:05:47.5186536",
    "updatedAt": "2026-03-22T10:31:12.8856764",
    "roles": ["CUSTOMER"]
  },
  "errors": null
}
```

### Notes

- **Session verification:** Call this endpoint on app load after restoring tokens from storage to confirm the session is still valid and to sync the latest `UserProfile` into the Zustand auth store.
- **401 handling:** Returns `401 Unauthorized` if the token is missing or expired — trigger the refresh token flow (Endpoint 3). If the refresh also fails, clear the auth store and redirect to sign in.
- **Error responses:** `401 Unauthorized`, `500 Internal Server Error`.

---

## Endpoint 7 — Update My Profile

```
PUT /api/v1/users/me/profile
Content-Type: application/json
Authorization: Bearer <access_token>
HTTP 200 OK
```

**Usage:** Update the authenticated user's editable profile fields — name, date of birth, gender, and bio.

### TypeScript Interface

```typescript
interface UpdateProfileRequest {
  fullName: string
  dob: string       // ISO 8601 datetime e.g. "2002-03-22T10:31:33.731Z"
  gender: EGender   // 'Male' | 'Female' | 'Other'
  bio: string
}

// Response — HTTP 200, wrapped in ApiResponse<UserProfile>
type UpdateProfileResponse = UserProfile
```

### Example curl

```bash
curl -X 'PUT' 'http://localhost:8002/api/v1/users/me/profile' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Morii Zephyr Nguyen",
    "dob": "2002-03-22T10:31:33.731Z",
    "gender": "Male",
    "bio": "No Bio Needed"
  }'
```

### Example Response — HTTP 200

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "e9252306-4db6-4c12-9bf5-08de87fa96ce",
    "email": "moriicoffee03.@client.com",
    "phoneNumber": "01234562204",
    "userName": "moriicoffee03client",
    "fullName": "Morii Zephyr Nguyen",
    "dob": "2002-03-22T10:31:33.731Z",
    "gender": "Male",
    "bio": "No Bio Needed",
    "avatarUrl": null,
    "status": "Active",
    "createdAt": "2026-03-22T10:05:47.5186536",
    "updatedAt": "2026-03-22T10:32:03.2688492Z",
    "roles": ["CUSTOMER"]
  },
  "errors": null
}
```

### Notes

- **JSON only:** Request body must be `application/json` — not `multipart/form-data`.
- **Editable fields only:** Only `fullName`, `dob`, `gender`, `bio` are editable via this endpoint. `email`, `phoneNumber`, `userName`, `roles`, and `status` cannot be changed here.
- **Sync store immediately:** After a successful update, sync the returned `data` object into the Zustand auth store immediately — do not require a page refresh.
- **`dob` format:** Must be sent as a full ISO 8601 datetime string (e.g. `"2002-03-22T10:31:33.731Z"`). Use a date picker that outputs this format, or convert the selected date with `.toISOString()`.
- **Error responses:** `400 Bad Request` (validation), `401 Unauthorized`, `500 Internal Server Error`.

---

## Endpoint 8 — Change My Avatar

```
PUT /api/v1/users/me/avatar
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
HTTP 200 OK
```

**Usage:** Upload or replace the authenticated user's profile avatar image.

### TypeScript Interface

```typescript
interface ChangeAvatarRequest {
  Avatar: File    // image file — field name must be exactly "Avatar" (capital A)
}

// Response — HTTP 200, wrapped in ApiResponse<UserProfile>
// avatarUrl in the returned UserProfile will be the new CloudFront CDN URL
type ChangeAvatarResponse = UserProfile
```

### Example curl

```bash
curl -X 'PUT' 'http://localhost:8002/api/v1/users/me/avatar' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: multipart/form-data' \
  -F 'Avatar=@profile-photo.jpg;type=image/jpeg'
```

### Example Response — HTTP 200

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "e9252306-4db6-4c12-9bf5-08de87fa96ce",
    "email": "moriicoffee03.@client.com",
    "phoneNumber": "01234562204",
    "userName": "moriicoffee03client",
    "fullName": "Morii Zephyr Nguyen",
    "dob": "2002-03-22T10:31:33.731",
    "gender": "Male",
    "bio": "No Bio Needed",
    "avatarUrl": "https://ddlda2rzhrys8.cloudfront.net/users/e9252306-4db6-4c12-9bf5-08de87fa96ce/1774175535608-richwebdev-logo.jpg",
    "status": "Active",
    "createdAt": "2026-03-22T10:05:47.5186536",
    "updatedAt": "2026-03-22T10:32:16.2454971Z",
    "roles": ["CUSTOMER"]
  },
  "errors": null
}
```

### Notes

- **Multipart only:** Request must be `multipart/form-data` — JSON will fail.
- **Field name casing:** The form field name must be exactly `Avatar` with a capital `A`. Using lowercase `avatar` will cause the request to fail silently or return a validation error.
- **CDN URL:** `avatarUrl` in the response is a CloudFront CDN URL from the public S3 bucket: `https://ddlda2rzhrys8.cloudfront.net/users/{userId}/{timestamp}-{filename}`.
- **Sync store immediately:** After a successful upload, update `avatarUrl` in the Zustand auth store so the header/profile avatar reflects the change without a page reload.
- **Image preview:** Show a preview of the selected image before uploading — do not upload automatically on file select; require a confirm/save action.
- **Upload indicator:** Show a loading spinner on the avatar upload button while the request is in progress.
- **Supported file types:** `jpg`, `jpeg`, `png`, `webp`.
- **Error responses:** `400 Bad Request` (unsupported file type / too large), `401 Unauthorized`, `500 Internal Server Error`.

---

## Endpoint 9 — Change My Password

```
PUT /api/v1/users/me/change-password
Content-Type: application/json
Authorization: Bearer <access_token>
HTTP 200 OK
```

**Usage:** Change the authenticated user's password by providing their current password and a new one.

### TypeScript Interface

```typescript
interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// Response — HTTP 200
interface ChangePasswordResponse {
  statusCode: 200
  message: 'Success'
  data: string   // plain string e.g. "Password changed successfully."
  errors: null
}
```

### Example curl

```bash
curl -X 'PUT' 'http://localhost:8002/api/v1/users/me/change-password' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "currentPassword": "MoriiCoffee03@Client",
    "newPassword": "MoriiCoffee03@ClientUpdated"
  }'
```

### Example Response — HTTP 200

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": "Password changed successfully.",
  "errors": null
}
```

### Notes

- **Plain string response:** `data` on success is a plain string — do not attempt to parse it as an object.
- **Wrong current password:** On `400 Bad Request` — display a user-friendly error: `"Current password is incorrect."` or use the error message from the response `errors` field.
- **Frontend validation:** Enforce password strength on the frontend before submitting (e.g. minimum 8 characters, at least one uppercase letter, one number, one special character — match the backend's rules to avoid round-trip errors).
- **Post-change UX:** After a successful password change, show a success toast and consider prompting the user to sign in again for security — or at minimum clear the form fields.
- **Error responses:** `400 Bad Request` (wrong current password / weak new password), `401 Unauthorized`, `500 Internal Server Error`.

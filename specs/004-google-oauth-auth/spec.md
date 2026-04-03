# Feature Specification: Google OAuth External Authentication

**Feature Branch**: `004-google-oauth-auth`
**Created**: 2026-03-28
**Status**: Draft
**Input**: User description: "Please refer to /Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/docs/features/external-auth-google/google-auth-integration-guide.md and write a specification for the external authentication feature using the Google provider. Additionally, please use the morii-coffee-patterns skill while generating the specification."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In with Google Account (Priority: P1)

When users visit the Morii Coffee application, they should be able to sign in using their existing Google account without creating a separate username and password. The Google sign-in option should appear alongside the traditional email/password sign-in form, providing users with a familiar and convenient authentication method.

**Why this priority**: This is the core value proposition of the feature - enabling users to authenticate using their Google credentials. Without this, the feature has no value. It represents the minimum viable product that delivers immediate user value by reducing friction in the authentication process.

**Independent Test**: Can be fully tested by clicking the "Sign in with Google" button on the sign-in page, completing Google's OAuth consent flow, and verifying the user is authenticated and redirected to the appropriate page. Delivers standalone value by providing an alternative authentication method that works independently of any other features.

**Acceptance Scenarios**:

1. **Given** a user visits the sign-in page, **When** they click the "Sign in with Google" button, **Then** they are redirected to Google's consent screen
2. **Given** a user completes Google authentication and grants permissions, **When** Google redirects back to the application, **Then** the user's account is created or located, and authentication tokens are issued
3. **Given** a user successfully authenticates with Google, **When** the callback page processes the tokens, **Then** the user is signed in and redirected to the home page
4. **Given** an authenticated user with Google, **When** they access protected resources, **Then** the authentication works identically to email/password authentication
5. **Given** a new user signs in with Google for the first time, **When** the authentication completes, **Then** a new account is automatically created with CUSTOMER role

---

### User Story 2 - Protected Route Redirect Flow (Priority: P2)

When a user attempts to access a protected page while not authenticated and then signs in using Google, they should be redirected back to the original page they were trying to access, not to the home page. This maintains the user's navigation intent and provides a seamless experience.

**Why this priority**: This enhances user experience by preserving navigation context across the authentication flow. While not essential for basic authentication, it significantly improves usability by reducing the steps needed to reach the intended destination. Can be implemented after P1 since it builds on the core authentication mechanism.

**Independent Test**: Can be tested by navigating to a protected route while logged out (which triggers a redirect to sign-in), completing Google OAuth, and verifying the user is returned to the original protected route. This can be verified independently by checking the redirect behavior without requiring any other features to work.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user navigates to a protected route (e.g., `/profile`), **When** they are redirected to the sign-in page, **Then** the intended destination is stored in the authentication state
2. **Given** a user on the sign-in page with a stored redirect destination, **When** they complete Google OAuth authentication, **Then** they are redirected to the original intended page instead of the home page
3. **Given** a user signs in with Google from the sign-in page directly (not via protected route redirect), **When** authentication completes, **Then** they are redirected to the home page as default

---

### User Story 3 - Error Handling and Recovery (Priority: P3)

When errors occur during the Google OAuth flow (user denies permissions, network issues, invalid state tokens), users should see clear error messages and have options to retry or use alternative authentication methods. The system should gracefully handle all error scenarios without breaking the user experience.

**Why this priority**: Error handling is important for production readiness but can be implemented after core functionality works. Users can work around errors by refreshing the page or using email/password authentication while error handling is being refined. This priority level allows focus on getting the happy path working first.

**Independent Test**: Can be tested by simulating various error conditions (denying Google permissions, expiring cookies, invalid callback parameters) and verifying appropriate error messages are displayed with recovery options. Does not require the happy path to work perfectly to test error scenarios.

**Acceptance Scenarios**:

1. **Given** a user is on Google's consent screen, **When** they click "Cancel" or deny permissions, **Then** they see a friendly error message explaining authentication was cancelled with an option to try again
2. **Given** a user completes Google authentication, **When** the authentication token cookie is missing or expired on the callback page, **Then** an error message is displayed with a "Back to Sign In" button
3. **Given** a user completes Google authentication, **When** the backend returns an error during token processing, **Then** the error details are displayed without exposing sensitive information
4. **Given** a user encounters an authentication error, **When** they click "Back to Sign In", **Then** they can attempt authentication again using any method (Google or email/password)

---

### Edge Cases

- What happens when a user tries to sign in with Google but their Google account email already exists in the system with a password-based account?
- How does the system handle network interruptions during the OAuth redirect flow?
- What happens if the authentication token cookie expires during the callback page processing (race condition)?
- How does the system handle CSRF attacks or manipulated state tokens in the callback URL?
- What happens when a user completes Google OAuth but the backend API is temporarily unavailable?
- How does the system handle multiple simultaneous Google OAuth attempts (e.g., user clicks button multiple times)?
- What happens if Google changes their user profile data structure or required permissions?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The sign-in page MUST display a "Sign in with Google" button alongside existing email/password authentication options
- **FR-002**: The system MUST redirect users to Google's OAuth consent screen when they click the "Sign in with Google" button
- **FR-003**: The system MUST handle the OAuth callback from Google and extract authentication tokens from the response
- **FR-004**: The system MUST create a new user account automatically when a user signs in with Google for the first time, assigning them the CUSTOMER role
- **FR-005**: The system MUST store authentication tokens in the same Zustand auth store used by email/password authentication
- **FR-006**: Authenticated users via Google OAuth MUST have the same access to protected routes and API resources as email/password authenticated users
- **FR-007**: The system MUST preserve the user's intended navigation destination (redirectTo) when they authenticate after being redirected from a protected route
- **FR-008**: The callback page (`/auth/callback`) MUST be publicly accessible without authentication
- **FR-009**: The system MUST display appropriate error messages when OAuth authentication fails for any reason (user denial, network error, invalid tokens, etc.)
- **FR-010**: Error pages MUST provide a "Back to Sign In" option to allow users to retry authentication
- **FR-011**: The Google OAuth button MUST display the Google logo and text that uses the i18n translation system (no hardcoded English)
- **FR-012**: The system MUST support both light and dark mode for all OAuth-related UI components (button, callback page, error states)
- **FR-013**: The authentication flow MUST work identically in both Vietnamese (VI) and English (EN) locales
- **FR-014**: The system MUST delete the temporary authentication cookie after extracting tokens to prevent token leakage
- **FR-015**: The callback page MUST validate that required authentication data (accessToken, refreshToken, user) is present before completing sign-in

### Key Entities

- **OAuth Callback Page**: A new public route at `/auth/callback` that receives the OAuth redirect, extracts tokens from cookies, stores them in the auth store, and redirects the user to their intended destination
- **Google Sign-In Button**: A UI component integrated into the existing sign-in page that initiates the OAuth flow by redirecting to the backend's external-login endpoint
- **Authentication Token Cookie**: A temporary browser cookie named `AuthTokenHolder` containing the access token, refresh token, and user profile data, set by the backend after OAuth completion
- **External User Account**: A user account in the system created automatically from Google OAuth data, with CUSTOMER role assigned and identified by the Google account email

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully sign in using Google OAuth from initial button click to authenticated home page in under 15 seconds (including Google consent time)
- **SC-002**: The Google OAuth authentication success rate is at least 95% for users who complete the Google consent screen
- **SC-003**: Users who authenticate via Google OAuth can access all protected routes and perform all actions available to email/password authenticated users with zero permission differences
- **SC-004**: The protected route redirect flow works correctly for 100% of cases - users return to their intended destination after Google OAuth authentication
- **SC-005**: All OAuth error scenarios (user denial, network failure, invalid tokens, expired cookies) display appropriate error messages and recovery options with zero application crashes
- **SC-006**: The Google OAuth button and callback page render correctly in both light and dark modes on all supported browsers
- **SC-007**: All user-facing text in the OAuth flow displays correctly in both Vietnamese and English locales using the i18n system
- **SC-008**: The authentication state after Google OAuth is indistinguishable from email/password authentication when tested by accessing protected API endpoints

## Assumptions

- The backend API at `http://localhost:5100/api` (development) or `https://api.moriicoffee.com/api` (production) already implements the Google OAuth endpoints (`/v1/auth/external-login` and `/v1/auth/external-auth-callback`)
- The backend has been properly configured with Google OAuth credentials (Client ID and Client Secret) in Google Cloud Console
- The backend correctly sets the `AuthTokenHolder` cookie with appropriate properties (HttpOnly: false, SameSite: Strict, Secure: true in production)
- The existing Zustand auth store (`src/stores/auth-store.ts`) has the necessary methods (`setUser`, `setTokens`, `getAndClearRedirectTo`) that work identically for OAuth as they do for email/password authentication
- The existing authentication guard hooks (`useAuthGuard`, `useProtectedRoute`) work without modification for OAuth-authenticated users
- The project already has required UI components (`LoadingSpinner`, `ErrorMessage`, `Button`, `Card`) available for use in the callback page
- The existing constants file (`src/constants/routes.ts`) can be extended to include the `/auth/callback` route
- Users have modern web browsers with JavaScript enabled and third-party cookies allowed for OAuth to function
- The backend automatically creates user accounts on first Google sign-in without requiring additional registration steps
- The backend assigns the CUSTOMER role by default to all Google OAuth users
- HTTPS is required for production deployment but HTTP is acceptable for local development
- The OAuth flow must complete within 15 minutes or the state token expires (backend-enforced)
- Mobile responsive support uses the same components and patterns as email/password authentication (no special mobile OAuth handling needed)

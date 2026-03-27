# Feature Specification: Email Integration for Welcome and Password Reset

**Feature Branch**: `001-email-integration`
**Created**: 2026-03-27
**Status**: Draft
**Input**: User description: "refer @docs/features/email-service/email-integration-guide.md, please implement feature for send welcome email when login and send email forgot password"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Password Reset Flow (Priority: P1)

A user who has forgotten their password needs to reset it to regain access to their account. They navigate to the login page, click "Forgot Password", enter their email address, receive an email with a reset link, click the link, and successfully create a new password.

**Why this priority**: Password reset is critical for account recovery and reduces support burden. Users who cannot reset passwords cannot access the system, making this a blocker for account access.

**Independent Test**: Can be fully tested by submitting a valid email on the forgot password page, checking email delivery, clicking the reset link, and verifying successful password change. Delivers immediate value by enabling locked-out users to regain access without support intervention.

**Acceptance Scenarios**:

1. **Given** a user is on the forgot password page, **When** they enter a valid email address and submit, **Then** they see a success message indicating an email has been sent (regardless of whether the email exists in the system)
2. **Given** a user with a valid account requests password reset, **When** they check their email within 1 minute, **Then** they receive a password reset email with a clickable link containing encoded token and email parameters
3. **Given** a user clicks the password reset link, **When** the link loads in the browser, **Then** they are directed to the `/reset-password` page with token and email query parameters present
4. **Given** a user is on the reset password page with valid parameters, **When** they enter a new password meeting requirements and confirm it, **Then** the password is successfully updated and they are redirected to the login page
5. **Given** a user clicks an expired reset link, **When** the page loads, **Then** they see an error message indicating the link has expired with a link to request a new reset
6. **Given** a user clicks a reset link that was already used, **When** the page loads, **Then** they see an error message indicating the link has been used with a link to request a new reset

---

### User Story 2 - Welcome Email After Registration (Priority: P2)

A new user completes the registration process and receives a welcome email that confirms their account creation and provides a link to start using the application.

**Why this priority**: Welcome emails improve user onboarding and engagement by providing immediate confirmation and guidance. While not blocking core functionality, they enhance user experience and set expectations for communication.

**Independent Test**: Can be fully tested by completing the signup form, verifying the account is created successfully, and checking that a welcome email is received within 1 minute containing the correct username and a working "Start Shopping" link. Delivers value by improving new user confidence and engagement.

**Acceptance Scenarios**:

1. **Given** a user completes the signup form with valid information, **When** they submit the form, **Then** they see a success message indicating their account was created and suggesting they check their email
2. **Given** a user successfully creates an account, **When** they check their email within 1 minute, **Then** they receive a welcome email containing their username and a "Start Shopping" button
3. **Given** a user receives the welcome email, **When** they click the "Start Shopping" button, **Then** they are directed to the application homepage
4. **Given** the email service is temporarily unavailable, **When** a user completes signup, **Then** their account is still created successfully (email delivery is fire-and-forget)

---

### User Story 3 - Forgot Password Request Page (Priority: P1)

A user who needs to reset their password must have a clear, accessible way to request a password reset link.

**Why this priority**: The forgot password request page is the entry point for password recovery. Without this page, users cannot initiate the reset flow, making it equally critical as the reset functionality itself.

**Independent Test**: Can be fully tested by navigating to the `/forgot-password` page, verifying the form exists with appropriate fields and instructions, submitting a valid email, and seeing the appropriate success message. Delivers value as the starting point for account recovery.

**Acceptance Scenarios**:

1. **Given** a user cannot log in, **When** they navigate to the login page, **Then** they see a visible "Forgot Password?" link
2. **Given** a user is on the forgot password page, **When** the page loads, **Then** they see an email input field with clear instructions
3. **Given** a user submits the forgot password form with an invalid email format, **When** they submit, **Then** they see a validation error before the form is submitted
4. **Given** a user submits the forgot password form, **When** the request completes, **Then** they see a message stating "If an account with that email exists, we've sent a password reset link" (same message regardless of email existence)
5. **Given** a user sees the success message, **When** they read the page, **Then** they see helpful instructions about checking spam folders and waiting a few minutes

---

### Edge Cases

- What happens when the reset token URL parameters are missing or malformed?
  - The reset password page should detect missing or invalid parameters and display an error message with a link back to the forgot password page

- What happens when a user tries to use a reset link after 24 hours?
  - The backend token expires after 24 hours (backend default), so the reset password page should show an error indicating the link expired and provide a link to request a new one

- What happens when a user enters a non-existent email on the forgot password page?
  - The page shows the same success message as for existing emails to prevent email enumeration attacks

- What happens when email delivery fails but the user action succeeds?
  - The user action (signup or password reset request) completes successfully since email delivery is asynchronous and fire-and-forget

- What happens when a user enters mismatched passwords on the reset password form?
  - The form shows a client-side validation error before submitting to the backend

- What happens when a user tries to reset their password with a password that doesn't meet complexity requirements?
  - The backend returns a 400 error with a message indicating password requirements, which the frontend displays to the user

- What happens when network connectivity fails during password reset submission?
  - The frontend displays an appropriate error message and allows the user to retry

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a forgot password page at `/forgot-password` with an email input field
- **FR-002**: System MUST display the same success message on forgot password submission regardless of whether the email exists in the system (to prevent email enumeration)
- **FR-003**: System MUST provide a reset password page at `/reset-password` that accepts `token` and `email` query parameters
- **FR-004**: System MUST extract and validate the presence of both `token` and `email` query parameters on the reset password page
- **FR-005**: System MUST send encoded token and email values (Base64URL format) to the backend API without decoding them
- **FR-006**: System MUST optionally decode the email parameter for display purposes on the reset password page (to show "Resetting password for user@example.com")
- **FR-007**: System MUST provide a password reset form with fields for new password and confirm password
- **FR-008**: System MUST validate that new password and confirm password match before submission
- **FR-009**: System MUST submit password reset requests to `POST /api/v1/auth/reset-password` with email, token, and newPassword fields
- **FR-010**: System MUST redirect users to the login page with a success message after successful password reset
- **FR-011**: System MUST display appropriate error messages for expired, invalid, or already-used reset tokens
- **FR-012**: System MUST provide a link back to the forgot password page when reset token validation fails
- **FR-013**: System MUST display password complexity requirements on the reset password form
- **FR-014**: System MUST show a success message after signup suggesting users check their email for a welcome message
- **FR-015**: System MUST provide a visible "Forgot Password?" link on the login page
- **FR-016**: System MUST validate email format on the forgot password form before submission
- **FR-017**: System MUST display helpful instructions on the forgot password success page (check spam, wait a few minutes, etc.)
- **FR-018**: System MUST handle network errors gracefully on password reset submission

### Key Entities *(include if feature involves data)*

- **Password Reset Request**: Represents a user's request to reset their password, containing the user's email address
- **Password Reset Token**: A Base64URL-encoded token issued by the backend that authorizes a password reset, valid for a limited time (24 hours default) and single-use only
- **Reset URL Parameters**: The token and email values passed as query parameters to the reset password page, both encoded in Base64URL format
- **New Password Submission**: Contains the encoded email, encoded token, and the new password to be set

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the password reset flow from forgot password request to new password confirmation in under 3 minutes (excluding email delivery time)
- **SC-002**: 95% of users successfully reset their password on the first attempt when using a valid reset link
- **SC-003**: All password reset error scenarios (expired token, missing parameters, mismatched passwords) display clear, actionable error messages
- **SC-004**: Password reset form prevents submission of passwords that don't meet complexity requirements with real-time validation feedback
- **SC-005**: Users receive welcome emails within 1 minute of account creation in 99% of cases (measured client-side by delivery time)
- **SC-006**: The forgot password flow never reveals whether an email exists in the system (consistent messaging)
- **SC-007**: Reset password links work only once (attempting to reuse a link shows appropriate error)
- **SC-008**: Users can navigate from any error state back to the appropriate recovery page (forgot password page) without confusion

## Assumptions

- The backend API endpoints (`POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password`) are already implemented and functional
- Email delivery service (Brevo/Sendinblue) is configured and operational on the backend
- The backend configuration includes the correct frontend URLs for reset password links (`ResetPasswordBaseUrl: http://localhost:3000/reset-password` in development)
- Users have access to the email account they used for registration
- The backend handles token expiration (default 24 hours) and single-use enforcement
- The backend returns appropriate error messages for all failure scenarios (expired token, invalid token, password complexity failures)
- The Next.js application uses the App Router with the `useSearchParams` hook available for query parameter extraction
- Network connectivity is generally stable, but the frontend handles temporary network failures gracefully
- Password complexity requirements are enforced by the backend and communicated through API error responses
- The welcome email is sent automatically by the backend on successful signup without any frontend trigger required
- Email delivery is asynchronous and fire-and-forget (signup and forgot password operations succeed even if email fails)
- Base64URL encoding/decoding can be implemented using standard browser APIs (`atob`, string replacement)
- The application base URL is `http://localhost:3000` in development and will be configured for production environments

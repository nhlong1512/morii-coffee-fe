/**
 * OAuth utility functions for external authentication providers
 */

/**
 * Initiates Google OAuth flow by submitting a POST form to the backend.
 * This triggers a full page redirect to Google's OAuth consent screen.
 *
 * @param provider - OAuth provider name (default: "Google")
 * @param returnUrl - URL to return to after authentication (default: "/")
 */
export function initiateOAuthFlow(
  provider: string = "Google",
  returnUrl: string = "/"
): void {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api";
  const oauthUrl = `${apiBaseUrl}/v1/auth/external-login?provider=${provider}&returnUrl=${encodeURIComponent(returnUrl)}`;

  // Create and submit form to make POST request
  // (window.location.href would use GET, but backend expects POST)
  const form = document.createElement("form");
  form.method = "POST";
  form.action = oauthUrl;
  document.body.appendChild(form);
  form.submit();
}

/**
 * Initiates Google OAuth flow specifically.
 * Convenience wrapper for initiateOAuthFlow with Google provider.
 */
export function initiateGoogleSignIn(): void {
  initiateOAuthFlow("Google", "/");
}

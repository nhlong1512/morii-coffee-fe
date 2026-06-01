"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { selectHasValidSession, useAuthStore } from "@/stores/auth-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

/**
 * OAuth callback page for Google authentication
 *
 * The backend redirects here with tokens in query params:
 *   /auth/callback?accessToken=...&refreshToken=...
 *
 * Flow:
 * 1. Read accessToken + refreshToken from URL query params
 * 2. Store tokens in Zustand and fetch user profile
 * 3. Clean query params from URL
 * 4. Redirect to intended destination or home
 */

const ERROR_MESSAGES = {
  USER_DENIED: "Authentication cancelled",
  MISSING_TOKENS: "No authentication token received. Please try again.",
  PROCESSING_ERROR: "Failed to process authentication. Please try again.",
} as const;

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const setTokens = useAuthStore((s) => s.setTokens);
  const syncProfile = useAuthStore((s) => s.syncProfile);
  const getAndClearRedirectTo = useAuthStore((s) => s.getAndClearRedirectTo);

  useEffect(() => {
    async function processOAuthCallback() {
      try {
        // Check for error parameters in URL first
        const errorParam = searchParams.get("error");
        if (errorParam) {
          setError(searchParams.get("message") || ERROR_MESSAGES.USER_DENIED);
          return;
        }

        // Read tokens from query params (backend redirect format)
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");

        if (!accessToken || !refreshToken) {
          setError(ERROR_MESSAGES.MISSING_TOKENS);
          return;
        }

        // Store tokens so API client can use them immediately
        setTokens(accessToken, refreshToken);

        // Fetch user profile using the new tokens
        await syncProfile();
        if (!selectHasValidSession(useAuthStore.getState())) {
          throw new Error(ERROR_MESSAGES.PROCESSING_ERROR);
        }

        // Clean tokens from URL to avoid bookmarking/sharing sensitive data
        window.history.replaceState({}, "", "/auth/callback");

        // Redirect to intended destination or home
        const redirectPath = getAndClearRedirectTo();
        router.push(redirectPath || ROUTES.HOME);
      } catch (err) {
        const message = err instanceof Error ? err.message : ERROR_MESSAGES.PROCESSING_ERROR;
        setError(message);
      }
    }

    processOAuthCallback();
  }, [router, searchParams, setTokens, syncProfile, getAndClearRedirectTo]);

  // Error state
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
            <ErrorMessage message={error} inline={false} />
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

  // Processing state (default)
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <LoadingSpinner variant="logo" size="md" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

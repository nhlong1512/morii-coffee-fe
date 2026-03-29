"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import type { ApiUserProfile } from "@/types/api";

/**
 * OAuth callback page for Google authentication
 *
 * Flow:
 * 1. Extract AuthTokenHolder cookie set by backend
 * 2. Validate and parse authentication data
 * 3. Store tokens and user profile in Zustand
 * 4. Delete cookie immediately
 * 5. Redirect to intended destination or home
 */

interface AuthTokenHolderCookie {
  accessToken: string;
  refreshToken: string;
  user: ApiUserProfile;
}

const ERROR_MESSAGES = {
  USER_DENIED: "Authentication cancelled",
  MISSING_COOKIE: "No authentication token received. Please try again.",
  INVALID_COOKIE: "Invalid authentication data received.",
  PROCESSING_ERROR: "Failed to process authentication. Please try again.",
} as const;

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const getAndClearRedirectTo = useAuthStore((s) => s.getAndClearRedirectTo);

  useEffect(() => {
    async function processOAuthCallback() {
      try {
        // Check for error parameters in URL first
        const errorParam = searchParams.get("error");
        if (errorParam) {
          const errorMessage = searchParams.get("message") || ERROR_MESSAGES.USER_DENIED;
          setError(errorMessage);
          return;
        }

        // Extract AuthTokenHolder cookie
        const cookies = document.cookie.split("; ");
        const authCookie = cookies.find((cookie) =>
          cookie.startsWith("AuthTokenHolder=")
        );

        if (!authCookie) {
          setError(ERROR_MESSAGES.MISSING_COOKIE);
          return;
        }

        // Parse cookie value
        let authData: AuthTokenHolderCookie;
        try {
          const cookieValue = authCookie.split("=")[1];
          const decodedValue = decodeURIComponent(cookieValue);
          authData = JSON.parse(decodedValue);
        } catch {
          setError(ERROR_MESSAGES.INVALID_COOKIE);
          return;
        }

        // Validate required fields
        if (!authData.accessToken || !authData.refreshToken || !authData.user) {
          setError(ERROR_MESSAGES.INVALID_COOKIE);
          return;
        }

        // Validate user profile structure
        if (!authData.user.id || !authData.user.email || !authData.user.userName) {
          setError(ERROR_MESSAGES.INVALID_COOKIE);
          return;
        }

        // Store authentication data in Zustand
        setUser(authData.user);
        setTokens(authData.accessToken, authData.refreshToken);

        // Delete cookie immediately after extraction
        document.cookie = "AuthTokenHolder=; Max-Age=0; path=/;";

        // Retrieve redirect destination
        const redirectPath = getAndClearRedirectTo();

        // Redirect to intended destination or home
        router.push(redirectPath || ROUTES.HOME);
      } catch (err) {
        const message = err instanceof Error ? err.message : ERROR_MESSAGES.PROCESSING_ERROR;
        setError(message);
      }
    }

    processOAuthCallback();
  }, [router, searchParams, setUser, setTokens, getAndClearRedirectTo]);

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

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { resetPassword } from "@/services/auth-service";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Base64URL decode utility function
function base64UrlDecode(str: string): string {
  // Convert Base64URL to standard Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  // Decode using browser API
  return atob(base64);
}

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: isRedirecting } = useAuthGuard();

  const encodedToken = searchParams.get("token");
  const encodedEmail = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Decode both token and email for backend API
  const token = encodedToken ? (() => {
    try {
      return base64UrlDecode(encodedToken);
    } catch {
      return null;
    }
  })() : null;

  const email = encodedEmail ? (() => {
    try {
      return base64UrlDecode(encodedEmail);
    } catch {
      return null;
    }
  })() : null;

  // Auto-redirect after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  // Show loading state while checking auth or redirecting
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  // Validate parameters exist
  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/images/logo.png" alt="Morii Coffee" width={120} height={40} className="h-10 w-auto" />
            </div>
            <CardTitle className="text-destructive">{t("invalidResetLink")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{t("requestNewReset")}</span>
            </div>
            <Link href="/forgot-password">
              <Button className="w-full">{t("forgotPasswordTitle")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError(t("passwordsMustMatch"));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ email, token, newPassword });
      setIsSuccess(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to reset password";

      // Handle different error types with appropriate messages
      if (errorMsg.includes("expired") || errorMsg.includes("invalid") || errorMsg.includes("already used")) {
        setError(t("expiredResetLink"));
      } else if (errorMsg.includes("email") || errorMsg.includes("Email")) {
        // Backend email validation errors - the link is invalid
        setError(t("expiredResetLink"));
      } else if (errorMsg.includes("password") || errorMsg.includes("Password")) {
        // Password complexity errors from backend
        setError(errorMsg);
      } else {
        // Generic error - likely an invalid or expired link
        setError(t("expiredResetLink"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image src="/images/logo.png" alt="Morii Coffee" width={120} height={40} className="h-10 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl">{t("resetPasswordTitle")}</CardTitle>
            {email && (
              <CardDescription className="mt-1">
                {t("resetPasswordFor")} <strong>{email}</strong>
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="rounded-lg bg-green-100 p-4 text-green-800">
                <p className="font-medium">{t("resetSuccess")}</p>
                <p className="text-sm mt-2">{t("resetSuccessMessage")}</p>
              </div>
              <p className="text-sm text-muted-foreground">{t("redirectingToSignIn")}</p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  {t("backToSignIn")}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label={t("newPassword")}
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="********"
                required
                disabled={isLoading}
              />

              <FormField
                label={t("confirmNewPassword")}
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="********"
                required
                disabled={isLoading}
              />

              {/* Password requirements */}
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-2">{t("passwordRequirements")}</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t("passwordReqLength")}</li>
                  <li>• {t("passwordReqUpperLower")}</li>
                  <li>• {t("passwordReqNumbers")}</li>
                  <li>• {t("passwordReqSpecial")}</li>
                </ul>
              </div>

              {error && (
                <div className="space-y-2">
                  <ErrorMessage message={error} inline={false} />
                  {error.includes(t("expiredResetLink")) && (
                    <div className="text-sm">
                      <Link href="/forgot-password" className="text-primary underline hover:no-underline">
                        {t("requestNewReset")}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner variant="spinner" size="sm" />
                    <span className="ml-2">Resetting...</span>
                  </>
                ) : (
                  t("resetPasswordButton")
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  {t("backToSignIn")}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

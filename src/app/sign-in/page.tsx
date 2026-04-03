"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
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
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";

export default function SignInPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const getAndClearRedirectTo = useAuthStore((s) => s.getAndClearRedirectTo);
  const { isLoading: isRedirecting } = useAuthGuard();

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signIn(identity, password);
      // Check for stored redirect intent
      const redirectPath = getAndClearRedirectTo();
      router.push(redirectPath || ROUTES.HOME);
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const oauthUrl = `${apiBaseUrl}/v1/auth/external-login?provider=Google&returnUrl=${encodeURIComponent(`${appUrl}/auth/callback`)}`;

    // Create a form and submit it programmatically to make a POST request
    const form = document.createElement("form");
    form.method = "POST";
    form.action = oauthUrl;
    document.body.appendChild(form);
    form.submit();
  };

  // Show loading state while checking auth or redirecting
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image src="/images/logo.png" alt="Morii Coffee" width={120} height={40} className="h-10 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl">{t("signIn")}</CardTitle>
            <CardDescription className="mt-1">
              {t("dontHaveAccount")}{" "}
              <Link
                href={ROUTES.SIGN_UP}
                className="font-medium text-primary hover:underline"
              >
                {t("signUp")}
              </Link>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label={t("email")}
              name="identity"
              type="text"
              value={identity}
              onChange={setIdentity}
              placeholder="Email or phone number"
              required
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t("password")}
                </span>
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-sm text-primary hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <FormField
                label=""
                name="password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="********"
                required
                className="mt-0"
              />
            </div>

            {error && <ErrorMessage message={error} />}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner variant="spinner" size="sm" />
                  <span className="ml-2">Signing in...</span>
                </>
              ) : (
                t("signIn")
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              {t("orContinueWith")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("google")}
            </Button>
            <Button variant="outline" type="button" className="w-full" disabled>
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="#1877F2"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {t("facebook")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

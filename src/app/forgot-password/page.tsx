"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { forgotPassword } from "@/services/auth-service";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const { isLoading: isRedirecting } = useAuthGuard();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side email validation
    if (!validateEmail(email)) {
      setError(t("invalidEmail"));
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword({ email });
    } catch {
      // Always show success — never reveal whether email exists
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
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
            <CardTitle className="text-2xl">{t("forgotPasswordTitle")}</CardTitle>
            <CardDescription className="mt-1">
              {t("forgotPasswordDescription")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="rounded-lg bg-green-100 p-4 text-green-800">
                <p className="font-medium">{t("resetLinkSent")}</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>{t("checkSpam")}</p>
              </div>
              <Link href="/sign-in">
                <Button variant="outline" className="mt-4 w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("backToSignIn")}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label={t("email")}
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                error={error}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner variant="spinner" size="sm" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  t("sendResetLink")
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

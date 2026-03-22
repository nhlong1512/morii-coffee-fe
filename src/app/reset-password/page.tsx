"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { resetPassword } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenFromUrl = searchParams.get("token") ?? "";
  const emailFromUrl = searchParams.get("email") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!tokenFromUrl || !emailFromUrl) {
      setError("Reset link is invalid or has expired. Please request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        email: emailFromUrl,
        token: tokenFromUrl,
        newPassword,
      });
      setIsSuccess(true);
      setTimeout(() => router.push("/sign-in"), 2000);
    } catch {
      setError(
        "Reset link is invalid or has expired. Please request a new one."
      );
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
            <CardTitle className="text-2xl">{t("resetPassword")}</CardTitle>
            <CardDescription className="mt-1">
              Enter your new password below.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Password reset successfully. Redirecting to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                  {error.includes("request a new one") && (
                    <Link
                      href="/forgot-password"
                      className="ml-1 font-medium underline"
                    >
                      Request new link
                    </Link>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "..." : t("resetPassword")}
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
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { changePassword } from "@/services/user-service";
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

export default function ChangePasswordPage() {
  const t = useTranslations("auth");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setIsSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to change password.";
      if (message.includes("400")) {
        setError("Current password is incorrect.");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-background px-4 py-6 sm:py-8 md:min-h-screen md:items-center md:py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 px-5 pt-5 text-center sm:space-y-4 sm:px-6 sm:pt-6">
          <div className="flex justify-center">
            <Image src="/images/logo.png" alt="Morii Coffee" width={120} height={40} className="h-10 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl">{t("changePassword")}</CardTitle>
            <CardDescription className="mt-1">
              Update your password to keep your account secure.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          {isSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Your password has been changed successfully.
            </div>
          )}

          {error && <ErrorMessage message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label={t("password")}
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Current password"
              required
            />

            <FormField
              label="New Password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="New password"
              required
            />

            <FormField
              label={t("confirmPassword")}
              name="confirmNewPassword"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm new password"
              required
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner variant="spinner" size="sm" />
                  <span className="ml-2">Changing...</span>
                </>
              ) : (
                t("changePassword")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

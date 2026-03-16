"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Coffee, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Coffee className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              Morii Coffee
            </span>
          </div>
          <div>
            <CardTitle className="text-2xl">{t("resetPassword")}</CardTitle>
            <CardDescription className="mt-1">
              Enter your email address and we will send you a link to reset your
              password.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                If an account exists for <strong>{email}</strong>, you will
                receive a password reset link shortly.
              </p>
              <Link href="/sign-in">
                <Button variant="outline" className="mt-4 w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("backToSignIn")}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
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

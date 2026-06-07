"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

const subjectOptions = ["general", "bugReport", "suggestion", "complaint"] as const;

export default function FeedbackPage() {
  const t = useTranslations("feedback");

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "" as string,
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const maxChars = 1000;

  const subjectLabels: Record<string, string> = {
    general: t("general"),
    bugReport: t("bugReport"),
    suggestion: t("suggestion"),
    complaint: t("complaint"),
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = t("required");
    if (!form.email.trim()) newErrors.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = t("invalidEmail");
    if (!form.subject) newErrors.subject = t("required");
    if (!form.message.trim()) newErrors.message = t("required");
    else if (form.message.trim().length < 10) newErrors.message = t("tooShort");
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
          <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
            {t("thankYou")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("feedbackReceived")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("contactUs")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("feedbackReceived")}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-xl border border-border bg-card p-6"
            >
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  {t("name")}
                </label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder={t("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  {t("email")}
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder={t("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  {t("subject")}
                </label>
                <select
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">{t("subject")}...</option>
                  {subjectOptions.map((key) => (
                    <option key={key} value={key}>
                      {subjectLabels[key]}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  {t("message")}
                </label>
                <Textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      message: e.target.value.slice(0, maxChars),
                    }))
                  }
                  placeholder={t("message") + "..."}
                  rows={6}
                  className="resize-none"
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.message ? (
                    <p className="text-xs text-destructive">{errors.message}</p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={cn(
                      "text-xs",
                      form.message.length >= maxChars
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {form.message.length}/{maxChars}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                {t("submit")}
              </button>
            </form>
          </div>

          {/* Contact info sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-card-foreground">
                {t("contactUs")}
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {t("email")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      hello@moriicoffee.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {t("phone")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +84 28 1234 5678
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {t("address")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("addressLine1")}
                      <br />
                      {t("addressLine2")}
                      <br />
                      {t("addressLine3")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

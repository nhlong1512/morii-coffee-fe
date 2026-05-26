"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/admin/image-upload";
import { ArrowLeft, Check } from "lucide-react";
import { getBannerById, updateBanner } from "@/services/banners-service";
import type { ApiBanner } from "@/types/api";

/** Convert ISO 8601 string to datetime-local input value (YYYY-MM-DDTHH:mm). */
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default function EditBannerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("adminBanners");

  const [banner, setBanner] = React.useState<ApiBanner | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Form fields
  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [cta, setCta] = React.useState("");
  const [ctaLink, setCtaLink] = React.useState("");
  const [displayOrder, setDisplayOrder] = React.useState("0");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    getBannerById(id)
      .then((data) => {
        setBanner(data);
        setTitle(data.title);
        setSubtitle(data.subtitle ?? "");
        setCta(data.cta ?? "");
        setCtaLink(data.ctaLink ?? "");
        setDisplayOrder(String(data.displayOrder));
        setStartDate(toDatetimeLocal(data.startDate));
        setEndDate(toDatetimeLocal(data.endDate));
        setIsActive(data.isActive);
        setImagePreview(data.imageUrl);
      })
      .catch(() => setLoadError(t("loadFailed")));
  }, [id]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await updateBanner(id, {
        title,
        subtitle: subtitle || undefined,
        cta: cta || undefined,
        ctaLink: ctaLink || undefined,
        displayOrder: displayOrder === "" ? undefined : Number.parseInt(displayOrder, 10),
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        isActive,
        // Only include image if a new file was selected; omitting preserves the existing imageUrl
        image: imageFile ?? undefined,
      });
      setSubmitted(true);
      setTimeout(() => router.push("/admin/banners"), 1200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">{t("editSuccess")}</h2>
        <p className="text-sm text-muted-foreground">{t("redirecting")}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button variant="outline" onClick={() => router.push("/admin/banners")}>
          {t("backToBanners")}
        </Button>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/banners">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("editTitle")}</h1>
          <p className="text-muted-foreground truncate max-w-sm">{banner.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("sectionContent")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("fieldTitle")}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">{t("fieldSubtitle")}</Label>
                <Textarea
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cta">{t("fieldCtaLabel")}</Label>
                  <Input
                    id="cta"
                    placeholder={t("placeholderCtaLabel")}
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">{t("fieldCtaLink")}</Label>
                  <Input
                    id="ctaLink"
                    placeholder={t("placeholderCtaLink")}
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("sectionSchedule")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">{t("fieldDisplayOrder")}</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min="0"
                    step="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">{t("fieldStartDate")}</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("fieldEndDate")}</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                  <div>
                    <Label htmlFor="isActive">{t("fieldActive")}</Label>
                    <p className="text-xs text-muted-foreground">{t("activeHint")}</p>
                  </div>
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("sectionImage")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={imagePreview}
                  onChange={(url) => setImagePreview(url)}
                  onFileSelect={(file) => setImageFile(file)}
                  alt="Banner image"
                  previewClassName="w-full aspect-[5/2]"
                  recommendedSize="1500 × 600px (landscape) · JPG, PNG, WebP · max 5MB"
                />
                <p className="text-xs text-muted-foreground">
                  {t("imageHintEdit")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {saveError && (
          <p className="text-right text-sm text-destructive">{saveError}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/banners">{t("cancel")}</Link>
          </Button>
          <Button type="submit" disabled={saving || !title.trim()}>
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}

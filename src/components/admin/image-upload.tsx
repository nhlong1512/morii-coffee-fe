"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { uploadImageAsset, type ApiFileBlob } from "@/services/file-service";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  /** When provided, skips pre-upload and exposes the raw File instead. */
  onFileSelect?: (file: File | null) => void;
  category?: string;
  alt?: string;
  /** Override the preview container size. Defaults to "h-40 w-40" (square). */
  previewClassName?: string;
  /** When provided, renders a recommended dimensions hint below the drop zone. */
  recommendedSize?: string;
  /** Upload target bucket name when pre-upload is enabled. Defaults to "products". */
  bucketName?: string;
  /** Callback fired with uploaded file metadata after successful pre-upload. */
  onUploaded?: (blob: ApiFileBlob) => void;
}

export function ImageUpload({
  value,
  onChange,
  onFileSelect,
  category,
  alt = "Product image",
  previewClassName,
  recommendedSize,
  bucketName = "products",
  onUploaded,
}: ImageUploadProps) {
  const t = useTranslations("adminCommon");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const localPreviewUrlRef = React.useRef<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const releaseLocalPreview = React.useCallback(() => {
    if (!localPreviewUrlRef.current) return;

    URL.revokeObjectURL(localPreviewUrlRef.current);
    localPreviewUrlRef.current = null;
  }, []);

  React.useEffect(() => releaseLocalPreview, [releaseLocalPreview]);

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t("fileTypeError"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t("fileSizeError"));
      return;
    }

    setError(null);

    if (onFileSelect) {
      // Skip pre-upload — expose the raw File and a local preview URL to the parent.
      releaseLocalPreview();
      const previewUrl = URL.createObjectURL(file);
      localPreviewUrlRef.current = previewUrl;
      onChange(previewUrl);
      onFileSelect(file);
      return;
    }

    setUploading(true);
    try {
      const blob = await uploadImageAsset(file, bucketName);
      onChange(blob.uri);
      onUploaded?.(blob);
    } catch {
      setError(t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleRemove = () => {
    releaseLocalPreview();
    onChange(null);
    onFileSelect?.(null);
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className={cn("relative overflow-hidden rounded-md border border-border", previewClassName ?? "h-40 w-40")}>
          {value.startsWith("blob:") ? (
            <Image
              src={value}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              className="object-cover"
            />
          ) : (
            <ProductImage src={value} alt={alt} category={category} />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50"
        )}
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-muted-foreground mb-3 animate-spin" />
            <p className="text-sm font-medium">{t("uploading")}</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">
              {value ? t("replaceImage") : t("clickOrDragToUpload")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("uploadHint")}
            </p>
          </>
        )}
      </div>

      {recommendedSize && (
        <p className="text-xs text-muted-foreground">{t("recommended", { size: recommendedSize })}</p>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

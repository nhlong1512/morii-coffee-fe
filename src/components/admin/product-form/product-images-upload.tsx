"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PRODUCT_IMAGE_MAX_FILE_SIZE,
  PRODUCT_IMAGE_MAX_COUNT,
  PRODUCT_IMAGE_ACCEPTED_TYPES,
} from "@/lib/constants";
import type { ApiProductImage } from "@/types/api";

interface StagedImage {
  file: File;
  previewUrl: string;
}

interface ProductImagesUploadProps {
  /** Called whenever the pending file list changes — use to collect files for upload on save. */
  onFilesStaged?: (files: File[]) => void;
  /** Pre-existing images to display (edit mode). */
  initialImages?: ApiProductImage[];
  /**
   * Called whenever the existing images list changes (e.g. an image is removed from UI).
   * Use this in edit mode to diff against the original server state and determine deletes on save.
   */
  onExistingImagesChange?: (images: ApiProductImage[]) => void;
}

export function ProductImagesUpload({
  onFilesStaged,
  initialImages = [],
  onExistingImagesChange,
}: Readonly<ProductImagesUploadProps>) {
  const t = useTranslations("adminProducts");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [existingImages, setExistingImages] = React.useState<ApiProductImage[]>(initialImages);
  const [staged, setStaged] = React.useState<StagedImage[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  // Notify parent of staged files so it can upload on save.
  const onFilesStagedRef = React.useRef(onFilesStaged);
  React.useLayoutEffect(() => { onFilesStagedRef.current = onFilesStaged; });
  React.useEffect(() => {
    onFilesStagedRef.current?.(staged.map((s) => s.file));
  }, [staged]);

  // Notify parent of existing images changes (for diff-based delete on save).
  const onExistingImagesChangeRef = React.useRef(onExistingImagesChange);
  React.useLayoutEffect(() => { onExistingImagesChangeRef.current = onExistingImagesChange; });
  React.useEffect(() => {
    onExistingImagesChangeRef.current?.(existingImages);
  }, [existingImages]);

  const totalCount = existingImages.length + staged.length;

  const validateFiles = (files: File[]): { valid: File[]; error: string | null } => {
    const valid: File[] = [];
    for (const file of files) {
      if (totalCount + valid.length >= PRODUCT_IMAGE_MAX_COUNT) {
        return { valid, error: t("maxImagesError", { N: PRODUCT_IMAGE_MAX_COUNT }) };
      }
      if (!(PRODUCT_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
        return { valid, error: t("fileTypeImageError") };
      }
      if (file.size > PRODUCT_IMAGE_MAX_FILE_SIZE) {
        return { valid, error: t("fileSizeImageError") };
      }
      valid.push(file);
    }
    return { valid, error: null };
  };

  const handleFiles = (files: File[]) => {
    setGlobalError(null);
    const { valid, error } = validateFiles(files);
    if (error) { setGlobalError(error); }
    if (valid.length === 0) return;

    setStaged((prev) => [
      ...prev,
      ...valid.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) handleFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFiles(files);
  };

  const removeStaged = (index: number) => {
    setStaged((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const removeExisting = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  return (
    <div className="space-y-4">
      {(existingImages.length > 0 || staged.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="relative h-24 w-24 overflow-hidden rounded-md border border-border"
            >
              <Image src={img.url} alt="" fill sizes="96px" unoptimized className="object-cover" />
              {img.isThumbnail && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white text-center py-0.5">
                  {t("imageThumbnailBadge")}
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-5 w-5 cursor-pointer"
                onClick={() => removeExisting(img.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {staged.map((s, i) => (
            <div
              key={s.previewUrl}
              className="relative h-24 w-24 overflow-hidden rounded-md border border-dashed border-muted-foreground/50"
            >
              <Image src={s.previewUrl} alt="" fill sizes="96px" unoptimized className="object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-5 w-5 cursor-pointer"
                onClick={() => removeStaged(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {totalCount < PRODUCT_IMAGE_MAX_COUNT ? (
        <button
          type="button"
          className={cn(
            "w-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
          )}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">{t("imagesSection")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("imagesHint", { N: PRODUCT_IMAGE_MAX_COUNT })}
          </p>
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">{t("maxImagesReached", { N: PRODUCT_IMAGE_MAX_COUNT })}</p>
      )}

      {globalError && <p className="text-xs text-destructive">{globalError}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={PRODUCT_IMAGE_ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

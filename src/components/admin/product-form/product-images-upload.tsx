"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProductImages } from "@/services/products-service";
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
  uploading?: boolean;
  error?: string;
}

interface ProductImagesUploadProps {
  /**
   * Edit mode: productId is known — files are uploaded immediately on drop/select.
   * New mode: omit productId and provide onFilesStaged to collect files before creation.
   */
  productId?: string;
  /** Called (new mode only) whenever the pending file list changes. */
  onFilesStaged?: (files: File[]) => void;
  /** Pre-existing images to display (edit mode). */
  initialImages?: ApiProductImage[];
}

export function ProductImagesUpload({
  productId,
  onFilesStaged,
  initialImages = [],
}: Readonly<ProductImagesUploadProps>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [existingImages, setExistingImages] = React.useState<ApiProductImage[]>(initialImages);
  const [staged, setStaged] = React.useState<StagedImage[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  // Notify parent of staged files (new-product mode).
  const onFilesStagedRef = React.useRef(onFilesStaged);
  React.useLayoutEffect(() => { onFilesStagedRef.current = onFilesStaged; });
  React.useEffect(() => {
    onFilesStagedRef.current?.(staged.map((s) => s.file));
  }, [staged]);

  const totalCount = existingImages.length + staged.length;

  const validateFiles = (files: File[]): { valid: File[]; error: string | null } => {
    const valid: File[] = [];
    for (const file of files) {
      if (totalCount + valid.length >= PRODUCT_IMAGE_MAX_COUNT) {
        return { valid, error: `Maximum ${PRODUCT_IMAGE_MAX_COUNT} images per product.` };
      }
      if (!(PRODUCT_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
        return { valid, error: "Only PNG, JPG, or WEBP files are allowed." };
      }
      if (file.size > PRODUCT_IMAGE_MAX_FILE_SIZE) {
        return { valid, error: "Each file must be smaller than 5 MB." };
      }
      valid.push(file);
    }
    return { valid, error: null };
  };

  const handleFiles = async (files: File[]) => {
    setGlobalError(null);
    const { valid, error } = validateFiles(files);
    if (error) { setGlobalError(error); }
    if (valid.length === 0) return;

    if (productId) {
      // Edit mode: upload immediately.
      const newStaged: StagedImage[] = valid.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        uploading: true,
      }));
      setStaged((prev) => [...prev, ...newStaged]);
      try {
        const uploaded = await uploadProductImages(productId, valid);
        setStaged((prev) => prev.filter((s) => !newStaged.includes(s)));
        setExistingImages((prev) => [
          ...prev,
          ...uploaded.map((img) => ({ ...img, isThumbnail: false as const })),
        ]);
      } catch {
        setStaged((prev) =>
          prev.map((s) =>
            newStaged.includes(s) ? { ...s, uploading: false, error: "Upload failed." } : s
          )
        );
      }
    } else {
      // New-product mode: stage for upload after creation.
      setStaged((prev) => [
        ...prev,
        ...valid.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
      ]);
    }
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

  const isAnyUploading = staged.some((s) => s.uploading);

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
                  Thumbnail
                </span>
              )}
            </div>
          ))}

          {staged.map((s, i) => (
            <div
              key={s.previewUrl}
              className="relative h-24 w-24 overflow-hidden rounded-md border border-border"
            >
              <Image src={s.previewUrl} alt="" fill sizes="96px" unoptimized className="object-cover" />
              {s.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}
              {s.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 p-1">
                  <span className="text-[10px] text-destructive font-medium text-center leading-tight">
                    {s.error}
                  </span>
                </div>
              )}
              {!s.uploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-5 w-5"
                  onClick={() => removeStaged(i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {totalCount < PRODUCT_IMAGE_MAX_COUNT ? (
        <button
          type="button"
          disabled={isAnyUploading}
          className={cn(
            "w-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-60",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
          )}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
        >
          {isAnyUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
              <p className="text-sm font-medium">Uploading…</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click or drag to add images</p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG or WEBP · up to 5 MB each · max {PRODUCT_IMAGE_MAX_COUNT} images
              </p>
            </>
          )}
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">Maximum {PRODUCT_IMAGE_MAX_COUNT} images reached.</p>
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

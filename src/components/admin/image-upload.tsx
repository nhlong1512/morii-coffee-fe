"use client";

import * as React from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { uploadProductImage } from "@/services/file-service";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  category?: string;
  alt?: string;
}

export function ImageUpload({
  value,
  onChange,
  category,
  alt = "Product image",
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PNG, JPG, or WEBP files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be smaller than 5 MB.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      onChange(url);
    } catch {
      setError("Upload failed. Please try again.");
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

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative h-40 w-40 overflow-hidden rounded-md border border-border">
          <ProductImage src={value} alt={alt} category={category} />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6"
            onClick={() => onChange(null)}
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
            <p className="text-sm font-medium">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">
              {value ? "Replace image" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG or WEBP up to 5 MB
            </p>
          </>
        )}
      </div>

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

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/admin/image-upload";
import { CategorySelector } from "@/components/admin/product-form/category-selector";
import { SizePriceSelector } from "@/components/admin/product-form/size-price-selector";
import { ProductFormSuccess } from "@/components/admin/product-form/product-form-success";
import { ProductImagesUpload } from "@/components/admin/product-form/product-images-upload";
import { ArrowLeft } from "lucide-react";
import { getProductDetail, getCategories, updateProduct, deleteProductImage, uploadProductImages } from "@/services/products-service";
import { generateSlug, toggleArrayItem, toggleSetItem } from "@/lib/product-utils";
import type { ApiProductDetail, ApiCategory, ApiProductImage } from "@/types/api";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = React.useState<ApiProductDetail | null>(null);
  const [categoryList, setCategoryList] = React.useState<ApiCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [price, setPrice] = React.useState("");
  const [selectedSizes, setSelectedSizes] = React.useState<Set<string>>(new Set());
  const [sizeModifiers, setSizeModifiers] = React.useState<Record<string, string>>({});
  const [active, setActive] = React.useState(true);
  const [featured, setFeatured] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [currentImages, setCurrentImages] = React.useState<ApiProductImage[]>([]);
  const [stagedImages, setStagedImages] = React.useState<File[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dto, cats] = await Promise.all([getProductDetail(id), getCategories()]);
        setDetail(dto);
        setCategoryList(cats);

        setName(dto.name);
        setSlug(dto.slug);
        setDescription(dto.description ?? "");
        setCategoryIds(dto.categories.map((c) => c.id));
        setPrice(dto.basePrice.toString());
        setActive(dto.status === "Active");
        setFeatured(dto.isFeatured);
        setImageUrl(dto.thumbnailUrl ?? null);
        setCurrentImages(dto.images);

        const sizes = new Set<string>();
        const modifiers: Record<string, string> = {};
        for (const variant of dto.variants) {
          sizes.add(variant.size);
          if (variant.additionalPrice > 0) modifiers[variant.size] = variant.additionalPrice.toString();
        }
        setSelectedSizes(sizes);
        setSizeModifiers(modifiers);
      } catch {
        setError("Failed to load product. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!detail || categoryIds.length === 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      // Diff server images vs current UI state to find deleted ones.
      const currentImageIds = new Set(currentImages.map((img) => img.id));
      const deletedImageIds = detail.images
        .filter((img) => !currentImageIds.has(img.id))
        .map((img) => img.id);

      // Run deletes in parallel with the product update.
      const [, ...deleteResults] = await Promise.allSettled([
        updateProduct(id, {
          name,
          slug,
          description,
          basePrice: Number.parseFloat(price),
          categoryIds,
          thumbnail: thumbnailFile ?? undefined,
          status: active ? "Active" : "Inactive",
          isFeatured: featured,
        }),
        ...deletedImageIds.map((imageId) => deleteProductImage(id, imageId)),
      ]);

      // Surface any image delete failures without blocking navigation.
      const failedDeletes = deleteResults.filter((r) => r.status === "rejected");
      if (failedDeletes.length > 0) {
        setSaveError(
          `Product saved, but ${failedDeletes.length} image(s) could not be deleted. Please try removing them again.`
        );
        setSaving(false);
        return;
      }

      // Upload any newly staged images.
      if (stagedImages.length > 0) {
        try {
          await uploadProductImages(id, stagedImages);
        } catch {
          setSaveError("Product saved, but some images could not be uploaded. Please try again.");
          setSaving(false);
          return;
        }
      }

      setSubmitted(true);
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <p className="text-muted-foreground mt-1">
          {error ?? "The product you're looking for doesn't exist."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <ProductFormSuccess
        title="Product Updated Successfully"
        message="Redirecting to product list..."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Update {detail.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Product name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="product-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <CategorySelector
                categoryList={categoryList}
                selectedIds={categoryIds}
                onToggle={(id) => setCategoryIds((prev) => toggleArrayItem(prev, id))}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing &amp; Sizes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price (₫)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <Separator />

                <SizePriceSelector
                  selectedSizes={selectedSizes}
                  sizeModifiers={sizeModifiers}
                  onToggle={(size) => setSelectedSizes((prev) => toggleSetItem(prev, size))}
                  onModifierChange={(size, value) =>
                    setSizeModifiers((prev) => ({ ...prev, [size]: value }))
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thumbnail Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  onFileSelect={setThumbnailFile}
                  category={detail.categories[0]?.name.toLowerCase()}
                  alt={detail.name}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImagesUpload
              initialImages={detail.images}
              onFilesStaged={setStagedImages}
              onExistingImagesChange={setCurrentImages}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <Label htmlFor="active">Active</Label>
                  <p className="text-xs text-muted-foreground">Product is visible in store</p>
                </div>
                <Switch id="active" checked={active} onCheckedChange={setActive} />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <Label htmlFor="featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">Show on homepage</p>
                </div>
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
              </div>
            </div>
          </CardContent>
        </Card>

        {saveError && (
          <p className="text-sm text-destructive text-right">{saveError}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving || categoryIds.length === 0}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

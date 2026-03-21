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
import { ImageUpload } from "@/components/admin/image-upload";
import { CategorySelector } from "@/components/admin/product-form/category-selector";
import { ProductFormSuccess } from "@/components/admin/product-form/product-form-success";
import { ProductImagesUpload } from "@/components/admin/product-form/product-images-upload";
import { ProductVariantsEditor, type StagedVariant } from "@/components/admin/product-form/product-variants-editor";
import { ArrowLeft } from "lucide-react";
import {
  getProductDetail,
  getCategories,
  updateProduct,
  updateProductVariant,
  deleteProductImage,
  uploadProductImages,
  createProductVariants,
  deleteProductVariant,
} from "@/services/products-service";
import { generateSlug, toggleArrayItem } from "@/lib/product-utils";
import { ProductStatus } from "@/enums";
import type { ApiProductDetail, ApiCategory, ApiProductImage } from "@/types/api";
import type { CreateVariantRequest } from "@/interfaces/products";

function toCreateVariantRequest(v: StagedVariant): CreateVariantRequest {
  return {
    name: v.name,
    size: v.size,
    additionalPrice: Number.parseFloat(v.additionalPrice) || 0,
    sku: v.sku || undefined,
    stockQuantity: Number.parseInt(v.stockQuantity, 10),
    isDefault: v.isDefault,
    isAvailable: v.isAvailable,
  };
}

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
  const [active, setActive] = React.useState(true);
  const [featured, setFeatured] = React.useState(false);
  const [displayOrder, setDisplayOrder] = React.useState("0");
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [currentImages, setCurrentImages] = React.useState<ApiProductImage[]>([]);
  const [stagedImages, setStagedImages] = React.useState<File[]>([]);
  const [stagedVariants, setStagedVariants] = React.useState<StagedVariant[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const loadProduct = React.useCallback(async () => {
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
      setActive(dto.status === ProductStatus.Active);
      setFeatured(dto.isFeatured);
      setDisplayOrder(dto.displayOrder.toString());
      setImageUrl(dto.thumbnailUrl ?? null);
      setCurrentImages(dto.images);
    } catch {
      setError("Failed to load product. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  // Compute whether any field differs from the last-loaded server state.
  const hasPendingChanges = React.useMemo(() => {
    if (!detail) return false;
    if (name !== detail.name) return true;
    if (slug !== detail.slug) return true;
    if (description !== (detail.description ?? "")) return true;
    if (Number.parseFloat(price) !== detail.basePrice) return true;
    if (active !== (detail.status === ProductStatus.Active)) return true;
    if (featured !== detail.isFeatured) return true;
    if (displayOrder !== detail.displayOrder.toString()) return true;
    const origCats = detail.categories.map((c) => c.id).sort((a, b) => a.localeCompare(b)).join(",");
    const currCats = [...categoryIds].sort((a, b) => a.localeCompare(b)).join(",");
    if (origCats !== currCats) return true;
    if (thumbnailFile !== null) return true;
    if (stagedImages.length > 0) return true;
    if (currentImages.length !== detail.images.length) return true;
    if (stagedVariants.some((v) => v.dirty || v.deleted || !v.serverId)) return true;
    return false;
  }, [detail, name, slug, description, price, active, featured, displayOrder, categoryIds, thumbnailFile, stagedImages, currentImages, stagedVariants]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!detail || categoryIds.length === 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      // --- Step 1: Variant deletes + updates (parallel, before product update) ---
      const variantsToDelete = stagedVariants.filter((v) => v.serverId && v.deleted);
      const variantsToUpdate = stagedVariants.filter((v) => v.serverId && v.dirty && !v.deleted);
      const variantsToCreate = stagedVariants.filter((v) => !v.serverId && !v.deleted);

      if (variantsToDelete.length > 0 || variantsToUpdate.length > 0) {
        const variantResults = await Promise.allSettled([
          ...variantsToDelete.map((v) => deleteProductVariant(id, v.serverId!)),
          ...variantsToUpdate.map((v) =>
            updateProductVariant(id, v.serverId!, {
              name: v.name,
              size: v.size,
              additionalPrice: Number.parseFloat(v.additionalPrice) || 0,
              sku: v.sku,
              stockQuantity: Number.parseInt(v.stockQuantity, 10),
              isDefault: v.isDefault,
              isAvailable: v.isAvailable,
            })
          ),
        ]);

        const variantFailures = variantResults.filter((r) => r.status === "rejected");
        if (variantFailures.length > 0) {
          setSaveError(
            `${variantFailures.length} variant operation(s) failed. Please try again.`
          );
          setSaving(false);
          return;
        }
      }

      // --- Step 2: Product update + image deletes (parallel) ---
      const currentImageIds = new Set(currentImages.map((img) => img.id));
      const deletedImageIds = detail.images
        .filter((img) => !currentImageIds.has(img.id))
        .map((img) => img.id);

      const [productResult, ...imageDeleteResults] = await Promise.allSettled([
        updateProduct(id, {
          name,
          slug,
          description,
          basePrice: Number.parseFloat(price),
          categoryIds,
          thumbnail: thumbnailFile ?? undefined,
          status: active ? ProductStatus.Active : ProductStatus.Inactive,
          isFeatured: featured,
          displayOrder: displayOrder !== "" ? Number.parseInt(displayOrder, 10) : undefined,
        }),
        ...deletedImageIds.map((imageId) => deleteProductImage(id, imageId)),
      ]);

      if (productResult.status === "rejected") {
        setSaveError("Failed to update product. Please try again.");
        setSaving(false);
        return;
      }

      const imageDeleteFailures = imageDeleteResults.filter((r) => r.status === "rejected");
      if (imageDeleteFailures.length > 0) {
        setSaveError(
          `Product saved, but ${imageDeleteFailures.length} image(s) could not be deleted. Please try again.`
        );
        setSaving(false);
        return;
      }

      // --- Step 3: Upload staged images ---
      if (stagedImages.length > 0) {
        try {
          await uploadProductImages(id, stagedImages);
        } catch {
          setSaveError("Product saved, but some images could not be uploaded. Please try again.");
          setSaving(false);
          return;
        }
      }

      // --- Step 4: Create new variants ---
      if (variantsToCreate.length > 0) {
        try {
          await createProductVariants(id, variantsToCreate.map(toCreateVariantRequest));
        } catch {
          setSaveError("Product saved, but some variants could not be created. Please try again.");
          setSaving(false);
          return;
        }
      }

      // --- Step 5: Refetch to sync UI with server state ---
      await loadProduct();
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
                <CardTitle>Pricing</CardTitle>
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

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
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
            <CardTitle>Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductVariantsEditor
              initialVariants={detail.variants}
              onChange={setStagedVariants}
            />
          </CardContent>
        </Card>

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
          <Button
            type="submit"
            disabled={saving || categoryIds.length === 0 || !hasPendingChanges}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

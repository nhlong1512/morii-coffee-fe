"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { CategorySelector } from "@/components/admin/product-form/category-selector";
import { ProductFormSuccess } from "@/components/admin/product-form/product-form-success";
import { ProductImagesUpload } from "@/components/admin/product-form/product-images-upload";
import { ProductVariantsEditor, type StagedVariant } from "@/components/admin/product-form/product-variants-editor";
import { ArrowLeft } from "lucide-react";
import { createProduct, getCategories, uploadProductImages, createProductVariants } from "@/services/products-service";
import { generateSlug, toggleArrayItem } from "@/lib/product-utils";
import type { ApiCategory } from "@/types/api";
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

export default function NewProductPage() {
  const router = useRouter();

  const [categoryList, setCategoryList] = React.useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [price, setPrice] = React.useState("");
  const [featured, setFeatured] = React.useState(false);
  const [displayOrder, setDisplayOrder] = React.useState("0");
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [stagedImages, setStagedImages] = React.useState<File[]>([]);
  const [stagedVariants, setStagedVariants] = React.useState<StagedVariant[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    getCategories()
      .then(setCategoryList)
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (categoryIds.length === 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      const created = await createProduct({
        name,
        slug: slug || undefined,
        description: description || undefined,
        basePrice: Number.parseFloat(price),
        categoryIds,
        thumbnail: thumbnailFile ?? undefined,
        isFeatured: featured,
        displayOrder: displayOrder !== "" ? Number.parseInt(displayOrder, 10) : undefined,
      });

      // Upload images and create variants in parallel after the product exists.
      const postCreateTasks: Promise<unknown>[] = [];
      if (stagedImages.length > 0) {
        postCreateTasks.push(uploadProductImages(created.id, stagedImages));
      }
      const variantsToCreate = stagedVariants.filter((v) => !v.deleted);
      if (variantsToCreate.length > 0) {
        postCreateTasks.push(
          createProductVariants(created.id, variantsToCreate.map(toCreateVariantRequest))
        );
      }

      if (postCreateTasks.length > 0) {
        const results = await Promise.allSettled(postCreateTasks);
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          setSaveError("Product created, but some images or variants could not be saved. Please edit the product to fix them.");
          setSaving(false);
          return;
        }
      }

      setSubmitted(true);
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <ProductFormSuccess
        title="Product Created Successfully"
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
          <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
          <p className="text-muted-foreground">Add a new product to your catalog</p>
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
                  placeholder="product-slug (auto-generated if left blank)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to auto-generate from name. Must be unique.
                </p>
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
                loading={categoriesLoading}
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
                  category={categoryList.find((c) => categoryIds.includes(c.id))?.name.toLowerCase()}
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
              onChange={(variants) => setStagedVariants(variants)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImagesUpload onFilesStaged={setStagedImages} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-3 max-w-sm">
              <div>
                <Label htmlFor="featured">Featured</Label>
                <p className="text-xs text-muted-foreground">Show on homepage</p>
              </div>
              <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              New products are set to <strong>Active</strong> by default.
            </p>
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
            {saving ? "Creating…" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

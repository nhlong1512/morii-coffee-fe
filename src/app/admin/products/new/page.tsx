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
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/admin/image-upload";
import { CategorySelector } from "@/components/admin/product-form/category-selector";
import { SizePriceSelector } from "@/components/admin/product-form/size-price-selector";
import { ProductFormSuccess } from "@/components/admin/product-form/product-form-success";
import { ArrowLeft } from "lucide-react";
import { createProduct, getCategories } from "@/services/products-service";
import { generateSlug, toggleArrayItem, toggleSetItem } from "@/lib/product-utils";
import type { ApiCategory } from "@/types/api";

export default function NewProductPage() {
  const router = useRouter();

  const [categoryList, setCategoryList] = React.useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [price, setPrice] = React.useState("");
  const [selectedSizes, setSelectedSizes] = React.useState<Set<string>>(new Set());
  const [sizeModifiers, setSizeModifiers] = React.useState<Record<string, string>>({});
  const [featured, setFeatured] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryIds.length === 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      await createProduct({
        name,
        slug: slug || undefined,
        description: description || undefined,
        basePrice: Number.parseFloat(price),
        categoryIds,
        thumbnail: thumbnailFile ?? undefined,
        isFeatured: featured,
      });
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
                <CardTitle>Images</CardTitle>
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

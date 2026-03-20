"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  getProductDetail,
  getCategories,
  updateProduct,
} from "@/services/products-service";
import type { ApiProductDetail, ApiCategory, ApiProductSize } from "@/types/api";
import { ImageUpload } from "@/components/admin/image-upload";
import { ArrowLeft } from "lucide-react";

const ALL_SIZES: ApiProductSize[] = ["Small", "Medium", "Large"];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = React.useState<ApiProductDetail | null>(null);
  const [categoryList, setCategoryList] = React.useState<ApiCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // form state
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

  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dto, cats] = await Promise.all([
          getProductDetail(id),
          getCategories(),
        ]);
        setDetail(dto);
        setCategoryList(cats);

        // Pre-populate form from API data
        setName(dto.name);
        setSlug(dto.slug);
        setDescription(dto.description ?? "");
        setCategoryIds(dto.categories.map((c) => c.id));
        setPrice(dto.basePrice.toString());
        setActive(dto.status === "Active");
        setFeatured(dto.isFeatured);
        setImageUrl(dto.thumbnailUrl ?? null);

        // Map variants → selected sizes + price modifiers
        const sizes = new Set<string>();
        const modifiers: Record<string, string> = {};
        for (const variant of dto.variants) {
          sizes.add(variant.size);
          if (variant.additionalPrice > 0) {
            modifiers[variant.size] = variant.additionalPrice.toString();
          }
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

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleCategoryToggle = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryIds.length === 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      await updateProduct(id, {
        name,
        slug,
        description,
        basePrice: Number.parseFloat(price),
        categoryIds,
        thumbnail: thumbnailFile ?? undefined,
        status: active ? "Active" : "Inactive",
        isFeatured: featured,
      });
      setSubmitted(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
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

  // ── Error / Not found ──────────────────────────────────────────────────────
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

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-green-600/15 p-4 mb-4">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Product Updated Successfully</h2>
        <p className="text-muted-foreground mt-1">
          Redirecting to product list...
        </p>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
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

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="space-y-2 rounded-md border border-input p-3">
                  {categoryList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Loading categories…</p>
                  ) : (
                    categoryList.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={categoryIds.includes(cat.id)}
                          onCheckedChange={() => handleCategoryToggle(cat.id)}
                        />
                        <Label htmlFor={`cat-${cat.id}`} className="font-normal cursor-pointer">
                          {cat.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {categoryIds.length === 0 && (
                  <p className="text-xs text-destructive">Select at least one category.</p>
                )}
              </div>
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

                <div className="space-y-3">
                  <Label>Sizes</Label>
                  <div className="space-y-3">
                    {ALL_SIZES.map((size) => (
                      <div key={size} className="flex items-center gap-3">
                        <Checkbox
                          id={`size-${size}`}
                          checked={selectedSizes.has(size)}
                          onCheckedChange={() => handleSizeToggle(size)}
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className="w-16 font-medium"
                        >
                          {size}
                        </Label>
                        {selectedSizes.has(size) && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              +₫
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="h-8 w-24"
                              value={sizeModifiers[size] ?? ""}
                              onChange={(e) =>
                                setSizeModifiers((prev) => ({
                                  ...prev,
                                  [size]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
                  category={detail.categories[0]?.name.toLowerCase()}
                  alt={detail.name}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <Label htmlFor="active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Product is visible in store
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <Label htmlFor="featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Show on homepage
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
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

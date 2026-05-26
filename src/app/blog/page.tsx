"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePublicBlogCategories, usePublicBlogPosts } from "@/features/blogs/hooks";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  "Brewing Guide": "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400",
  Origins: "bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400",
  Recipes: "bg-pink-100 text-pink-800 dark:bg-pink-400/10 dark:text-pink-400",
  Education: "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400",
  "About Us": "bg-violet-100 text-violet-800 dark:bg-violet-400/10 dark:text-violet-400",
  Tips: "bg-orange-100 text-orange-800 dark:bg-orange-400/10 dark:text-orange-400",
};

export default function BlogPage() {
  const t = useTranslations("blogPage");
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const { data: posts = [], loading, error } = usePublicBlogPosts({ takeAll: true });
  const { data: categories = [] } = usePublicBlogCategories();

  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" ||
        post.categories.some((category) => category.slug === selectedCategory);
      const matchesSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        (post.excerpt ?? "").toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [posts, search, selectedCategory]);

  const featuredPost = filteredPosts[0] ?? null;
  const remainingPosts = featuredPost ? filteredPosts.slice(1) : [];

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(
      typeof document !== "undefined" && document.documentElement.lang.startsWith("vi")
        ? "vi-VN"
        : "en-US",
      {
      year: "numeric",
      month: "short",
      day: "numeric",
      }
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-border bg-card px-6 py-8 shadow-sm sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {t("subtitle")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] lg:min-w-[460px]">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("searchPlaceholder")}
              />
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  onClick={() => setSelectedCategory("all")}
                >
                  {t("allCategories")}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm transition-colors",
                      selectedCategory === category.slug
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner variant="spinner" size="md" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} inline={false} />
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="space-y-8">
            {featuredPost ? (
              <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
                <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                  <Link href={`/blog/${featuredPost.slug}`} className="block h-full">
                    <BlogCoverImage
                      src={featuredPost.coverImageUrl}
                      alt={featuredPost.title}
                      width={1200}
                      height={720}
                      priority
                      className="min-h-[260px]"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      placeholderIndex={0}
                    />
                  </Link>
                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                          categoryColors[featuredPost.categories[0]?.name ?? ""] ||
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {featuredPost.categories[0]?.name ?? t("uncategorized")}
                      </span>
                      <Link href={`/blog/${featuredPost.slug}`}>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-card-foreground transition-colors hover:text-primary sm:text-3xl">
                          {featuredPost.title}
                        </h2>
                      </Link>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                        {featuredPost.excerpt}
                      </p>
                    </div>
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatDate(featuredPost.publishedAt ?? featuredPost.createdAt)}</span>
                      </div>
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {t("readMore")}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ) : null}

            {remainingPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {remainingPosts.map((post, idx) => (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <BlogCoverImage
                        src={post.coverImageUrl}
                        alt={post.title}
                        width={800}
                        height={480}
                        className="h-48"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        placeholderIndex={idx + 1}
                      />
                    </Link>

                    <div className="p-5">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                          categoryColors[post.categories[0]?.name ?? ""] ||
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {post.categories[0]?.name ?? t("uncategorized")}
                      </span>
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="mt-3 text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {t("readMore")}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

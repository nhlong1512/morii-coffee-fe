"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { useFeaturedBlogPosts } from "@/features/blogs/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const categoryColors = [
  "bg-amber-800",
  "bg-stone-700",
  "bg-sky-800",
];

export function BlogPreview() {
  const t = useTranslations("home");
  const { data: latestPosts = [], loading, error } = useFeaturedBlogPosts(3);

  if (loading) {
    return (
      <section className="py-16">
        <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <LoadingSpinner variant="spinner" size="md" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("latestBlog")}
          </h2>
          <Button asChild variant="ghost" className="gap-1 text-muted-foreground">
            <Link href="/blog">
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {error ? (
          <ErrorMessage message={error} inline={false} />
        ) : latestPosts.length === 0 ? (
          <EmptyState
            title={t("blogEmptyTitle")}
            description={t("blogEmptyDescription")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow transition-all duration-300 hover:shadow-lg"
              >
                {post.coverImageUrl ? (
                  <BlogCoverImage
                    src={post.coverImageUrl}
                    alt={post.title}
                    width={800}
                    height={480}
                    className="h-48"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    placeholderIndex={index}
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-48 items-center justify-center",
                      categoryColors[index % categoryColors.length]
                    )}
                  >
                    <BookOpen className="h-12 w-12 text-white/40" />
                  </div>
                )}

                <div className="p-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {post.categories[0]?.name ?? t("viewAll")}
                  </p>
                  <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.categories[0]?.name ?? t("viewAll")}</span>
                    <span>
                      {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(
                        typeof document !== "undefined" && document.documentElement.lang.startsWith("vi")
                          ? "vi-VN"
                          : "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

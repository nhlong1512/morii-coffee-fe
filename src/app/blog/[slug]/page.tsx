"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePublicBlogPost } from "@/features/blogs/hooks";
import { sanitizeBlogHtml } from "@/features/blogs/utils";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  "Brewing Guide": "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400",
  Origins: "bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400",
  Recipes: "bg-pink-100 text-pink-800 dark:bg-pink-400/10 dark:text-pink-400",
  Education: "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400",
  "About Us": "bg-violet-100 text-violet-800 dark:bg-violet-400/10 dark:text-violet-400",
  Tips: "bg-orange-100 text-orange-800 dark:bg-orange-400/10 dark:text-orange-400",
};

export default function BlogDetailPage() {
  const params = useParams();
  const t = useTranslations("blogPage");
  const slug = params.slug as string;
  const { data: post, loading, error } = usePublicBlogPost(slug);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <LoadingSpinner variant="spinner" size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorMessage message={error} inline={false} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title={t("detailNotFoundTitle")}
          description={t("detailNotFoundDescription")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("backToBlog")}
        </Link>

        <BlogCoverImage
          src={post.coverImageUrl}
          alt={post.title}
          width={1200}
          height={640}
          className="mt-4 h-64 rounded-xl sm:h-80"
          sizes="(max-width: 1024px) 100vw, 896px"
        />

        {/* Article Content */}
        <article className="mt-8">
          {/* Category */}
          <span
            className={cn(
              "inline-block rounded-full px-3 py-1 text-xs font-medium",
              categoryColors[post.categories[0]?.name ?? ""] || "bg-muted text-muted-foreground"
            )}
          >
            {post.categories[0]?.name ?? t("uncategorized")}
          </span>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>
                {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(
                  typeof document !== "undefined" && document.documentElement.lang.startsWith("vi")
                    ? "vi-VN"
                    : "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose prose-zinc mt-8 max-w-none border-t border-border pt-8 dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: sanitizeBlogHtml(post.contentHtml),
            }}
          />
        </article>

        {/* Back to blog */}
        <div className="mt-12 border-t border-border pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("backToAllPosts")}
          </Link>
        </div>
      </div>
    </div>
  );
}

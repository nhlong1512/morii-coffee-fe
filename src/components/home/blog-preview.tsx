import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { blogPosts } from "@/data/blogs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const categoryColors = [
  "bg-amber-800",
  "bg-stone-700",
  "bg-sky-800",
];

export function BlogPreview() {
  const t = useTranslations("home");
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex items-center justify-between">
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

        {/* Blog Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow transition-all duration-300 hover:shadow-lg"
            >
              {/* Image Placeholder */}
              <div
                className={cn(
                  "flex h-48 items-center justify-center",
                  categoryColors[index % categoryColors.length]
                )}
              >
                <BookOpen className="h-12 w-12 text-white/40" />
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {post.category}
                </p>
                <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

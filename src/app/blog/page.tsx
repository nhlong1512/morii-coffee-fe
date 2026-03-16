import Link from "next/link";
import { Coffee, ArrowRight, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { blogPosts } from "@/data/blogs";

const categoryColors: Record<string, string> = {
  "Brewing Guide": "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400",
  Origins: "bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400",
  Recipes: "bg-pink-100 text-pink-800 dark:bg-pink-400/10 dark:text-pink-400",
  Education: "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400",
  "About Us": "bg-violet-100 text-violet-800 dark:bg-violet-400/10 dark:text-violet-400",
  Tips: "bg-orange-100 text-orange-800 dark:bg-orange-400/10 dark:text-orange-400",
};

const placeholderGradients = [
  "from-amber-700/70 to-amber-500/50",
  "from-green-700/70 to-green-500/50",
  "from-pink-600/70 to-pink-400/50",
  "from-blue-700/70 to-blue-500/50",
  "from-violet-600/70 to-violet-400/50",
  "from-orange-600/70 to-orange-400/50",
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Stories, guides, and tips from the world of coffee.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, idx) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
            >
              {/* Image Placeholder */}
              <Link href={`/blog/${post.slug}`}>
                <div
                  className={cn(
                    "flex h-48 items-center justify-center bg-gradient-to-br",
                    placeholderGradients[idx % placeholderGradients.length]
                  )}
                >
                  <Coffee className="h-12 w-12 text-white/50" />
                </div>
              </Link>

              <div className="p-5">
                {/* Category Badge */}
                <span
                  className={cn(
                    "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                    categoryColors[post.category] ||
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {post.category}
                </span>

                {/* Title */}
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="mt-3 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                </Link>

                {/* Excerpt */}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Read More */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Read More
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

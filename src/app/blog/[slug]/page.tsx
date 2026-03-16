import Link from "next/link";
import { Coffee, ChevronLeft, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { blogPosts } from "@/data/blogs";
import { BlogCommentsSection } from "@/components/reviews/blog-comments-wrapper";

const categoryColors: Record<string, string> = {
  "Brewing Guide": "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400",
  Origins: "bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400",
  Recipes: "bg-pink-100 text-pink-800 dark:bg-pink-400/10 dark:text-pink-400",
  Education: "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400",
  "About Us": "bg-violet-100 text-violet-800 dark:bg-violet-400/10 dark:text-violet-400",
  Tips: "bg-orange-100 text-orange-800 dark:bg-orange-400/10 dark:text-orange-400",
};

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4">
        <Coffee className="mb-4 h-16 w-16 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold text-foreground">Post Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The blog post you are looking for does not exist.
        </p>
        <Link
          href="/blog"
          className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Blog
        </Link>
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
          Back to Blog
        </Link>

        {/* Header Image Placeholder */}
        <div className="mt-4 flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-primary/60 to-accent/40 sm:h-80">
          <Coffee className="h-16 w-16 text-white/50" />
        </div>

        {/* Article Content */}
        <article className="mt-8">
          {/* Category */}
          <span
            className={cn(
              "inline-block rounded-full px-3 py-1 text-xs font-medium",
              categoryColors[post.category] || "bg-muted text-muted-foreground"
            )}
          >
            {post.category}
          </span>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mt-8 border-t border-border pt-8">
            {post.content.split("\n\n").map((paragraph, idx) => (
              <p
                key={idx}
                className="mb-4 leading-relaxed text-foreground/90"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-12 border-t border-border pt-8">
          <BlogCommentsSection postId={post.id} />
        </div>

        {/* Back to blog */}
        <div className="mt-12 border-t border-border pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}

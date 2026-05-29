"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { blogComments, type BlogComment } from "@/data/reviews";
import { useAuthStore } from "@/stores/auth-store";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

interface BlogCommentsProps {
  postId: string;
}

function CommentItem({
  comment,
  isReply = false,
}: {
  comment: BlogComment;
  isReply?: boolean;
}) {
  const t = useTranslations("reviews");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitted, setReplySubmitted] = useState(false);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim().length < 1) return;
    setReplySubmitted(true);
    setShowReplyForm(false);
    setReplyText("");
  };

  return (
    <div className={cn("flex gap-3", isReply && "ml-12 mt-3")}>
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {comment.userName.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {comment.userName}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <p className="mt-1 text-sm leading-relaxed text-foreground/90">
          {comment.comment}
        </p>

        {/* Reply button */}
        {!isReply && isAuthenticated && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {t("replyTo")}
          </button>
        )}

        {replySubmitted && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <CheckCircle className="h-3.5 w-3.5" />
            {t("commentAdded")}
          </p>
        )}

        {/* Reply form */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t("replyTo") + "..."}
              rows={2}
              className="resize-none text-sm"
            />
            <button
              type="submit"
              className="shrink-0 self-end rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("replyTo")}
            </button>
          </form>
        )}

        {/* Nested replies */}
        {comment.replies?.map((reply) => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  );
}

export function BlogComments({ postId }: BlogCommentsProps) {
  const t = useTranslations("reviews");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const postComments = blogComments.filter((c) => c.postId === postId);
  const [newComment, setNewComment] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim().length < 1) return;
    setCommentSubmitted(true);
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        {t("reviews")} ({postComments.length})
      </h3>

      {/* Add comment form */}
      {isAuthenticated && (
        <form onSubmit={handleAddComment} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("addComment") + "..."}
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            {commentSubmitted && (
              <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="h-3.5 w-3.5" />
                {t("commentAdded")}
              </p>
            )}
            <button
              type="submit"
              className="ml-auto rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("addComment")}
            </button>
          </div>
        </form>
      )}

      {!isAuthenticated && (
        <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">{t("signInToReview")}</p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-5">
        {postComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

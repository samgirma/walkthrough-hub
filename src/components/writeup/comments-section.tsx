"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Send, Trash2, Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIdleSession } from "@/lib/use-idle-session";
import { formatDate } from "@/lib/utils";

export interface CommentAuthor {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  role: string;
}

export interface CommentData {
  id: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: CommentAuthor;
}

interface CommentsSectionProps {
  writeupId: string;
  writeupAuthorId?: string;
  initialCommentsCount?: number;
}

export function CommentsSection({
  writeupId,
  writeupAuthorId,
  initialCommentsCount = 0,
}: CommentsSectionProps) {
  const { user } = useIdleSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [totalCount, setTotalCount] = useState(initialCommentsCount);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!writeupId) return;
    try {
      const res = await fetch(`/api/writeups/${encodeURIComponent(writeupId)}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [writeupId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) return;

    if (trimmed.length > 2000) {
      setError("Comment cannot exceed 2,000 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/writeups/${encodeURIComponent(writeupId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to post comment.");
      }

      const newComment: CommentData = await res.json();
      setContent("");
      setComments((prev) => [...prev, newComment]);
      setTotalCount((prev) => prev + 1);
    } catch (err: any) {
      setError(err?.message || "Failed to submit comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(commentId)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete comment.");
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      alert(err?.message || "Could not delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section
      id="comments"
      aria-label="Writeup discussion and comments"
      className="mt-16 pt-10 border-t border-[#242936] font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="h-5 w-5 text-[#22D3A0]" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Discussion
          </h2>
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#181C25] border border-[#242936] text-[#BACAC1]">
            {totalCount}
          </span>
        </div>
      </div>

      {/* New Comment Box (Signed in) vs Sign-in Callout (Public) */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 space-y-3">
          <div className="p-4 rounded-xl bg-[#12151C]/90 border border-[#242936] focus-within:border-[#22D3A0]/60 transition-colors">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#242936]/60">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User avatar"}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#242936] text-[10px] flex items-center justify-center font-bold text-[#22D3A0]">
                  {(user.name || "U")[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-mono text-[#BACAC1]">
                Commenting as <strong className="text-white">{user.name || user.email}</strong>
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or alternative exploitation techniques..."
              rows={3}
              maxLength={2000}
              className="w-full bg-transparent text-sm text-white placeholder-[#475569] resize-y focus:outline-none scrollbar-thin font-sans"
            />

            <div className="flex items-center justify-between pt-2 border-t border-[#242936]/60 text-xs">
              <span className="font-mono text-[11px] text-[#475569]">
                {content.length} / 2,000
              </span>

              <Button
                type="submit"
                disabled={submitting || !content.trim()}
                className="bg-[#22D3A0] hover:bg-[#1eb88b] text-[#0B0D12] font-mono text-xs font-bold gap-1.5 min-h-[36px] px-4"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submitting ? "Posting..." : "Post Comment"}</span>
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </form>
      ) : (
        /* Public Read-Only Callout */
        <div className="mb-10 p-5 rounded-xl bg-[#12151C]/60 border border-[#242936] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              Join the conversation
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Public readers can read all discussions. Sign in to post comments and star this writeup.
            </p>
          </div>
          <Link
            href={`/login?callbackUrl=${
              typeof window !== "undefined"
                ? encodeURIComponent(window.location.pathname)
                : "/explore"
            }`}
          >
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs gap-1.5 border-[#22D3A0]/40 text-[#22D3A0] hover:bg-[#22D3A0]/10 shrink-0"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign in to Comment</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-[#242936] bg-[#12151C]/40 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#181C25]" />
                <div className="h-4 w-28 rounded bg-[#181C25]" />
              </div>
              <div className="h-3.5 w-3/4 rounded bg-[#181C25]/80" />
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isAuthor = comment.user.id === writeupAuthorId;
            const isOwnComment = user?.id === comment.user.id;
            const canDelete = isOwnComment || user?.role === "ADMIN";

            return (
              <article
                key={comment.id}
                className="p-4 sm:p-5 rounded-xl border border-[#242936] bg-[#12151C]/80 backdrop-blur-sm transition-colors hover:border-[#363E52]"
              >
                {/* Author row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    {comment.user.avatarUrl ? (
                      <Image
                        src={comment.user.avatarUrl}
                        alt={comment.user.username || "User avatar"}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover border border-[#242936]"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#181C25] border border-[#242936] text-[11px] flex items-center justify-center font-bold text-[#22D3A0]">
                        {(comment.user.username || comment.user.name || "U")[0].toUpperCase()}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/u/${comment.user.username || ""}`}
                        className="font-mono text-xs font-bold text-white hover:text-[#22D3A0] transition-colors"
                      >
                        @{comment.user.username || comment.user.name || "anonymous"}
                      </Link>

                      {isAuthor && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#22D3A0]/10 text-[#22D3A0] border border-[#22D3A0]/20 font-semibold">
                          Author
                        </span>
                      )}

                      {comment.user.role === "ADMIN" && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold flex items-center gap-1">
                          <Shield className="h-2.5 w-2.5" />
                          Admin
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-[#475569]">
                        • {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      aria-label="Delete comment"
                      className="text-[#475569] hover:text-rose-400 hover:bg-rose-500/10 h-7 w-7 p-0 rounded-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Comment body */}
                <p className="text-sm text-[#BACAC1] leading-relaxed whitespace-pre-wrap break-words pl-9">
                  {comment.content}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-[#242936]/60 bg-[#12151C]/40">
          <MessageSquare className="h-8 w-8 text-[#475569] mx-auto mb-2 opacity-50" />
          <p className="text-xs text-[#94A3B8]">
            No comments yet. Be the first to start the discussion!
          </p>
        </div>
      )}
    </section>
  );
}

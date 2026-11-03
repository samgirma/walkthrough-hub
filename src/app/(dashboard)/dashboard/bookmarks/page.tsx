import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Bookmark, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserBookmarks } from "@/server/bookmark.service";
import { WriteupCard } from "@/components/writeup/writeup-card";

export const metadata: Metadata = {
  title: "Saved Bookmarks // WriteupHub",
};

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/bookmarks");
  }

  const userId = session.user.id;
  const { items } = await getUserBookmarks(userId);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-amber-400" />
        <h1 className="font-sans font-bold text-2xl text-white tracking-tight">
          Saved Bookmarks ({items.length})
        </h1>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((writeup) => (
            <WriteupCard key={writeup.id} writeup={writeup as any} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl border border-[#242936] bg-[#12151C] text-[#94A3B8]">
          <Bookmark className="h-10 w-10 text-[#475569] mx-auto mb-3" />
          <p className="font-sans text-sm mb-3">You haven&apos;t saved any walkthroughs yet.</p>
          <Link
            href="/explore"
            className="text-xs font-mono text-primary hover:underline"
          >
            Explore Public Writeups →
          </Link>
        </div>
      )}
    </div>
  );
}

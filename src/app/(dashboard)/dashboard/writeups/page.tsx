import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Edit, Plus, ExternalLink, Trash2 } from "lucide-react";
import { requireOnboarded } from "@/server/auth/dal";
import { getAuthorWriteups } from "@/server/writeup.service";
import { Button } from "@/components/ui/button";
import { formatDate, getCategoryColor } from "@/lib/utils";
import { Status } from "@prisma/client";

export const metadata: Metadata = {
  title: "My Writeups // WriteupHub Studio",
};

interface WriteupsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function WriteupsPage({ searchParams }: WriteupsPageProps) {
  const params = await searchParams;
  const user = await requireOnboarded("/dashboard/writeups");
  const userId = user.id;
  const username = user.username;

  const filterStatus = params.status as Status | undefined;
  const writeups = await getAuthorWriteups(userId, filterStatus);

  const tabs = [
    { label: "All", value: undefined },
    { label: "Published", value: "PUBLIC" },
    { label: "Drafts", value: "DRAFT" },
    { label: "Unlisted", value: "UNLISTED" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-bold text-2xl text-white tracking-tight">
            My Writeups
          </h1>
          <p className="font-sans text-xs text-[#94A3B8]">
            Manage published exploits, unlisted review links, and drafts in progress.
          </p>
        </div>

        <Link href="/write">
          <Button
            size="sm"
            className="gradient-cta text-[#0B0D12] font-mono font-bold text-xs gap-1 shadow-[0_0_16px_rgba(34,211,160,0.25)]"
          >
            <Plus className="h-4 w-4" />
            <span>New Writeup</span>
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-[#12151C] p-1 rounded-xl border border-[#242936] w-fit font-mono text-xs">
        {tabs.map((t) => {
          const active = filterStatus === t.value;
          return (
            <Link
              key={t.label}
              href={
                t.value
                  ? `/dashboard/writeups?status=${t.value}`
                  : "/dashboard/writeups"
              }
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                active
                  ? "bg-[#181C25] text-[#22D3A0] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Writeup Table */}
      <div className="rounded-xl border border-[#242936] bg-[#12151C] overflow-hidden shadow-sm">
        {writeups.length > 0 ? (
          <div className="divide-y divide-[#242936]">
            {writeups.map((w) => {
              const cat = getCategoryColor(w.category);
              const readUrl = `/w/${username}/${w.slug}`;

              return (
                <div
                  key={w.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#181C25]/40 transition-colors"
                >
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: cat.bg,
                          borderColor: cat.border,
                          color: cat.color,
                        }}
                      >
                        {w.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                          w.status === "PUBLIC"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : w.status === "UNLISTED"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                        }`}
                      >
                        {w.status}
                      </span>
                      <span className="font-mono text-xs text-[#475569]">
                        {w.ctfName} &apos;{String(w.ctfYear).slice(-2)}
                      </span>
                    </div>

                    <Link
                      href={readUrl}
                      className="font-sans font-bold text-sm text-white hover:text-primary transition-colors truncate"
                    >
                      {w.title}
                    </Link>

                    <div className="flex items-center gap-3 text-xs font-mono text-[#475569]">
                      <span>{w.viewCount} views</span>
                      <span>•</span>
                      <span>{w.readTimeMin}m read</span>
                      <span>•</span>
                      <span>Updated {formatDate(w.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242936]/40 shrink-0">
                    <Link href={`/write/${w.id}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs font-mono h-8 min-h-[36px] gap-1"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                    </Link>
                    <Link href={readUrl} target="_blank">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-mono h-8 min-h-[36px] gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-[#94A3B8]">
            <p className="font-sans text-xs">No writeups in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
  FileText,
  Eye,
  Globe,
  Edit,
  Plus,
  TrendingUp,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { auth } from "@/lib/auth";
import {
  getAuthorDashboardMetrics,
  getAuthorWriteups,
} from "@/server/writeup.service";
import { Button } from "@/components/ui/button";
import {
  formatCompactNumber,
  formatDate,
  getCategoryColor,
  getDifficultyColor,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Author Overview // WriteupHub Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userId = session.user.id;
  const username = session.user.username || "author";

  const [metrics, writeups] = await Promise.all([
    getAuthorDashboardMetrics(userId),
    getAuthorWriteups(userId),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Top Header & Overview Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-sans font-bold text-2xl text-white tracking-tight">
              Author Overview
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#181C25] border border-[#242936] text-primary font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Verified Op
            </span>
          </div>
          <p className="font-sans text-xs text-[#94A3B8] max-w-2xl">
            Manage your CTF walkthroughs, analyze readership impact, and publish rigorous exploit documentation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/write">
            <Button
              size="sm"
              className="gradient-cta text-[#0B0D12] font-mono font-bold text-xs gap-1.5 shadow-[0_0_20px_rgba(34,211,160,0.3)]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>New Writeup</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row (2x2 on mobile, 4-col on lg) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Writeups */}
        <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 text-[#475569] font-mono text-[11px] uppercase">
            <span>Total Writeups</span>
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-sans font-bold text-3xl text-white">
              {metrics.totalWriteups}
            </span>
            <span className="font-mono text-[11px] text-primary flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +3 mo
            </span>
          </div>
          <div className="w-full h-8">
            <svg className="w-full h-full text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 160 36">
              <path d="M0,30 L20,28 L40,24 L60,26 L80,18 L100,20 L120,12 L140,8 L160,4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              <path d="M0,30 L20,28 L40,24 L60,26 L80,18 L100,20 L120,12 L140,8 L160,4 L160,36 L0,36 Z" fill="currentColor" fillOpacity="0.08" />
            </svg>
          </div>
        </div>

        {/* Total Views */}
        <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 text-[#475569] font-mono text-[11px] uppercase">
            <span>Total Views</span>
            <Eye className="h-4 w-4" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-sans font-bold text-3xl text-white">
              {formatCompactNumber(metrics.totalViews)}
            </span>
            <span className="font-mono text-[11px] text-secondary flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +18.4%
            </span>
          </div>
          <div className="w-full h-8">
            <svg className="w-full h-full text-secondary" fill="none" preserveAspectRatio="none" viewBox="0 0 160 36">
              <path d="M0,34 L25,30 L45,26 L70,16 L95,22 L115,10 L140,12 L160,2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              <path d="M0,34 L25,30 L45,26 L70,16 L95,22 L115,10 L140,12 L160,2 L160,36 L0,36 Z" fill="currentColor" fillOpacity="0.1" />
            </svg>
          </div>
        </div>

        {/* Published & Indexed */}
        <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 text-[#475569] font-mono text-[11px] uppercase">
            <span>Published &amp; Indexed</span>
            <Globe className="h-4 w-4" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-sans font-bold text-3xl text-white">
              {metrics.publishedCount}
            </span>
            <span className="font-mono text-[11px] text-[#94A3B8]">
              Public Access
            </span>
          </div>
          <div className="w-full h-8">
            <svg className="w-full h-full text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 160 36">
              <path d="M0,22 L30,20 L60,21 L90,14 L120,16 L140,12 L160,10" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              <path d="M0,22 L30,20 L60,21 L90,14 L120,16 L140,12 L160,10 L160,36 L0,36 Z" fill="currentColor" fillOpacity="0.08" />
            </svg>
          </div>
        </div>

        {/* Drafts in Progress */}
        <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 text-[#475569] font-mono text-[11px] uppercase">
            <span>Drafts in Progress</span>
            <Edit className="h-4 w-4" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-sans font-bold text-3xl text-white">
              {metrics.draftCount}
            </span>
            <span className="font-mono text-[11px] text-amber-400">
              Unpublished
            </span>
          </div>
          <div className="w-full h-8">
            <svg className="w-full h-full text-[#475569]" fill="none" preserveAspectRatio="none" viewBox="0 0 160 36">
              <path d="M0,18 L35,22 L70,16 L105,25 L135,18 L160,20" stroke="currentColor" strokeDasharray="3 3" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Writeups Management Section */}
      <div className="flex flex-col gap-4 bg-[#12151C] border border-[#242936] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#242936]">
          <h2 className="font-sans font-bold text-lg text-white">
            Your Writeups &amp; Drafts ({writeups.length})
          </h2>
          <Link
            href="/dashboard/writeups"
            className="text-xs font-mono text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {writeups.length > 0 ? (
          <div className="flex flex-col divide-y divide-[#242936]">
            {writeups.map((w) => {
              const categoryStyle = getCategoryColor(w.category);
              const readUrl = `/w/${username}/${w.slug}`;

              return (
                <div
                  key={w.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: categoryStyle.bg,
                          borderColor: categoryStyle.border,
                          color: categoryStyle.color,
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

                      <span className="font-mono text-[11px] text-[#475569]">
                        {w.ctfName}
                      </span>
                    </div>

                    <Link
                      href={readUrl}
                      className="font-sans font-bold text-sm text-white hover:text-primary transition-colors truncate"
                    >
                      {w.title}
                    </Link>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-[#475569]">
                      <span>{w.viewCount} views</span>
                      <span>•</span>
                      <span>{w.readTimeMin}m read</span>
                      <span>•</span>
                      <span>Updated {formatDate(w.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/write/${w.id}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs font-mono h-8 gap-1"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                    </Link>

                    <Link href={readUrl} target="_blank">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-mono h-8 gap-1"
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
          <div className="p-8 text-center text-[#94A3B8]">
            <p className="font-sans text-xs mb-3">
              You haven&apos;t written any walkthroughs yet.
            </p>
            <Link href="/write">
              <Button size="sm" className="gradient-cta text-[#0B0D12] text-xs font-mono font-bold">
                Create First Writeup
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

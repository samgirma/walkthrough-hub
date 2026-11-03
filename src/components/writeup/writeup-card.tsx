import React from "react";
import Link from "next/link";
import { Eye, Clock, ShieldCheck, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCompactNumber, getCategoryColor, getDifficultyColor } from "@/lib/utils";
import { CategoryType, DifficultyType, StatusType } from "@/types";

interface WriteupCardProps {
  writeup: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    ctfName: string;
    ctfYear: number;
    category: CategoryType | string;
    difficulty: DifficultyType | string;
    status: StatusType | string;
    viewCount: number;
    readTimeMin: number;
    publishedAt?: Date | string | null;
    author: {
      username: string;
      avatarUrl?: string | null;
    };
    tags?: {
      tag: {
        id: string;
        name: string;
      };
    }[];
  };
}

export function WriteupCard({ writeup }: WriteupCardProps) {
  const categoryStyle = getCategoryColor(writeup.category);
  const difficultyStyle = getDifficultyColor(writeup.difficulty);
  const readUrl = `/w/${writeup.author.username}/${writeup.slug}`;

  return (
    <article className="card-cyber relative flex flex-col justify-between p-5 rounded-xl border border-[#242936] bg-[#12151C] hover:border-[#363E52] transition-all duration-200 group">
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span
              className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded border"
              style={{
                backgroundColor: categoryStyle.bg,
                borderColor: categoryStyle.border,
                color: categoryStyle.color,
              }}
            >
              {writeup.category}
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#BACAC1] px-2 py-0.5 rounded bg-[#181C25] border border-[#242936]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${difficultyStyle.dot}`}
              />
              <span className="capitalize">{writeup.difficulty.toLowerCase()}</span>
            </span>
          </div>

          <span className="font-mono text-[11px] text-[#94A3B8] truncate max-w-[140px]">
            {writeup.ctfName} &apos;{String(writeup.ctfYear).slice(-2)}
          </span>
        </div>

        {/* Title */}
        <Link href={readUrl} className="block group-hover:text-[#50F0BB] transition-colors">
          <h3 className="font-sans font-bold text-base text-white tracking-tight leading-snug line-clamp-2 mb-2">
            {writeup.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="font-sans text-xs text-[#94A3B8] line-clamp-2 leading-relaxed mb-4">
          {writeup.excerpt}
        </p>
      </div>

      {/* Bottom Metadata Strip */}
      <div className="pt-3 border-t border-[#242936]/60 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
        {/* Author Handle */}
        <Link
          href={`/u/${writeup.author.username}`}
          className="flex items-center gap-2 hover:text-white transition-colors"
        >
          {writeup.author.avatarUrl ? (
            <img
              src={writeup.author.avatarUrl}
              alt={writeup.author.username}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-[10px]">
              {writeup.author.username[0].toUpperCase()}
            </div>
          )}
          <span className="truncate max-w-[100px]">@{writeup.author.username}</span>
        </Link>

        {/* Views & Read Time */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title={`${writeup.viewCount} views`}>
            <Eye className="h-3.5 w-3.5 text-[#475569]" />
            <span>{formatCompactNumber(writeup.viewCount)}</span>
          </span>
          <span className="flex items-center gap-1" title={`${writeup.readTimeMin} min read`}>
            <Clock className="h-3.5 w-3.5 text-[#475569]" />
            <span>{writeup.readTimeMin}m</span>
          </span>
        </div>
      </div>
    </article>
  );
}

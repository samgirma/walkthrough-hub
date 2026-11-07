import React from "react";
import Image from "next/image";
import { Eye, Clock } from "lucide-react";
import { formatCompactNumber, getCategoryColor, getDifficultyColor } from "@/lib/utils";
import { CategoryType, DifficultyType, StatusType } from "@/types";
import { CardLink } from "./card-link";

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
      username: string | null;
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
  const authorHandle = writeup.author.username || "anonymous";
  const readUrl = `/w/${authorHandle}/${writeup.slug}`;

  return (
    <article className="card-cyber relative flex flex-col justify-between p-5 rounded-xl border border-[#242936] bg-[#12151C]/80 backdrop-blur-md hover:border-[#363E52] hover:bg-[#181C25]/85 transition-all duration-200 group">
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
        <CardLink href={readUrl} className="block group-hover:text-[#50F0BB] transition-colors">
          <h3 className="font-sans font-bold text-base text-white tracking-tight leading-snug line-clamp-2 mb-2">
            {writeup.title}
          </h3>
        </CardLink>

        {/* Excerpt */}
        <p className="font-sans text-xs text-[#94A3B8] line-clamp-2 leading-relaxed mb-3">
          {writeup.excerpt}
        </p>

        {/* Tags */}
        {writeup.tags && writeup.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {writeup.tags.slice(0, 3).map((item) => (
              <span
                key={item.tag.id}
                className="font-mono text-[10px] text-[#94A3B8] bg-[#181C25] px-1.5 py-0.5 rounded border border-[#242936]"
              >
                #{item.tag.name}
              </span>
            ))}
            {writeup.tags.length > 3 && (
              <span className="font-mono text-[10px] text-[#94A3B8] px-1 py-0.5">
                +{writeup.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between pt-3 border-t border-[#242936]/60 text-xs text-[#94A3B8] font-mono">
        <CardLink
          href={`/u/${authorHandle}`}
          className="flex items-center gap-2 hover:text-white transition-colors"
        >
          {writeup.author.avatarUrl ? (
            <Image
              src={writeup.author.avatarUrl}
              alt={authorHandle}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover border border-[#242936]"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#242936] text-[10px] flex items-center justify-center font-bold text-[#22D3A0]">
              {authorHandle[0].toUpperCase()}
            </div>
          )}
          <span className="truncate max-w-[100px]">@{authorHandle}</span>
        </CardLink>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Views">
            <Eye className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{formatCompactNumber(writeup.viewCount)}</span>
          </span>

          <span className="flex items-center gap-1" title="Read time">
            <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{writeup.readTimeMin}m</span>
          </span>
        </div>
      </div>
    </article>
  );
}

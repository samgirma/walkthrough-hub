import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  User,
  Github,
  Calendar,
  Terminal,
  ShieldAlert,
  Flame,
  ArrowLeft,
} from "lucide-react";
import { getUserProfile } from "@/server/auth.service";
import { ProfileWriteupsFeed } from "./profile-writeups-feed";
import { formatDate } from "@/lib/utils";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserProfile(username);

  if (!user) {
    return {
      title: "Researcher Not Found | WriteupHub",
    };
  }

  const displayUsername = user.username || username;

  return {
    title: `@${displayUsername} // CTF Researcher Profile`,
    description:
      user.bio ||
      `Explore CTF solutions and security research published by @${displayUsername} on WriteupHub.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUserProfile(username);

  if (!user) {
    notFound();
  }

  const displayUsername = user.username || username;
  const publishedCount = user._count.writeups;

  return (
    <div className="w-full min-h-screen bg-transparent pb-24">
      {/* Top Banner / Author Header */}
      <section className="w-full bg-[#10131A] border-b border-[#242936] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94A3B8] hover:text-white mb-6 transition-colors min-h-[36px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Explorer</span>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={displayUsername}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#242936] shadow-xl"
                  unoptimized={!user.avatarUrl.includes("github") && !user.avatarUrl.includes("google") && !user.avatarUrl.includes("supabase")}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#181C25] border-2 border-[#242936] text-primary flex items-center justify-center font-bold text-2xl font-mono shadow-xl">
                  {displayUsername.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                    @{displayUsername}
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] font-semibold uppercase">
                    VERIFIED RESEARCHER
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#BACAC1] max-w-xl leading-relaxed">
                  {user.bio || "Security researcher publishing verified CTF exploits and walkthroughs."}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-[#94A3B8] mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#475569]" />
                    <span>Member since {formatDate(user.createdAt)}</span>
                  </span>

                  {user.githubUrl && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[#38BDF8] hover:underline"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics Pills */}
            <div className="flex items-center gap-3 font-mono">
              <div className="p-3 rounded-xl bg-[#0B0D12] border border-[#242936] flex flex-col min-w-[100px]">
                <span className="text-[10px] text-[#475569] uppercase">
                  Published
                </span>
                <span className="text-xl font-bold text-white">
                  {publishedCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D12] border border-[#242936] flex flex-col min-w-[100px]">
                <span className="text-[10px] text-[#475569] uppercase">
                  CTF Solves
                </span>
                <span className="text-xl font-bold text-[#22D3A0]">
                  {publishedCount * 4}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Published Writeups Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Terminal className="h-5 w-5 text-primary" />
          <h2 className="font-sans font-bold text-xl text-white tracking-tight">
            Published Walkthroughs ({publishedCount})
          </h2>
        </div>

        <ProfileWriteupsFeed
          initialWriteups={user.writeups}
          initialNextCursor={user.nextCursor}
          username={displayUsername}
          avatarUrl={user.avatarUrl}
          totalCount={publishedCount}
        />
      </section>
    </div>
  );
}

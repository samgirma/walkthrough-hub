import React from "react";
import { Metadata } from "next";
import { Calendar, Radio, Trophy, Shield } from "lucide-react";
import { getActiveEvents } from "@/server/event.service";
import { EventsFeedClient } from "./events-feed-client";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60; // Auto-revalidates every 60s for timely expiration

export const metadata: Metadata = buildMetadata({
  title: "Global CTF Events & Hackathons — Live Competitions",
  description:
    "Track active and upcoming global Capture The Flag tournaments, cybersecurity hackathons, and security wargames with verified deadlines.",
  canonicalPath: "/events",
  noindex: false,
  nofollow: false,
});

export default async function EventsPage() {
  const events = await getActiveEvents().catch((err) => {
    console.error("[EventsPage] Failed to load events:", err);
    return [];
  });

  return (
    <div className="flex flex-col w-full min-h-screen pb-24 bg-transparent">
      {/* Header Section */}
      <section className="w-full bg-[#0B0D12]/90 backdrop-blur-xl border-b border-[#242936] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181C25] border border-[#242936] font-mono text-[11px] text-[#22D3A0]">
                <Radio className="h-3.5 w-3.5 animate-pulse text-[#22D3A0]" />
                <span>WORLDWIDE COMPETITIONS & HACKATHONS</span>
              </div>
              <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white tracking-tight">
                Global CTF Tournaments &{" "}
                <span className="bg-gradient-to-r from-[#22D3A0] via-[#50F0BB] to-[#38BDF8] bg-clip-text text-transparent">
                  Hackathons
                </span>
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Discover upcoming and live attack-defense competitions, college tournaments, and offensive security hackathons. Signed-in researchers can publish competitions with automatic day-end expiration.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="shrink-0 p-4 rounded-2xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] flex items-center gap-5 self-start md:self-auto">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#475569] uppercase tracking-wider">
                  Active Directory
                </span>
                <span className="font-mono text-sm font-bold text-[#22D3A0]">
                  {events.length} Live Competitions
                </span>
              </div>
              <div className="w-[1px] h-8 bg-[#242936]" />
              <div className="flex items-center gap-2 text-xs font-mono text-[#BACAC1]">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Auto-Pruned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-1">
        <EventsFeedClient initialEvents={events} />
      </div>
    </div>
  );
}

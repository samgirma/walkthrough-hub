import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Layers, Trophy, Hash, ArrowRight } from "lucide-react";
import { getAllHubSummaries } from "@/server/hub.service";
import { getCategoryHubInfo } from "@/config/hubs";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/config/site";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Browse CTF Writeups by Category, Competition & Tag",
  description:
    "Explore the complete index of CTF challenges, reverse engineering guides, and exploit walkthroughs organized by category, event, and technique.",
  canonicalPath: "/browse",
  noindex: false,
  nofollow: false,
});

export default async function BrowsePage() {
  const summaries = await getAllHubSummaries();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Browse Directory",
        item: `${SITE_URL}/browse`,
      },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-transparent pb-24">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Header Section */}
      <header className="w-full bg-[#10131A] border-b border-[#242936] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-6"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-[#3A4252]">/</span>
            <span className="text-white font-semibold">Browse Directory</span>
          </nav>

          <div className="flex flex-col gap-3 max-w-3xl">
            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Directory &amp; Research Hubs
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#BACAC1] leading-relaxed">
              Explore competitive security research and offensive solutions categorized by
              technical discipline, tournament archive, and vulnerability primitive.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* 1. Categories Section */}
        <section aria-labelledby="heading-categories">
          <div className="flex items-center gap-2.5 mb-6">
            <Layers className="h-5 w-5 text-[#22D3A0]" />
            <h2 id="heading-categories" className="font-sans font-bold text-2xl text-white tracking-tight">
              Browse by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {summaries.categories.map((cat) => {
              const info = getCategoryHubInfo(cat.category);
              return (
                <Link
                  key={cat.category}
                  href={`/category/${cat.category.toLowerCase()}`}
                  className="group p-5 rounded-xl border border-[#242936] bg-[#12151C] hover:border-[#22D3A0]/60 transition-all flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#22D3A0] uppercase tracking-wider">
                        {cat.category}
                      </span>
                      <span className="font-mono text-[11px] text-[#94A3B8] bg-[#181C25] px-2 py-0.5 rounded border border-[#242936]">
                        {cat.count} {cat.count === 1 ? "Writeup" : "Writeups"}
                      </span>
                    </div>
                    <span className="font-sans font-bold text-base text-white group-hover:text-[#22D3A0] transition-colors">
                      {info.title}
                    </span>
                    <p className="font-sans text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {info.tagline}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono text-[#BACAC1] group-hover:text-white pt-2 border-t border-[#242936]/40">
                    <span>Explore Archive</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-[#22D3A0]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 2. CTF Events Section */}
        <section aria-labelledby="heading-ctfs">
          <div className="flex items-center gap-2.5 mb-6">
            <Trophy className="h-5 w-5 text-[#38BDF8]" />
            <h2 id="heading-ctfs" className="font-sans font-bold text-2xl text-white tracking-tight">
              Browse by CTF Competition
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {summaries.ctfs.map((ctf) => (
              <Link
                key={ctf.slug}
                href={`/ctf/${ctf.slug}`}
                className="group p-4 rounded-xl border border-[#242936] bg-[#12151C] hover:border-[#38BDF8]/60 transition-all flex flex-col justify-between gap-2 shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-sans font-bold text-sm text-white group-hover:text-[#38BDF8] transition-colors truncate">
                    {ctf.name}
                  </span>
                  <span className="font-mono text-xs text-[#475569]">
                    &apos;{String(ctf.year).slice(-2)}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#94A3B8]">
                  {ctf.count} {ctf.count === 1 ? "Solve" : "Solves"}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Tags Section */}
        <section aria-labelledby="heading-tags">
          <div className="flex items-center gap-2.5 mb-6">
            <Hash className="h-5 w-5 text-primary" />
            <h2 id="heading-tags" className="font-sans font-bold text-2xl text-white tracking-tight">
              Browse by Topic &amp; Primitive
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {summaries.tags.map((tag) => (
              <Link
                key={tag.name}
                href={`/tag/${encodeURIComponent(tag.name)}`}
                className="group px-3 py-1.5 rounded-lg border border-[#242936] bg-[#12151C] hover:border-primary/60 transition-colors flex items-center gap-2 text-xs font-mono text-[#BACAC1] hover:text-white"
              >
                <span>#{tag.name}</span>
                <span className="text-[10px] text-[#475569] group-hover:text-primary">
                  {tag.count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

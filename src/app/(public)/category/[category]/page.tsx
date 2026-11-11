import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Terminal, Layers } from "lucide-react";
import { WriteupCard } from "@/components/writeup/writeup-card";
import { getCategoryHub } from "@/server/hub.service";
import { getCategoryHubInfo } from "@/config/hubs";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL, SITE_NAME, SEO_THRESHOLDS } from "@/config/site";
import { Category } from "@prisma/client";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 300;
export const dynamicParams = true;

const VALID_CATEGORIES = ["web", "pwn", "crypto", "reverse", "forensics", "misc", "osint"];

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const sParams = await searchParams;
  const cleanCat = category.toLowerCase();

  if (!VALID_CATEGORIES.includes(cleanCat)) {
    return buildMetadata({ title: "Category Not Found", noindex: true });
  }

  const hubInfo = getCategoryHubInfo(cleanCat);
  const page = parseInt(sParams.page || "1", 10) || 1;
  const data = await getCategoryHub(cleanCat, page, 12);

  const isIndexable = data.indexableCount >= SEO_THRESHOLDS.MIN_HUB_WRITEUPS;
  const canonicalPath = page > 1 ? `/category/${cleanCat}?page=${page}` : `/category/${cleanCat}`;

  const title =
    page > 1
      ? `${cleanCat.toUpperCase()} CTF Walkthroughs - Page ${page}`
      : `${hubInfo.title} | ${SITE_NAME}`;

  return buildMetadata({
    title,
    description: hubInfo.description,
    canonicalPath,
    noindex: !isIndexable,
    nofollow: false,
    ogType: "website",
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const sParams = await searchParams;
  const cleanCat = category.toLowerCase();

  if (!VALID_CATEGORIES.includes(cleanCat)) {
    notFound();
  }

  const page = parseInt(sParams.page || "1", 10) || 1;
  const data = await getCategoryHub(cleanCat, page, 12);
  const hubInfo = getCategoryHubInfo(cleanCat);
  const canonicalUrl = `${SITE_URL}/category/${cleanCat}`;

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
        name: "Categories",
        item: `${SITE_URL}/browse`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cleanCat.toUpperCase(),
        item: canonicalUrl,
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

      {/* Header Hub Section */}
      <header className="w-full bg-[#10131A] border-b border-[#242936] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-6"
          >
            <Link href="/browse" className="hover:text-white transition-colors">
              Browse Directory
            </Link>
            <span className="text-[#3A4252]">/</span>
            <span className="text-white font-semibold">{cleanCat.toUpperCase()}</span>
          </nav>

          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-[#22D3A0]/10 border border-[#22D3A0]/30 text-[#22D3A0] font-mono text-xs font-bold uppercase tracking-wider">
                CATEGORY ARCHIVE
              </span>
              <span className="font-mono text-xs text-[#94A3B8]">
                {data.totalCount} {data.totalCount === 1 ? "Writeup" : "Writeups"}
              </span>
            </div>

            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              {hubInfo.title}
            </h1>

            <p className="font-sans text-sm sm:text-base text-[#BACAC1] leading-relaxed">
              {hubInfo.description}
            </p>
          </div>
        </div>
      </header>

      {/* Main Grid Feed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {data.writeups.length === 0 ? (
          <div className="p-12 text-center border border-[#242936] rounded-xl bg-[#12151C] text-[#94A3B8] font-mono text-sm">
            <p>No writeups published in this category yet.</p>
            <Link
              href="/write"
              className="mt-4 inline-block px-4 py-2 bg-[#22D3A0] text-[#0B0D12] font-bold rounded-lg hover:bg-[#50F0BB] transition-colors"
            >
              Publish the First Solution
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.writeups.map((writeup) => (
              <WriteupCard key={writeup.id} writeup={writeup} />
            ))}
          </div>
        )}

        {/* Real Crawlable HTML Pagination */}
        {data.totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex items-center justify-center gap-2 mt-12 font-mono text-xs"
          >
            {data.hasPrev && (
              <Link
                href={`/category/${cleanCat}?page=${data.page - 1}`}
                className="px-3 py-2 rounded-lg border border-[#242936] bg-[#12151C] text-[#BACAC1] hover:text-white hover:border-[#22D3A0] transition-colors flex items-center gap-1 min-h-[40px]"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Link>
            )}

            <span className="px-4 py-2 rounded-lg border border-[#242936] bg-[#0B0D12] text-[#94A3B8]">
              Page {data.page} of {data.totalPages}
            </span>

            {data.hasNext && (
              <Link
                href={`/category/${cleanCat}?page=${data.page + 1}`}
                className="px-3 py-2 rounded-lg border border-[#242936] bg-[#12151C] text-[#BACAC1] hover:text-white hover:border-[#22D3A0] transition-colors flex items-center gap-1 min-h-[40px]"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}

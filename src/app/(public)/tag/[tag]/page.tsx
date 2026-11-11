import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { WriteupCard } from "@/components/writeup/writeup-card";
import { getTagHub } from "@/server/hub.service";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL, SITE_NAME, SEO_THRESHOLDS } from "@/config/site";

interface TagPageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({
  params,
  searchParams,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const sParams = await searchParams;
  const page = parseInt(sParams.page || "1", 10) || 1;

  const data = await getTagHub(tag, page, 12);
  if (data.totalCount === 0) {
    return buildMetadata({ title: "Tag Not Found", noindex: true });
  }

  const isIndexable = data.indexableCount >= SEO_THRESHOLDS.MIN_HUB_WRITEUPS;
  const canonicalPath = page > 1 ? `/tag/${tag}?page=${page}` : `/tag/${tag}`;

  const title =
    page > 1
      ? `#${data.tagName} Writeups - Page ${page}`
      : `#${data.tagName} CTF Exploits & Research | ${SITE_NAME}`;

  const description = `Offensive security writeups, exploit code, and challenge walkthoughs tagged #${data.tagName}.`;

  return buildMetadata({
    title,
    description,
    canonicalPath,
    noindex: !isIndexable,
    nofollow: false,
    ogType: "website",
  });
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  const sParams = await searchParams;
  const page = parseInt(sParams.page || "1", 10) || 1;

  const data = await getTagHub(tag, page, 12);
  if (data.totalCount === 0) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/tag/${tag}`;

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
        name: "Tags",
        item: `${SITE_URL}/browse`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `#${data.tagName}`,
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
            <span className="text-white font-semibold">#{data.tagName}</span>
          </nav>

          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                <span>TAG REPOSITORY</span>
              </span>
              <span className="font-mono text-xs text-[#94A3B8]">
                {data.totalCount} {data.totalCount === 1 ? "Writeup" : "Writeups"}
              </span>
            </div>

            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              #{data.tagName} Research &amp; Solves
            </h1>

            <p className="font-sans text-sm sm:text-base text-[#BACAC1] leading-relaxed">
              Dissect community solutions, technique writeups, and challenges tagged with #{data.tagName}.
            </p>
          </div>
        </div>
      </header>

      {/* Main Grid Feed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.writeups.map((writeup) => (
            <WriteupCard key={writeup.id} writeup={writeup} />
          ))}
        </div>

        {/* Real Crawlable HTML Pagination */}
        {data.totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex items-center justify-center gap-2 mt-12 font-mono text-xs"
          >
            {data.hasPrev && (
              <Link
                href={`/tag/${tag}?page=${data.page - 1}`}
                className="px-3 py-2 rounded-lg border border-[#242936] bg-[#12151C] text-[#BACAC1] hover:text-white hover:border-primary transition-colors flex items-center gap-1 min-h-[40px]"
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
                href={`/tag/${tag}?page=${data.page + 1}`}
                className="px-3 py-2 rounded-lg border border-[#242936] bg-[#12151C] text-[#BACAC1] hover:text-white hover:border-primary transition-colors flex items-center gap-1 min-h-[40px]"
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

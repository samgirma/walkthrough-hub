import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { WriteupCard } from "@/components/writeup/writeup-card";
import { getCtfHub } from "@/server/hub.service";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL, SITE_NAME, SEO_THRESHOLDS } from "@/config/site";
import { prisma } from "@/lib/prisma";

interface CtfPageProps {
  params: Promise<{ event: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({
  params,
  searchParams,
}: CtfPageProps): Promise<Metadata> {
  const { event } = await params;
  const sParams = await searchParams;
  const page = parseInt(sParams.page || "1", 10) || 1;

  const data = await getCtfHub(event, page, 12);
  if (data.totalCount === 0) {
    // Check if event is a writeup ID
    const writeup = await prisma.writeup.findUnique({
      where: { id: event },
      select: { id: true, status: true, author: { select: { username: true } } },
    });
    if (writeup && writeup.status !== "DRAFT" && writeup.author.username) {
      permanentRedirect(`/w/${writeup.author.username}/${writeup.id}`);
    }
    return buildMetadata({ title: "CTF Event Not Found", noindex: true });
  }

  const isIndexable = data.indexableCount >= SEO_THRESHOLDS.MIN_HUB_WRITEUPS;
  const canonicalPath = page > 1 ? `/ctf/${event}?page=${page}` : `/ctf/${event}`;

  const eventLabel = data.ctfYear ? `${data.ctfName} ${data.ctfYear}` : data.ctfName;
  const title =
    page > 1
      ? `${eventLabel} Solutions - Page ${page}`
      : `${eventLabel} CTF Writeups & Exploit Archive | ${SITE_NAME}`;

  const description = `Verified solutions, decompilations, and exploit proofs-of-concept for challenges from ${eventLabel}.`;

  return buildMetadata({
    title,
    description,
    canonicalPath,
    noindex: !isIndexable,
    nofollow: false,
    ogType: "website",
  });
}

export default async function CtfEventPage({ params, searchParams }: CtfPageProps) {
  const { event } = await params;
  const sParams = await searchParams;
  const page = parseInt(sParams.page || "1", 10) || 1;

  const data = await getCtfHub(event, page, 12);
  if (data.totalCount === 0) {
    // Check if event is a writeup ID
    const writeup = await prisma.writeup.findUnique({
      where: { id: event },
      select: { id: true, status: true, author: { select: { username: true } } },
    });
    if (writeup && writeup.status !== "DRAFT" && writeup.author.username) {
      permanentRedirect(`/w/${writeup.author.username}/${writeup.id}`);
    }
    notFound();
  }

  const eventLabel = data.ctfYear ? `${data.ctfName} ${data.ctfYear}` : data.ctfName;
  const canonicalUrl = `${SITE_URL}/ctf/${event}`;

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
        name: "CTF Archive",
        item: `${SITE_URL}/browse`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: eventLabel,
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
            <span className="text-white font-semibold">{eventLabel}</span>
          </nav>

          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                <span>CTF COMPETITION</span>
              </span>
              <span className="font-mono text-xs text-[#94A3B8]">
                {data.totalCount} {data.totalCount === 1 ? "Writeup" : "Writeups"}
              </span>
            </div>

            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              {eventLabel} Walkthroughs
            </h1>

            <p className="font-sans text-sm sm:text-base text-[#BACAC1] leading-relaxed">
              Dissect community solutions, solve scripts, and exploit primitives from{" "}
              {eventLabel}.
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
                href={`/ctf/${event}?page=${data.page - 1}`}
                className="px-3 py-2 rounded-lg border border-[#242936] bg-[#12151C] text-[#BACAC1] hover:text-white hover:border-[#38BDF8] transition-colors flex items-center gap-1 min-h-[40px]"
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
                href={`/ctf/${event}?page=${data.page + 1}`}
                className="px-3 py-2 rounded-lg border border-[#242936] bg-[#12151C] text-[#BACAC1] hover:text-white hover:border-[#38BDF8] transition-colors flex items-center gap-1 min-h-[40px]"
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

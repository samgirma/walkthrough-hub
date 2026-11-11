import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  FolderTree,
  ArrowRight,
  Eye,
  Layers,
  Terminal,
  Shield,
  Lock,
  Cpu,
  Search,
  Sparkles,
  Globe,
} from "lucide-react";
import { getCategoriesOverview } from "@/server/hub.service";
import { getCategoryHubInfo } from "@/config/hubs";
import { buildMetadata } from "@/lib/seo";
import { formatCompactNumber, getCategoryColor } from "@/lib/utils";
import { SITE_URL } from "@/config/site";

export const revalidate = 300; // Static ISR with 5-minute background revalidation

export const metadata: Metadata = buildMetadata({
  title: "CTF Categories — Web, Pwn, Crypto, Reverse & Forensics",
  description:
    "Browse CTF writeups and exploit walkthroughs organized by technical category: Web, Binary Exploitation (Pwn), Cryptography, Reverse Engineering, Forensics, Misc, and OSINT.",
  canonicalPath: "/categories",
  noindex: false,
  nofollow: false,
});

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  WEB: Globe,
  PWN: Terminal,
  CRYPTO: Lock,
  REVERSE: Cpu,
  FORENSICS: Search,
  MISC: Sparkles,
  OSINT: Shield,
};

export default async function CategoriesPage() {
  const { categories, totalPublic } = await getCategoriesOverview();

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
        item: `${SITE_URL}/categories`,
      },
    ],
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-24 bg-transparent">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Header Section */}
      <section className="w-full bg-[#0B0D12]/90 backdrop-blur-xl border-b border-[#242936] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181C25] border border-[#242936] font-mono text-[11px] text-[#22D3A0]">
                <FolderTree className="h-3.5 w-3.5" />
                <span>7 TECHNICAL CTF DISCIPLINES</span>
              </div>
              <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white tracking-tight">
                CTF Challenge{" "}
                <span className="bg-gradient-to-r from-[#22D3A0] via-[#50F0BB] to-[#38BDF8] bg-clip-text text-transparent">
                  Categories
                </span>
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Explore Capture The Flag walkthroughs and vulnerability analysis grouped by offensive domain—from web protocol abuse and kernel memory corruption to lattice cryptanalysis.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="shrink-0 p-4 rounded-2xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] flex items-center gap-5 self-start md:self-auto">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#475569] uppercase tracking-wider">
                  Indexed Archive
                </span>
                <span className="font-mono text-sm font-bold text-[#22D3A0]">
                  {totalPublic} {totalPublic === 1 ? "Writeup" : "Writeups"}
                </span>
              </div>
              <div className="w-[1px] h-8 bg-[#242936]" />
              <Link
                href="/browse"
                className="flex items-center gap-1.5 text-xs font-mono text-[#BACAC1] hover:text-white transition-colors"
              >
                <Layers className="h-4 w-4 text-[#38BDF8]" />
                <span>Full Directory</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((item) => {
            const catLower = item.category.toLowerCase();
            const info = getCategoryHubInfo(catLower);
            const style = getCategoryColor(item.category);
            const Icon = CATEGORY_ICONS[item.category] || Terminal;

            return (
              <article
                key={item.category}
                className="card-cyber flex flex-col justify-between p-5 sm:p-6 rounded-xl border border-[#242936] bg-[#12151C]/85 backdrop-blur-md hover:border-[#363E52] transition-all duration-200 group"
              >
                <div>
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: style.bg,
                          borderColor: style.border,
                          color: style.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className="font-mono text-xs font-bold uppercase tracking-wider"
                        style={{ color: style.color }}
                      >
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#94A3B8]">
                      {item.totalViews > 0 && (
                        <span className="inline-flex items-center gap-1 text-[#64748B]">
                          <Eye className="h-3 w-3" />
                          <span>{formatCompactNumber(item.totalViews)}</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-[#181C25] border border-[#242936] text-[#BACAC1]">
                        {item.count} {item.count === 1 ? "Writeup" : "Writeups"}
                      </span>
                    </div>
                  </div>

                  {/* Category Title & Description */}
                  <Link href={`/category/${catLower}`} className="block mb-2">
                    <h2 className="font-sans font-bold text-lg text-white group-hover:text-[#50F0BB] transition-colors tracking-tight">
                      {info.title}
                    </h2>
                  </Link>
                  <p className="font-sans text-xs text-[#94A3B8] leading-relaxed mb-4 line-clamp-2">
                    {info.description}
                  </p>

                  {/* Top Featured Writeups inside this Category */}
                  {item.recentWriteups.length > 0 ? (
                    <div className="space-y-2 mb-4 pt-3 border-t border-[#242936]/60">
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                        Featured Walkthroughs
                      </span>
                      <ul className="space-y-1.5">
                        {item.recentWriteups.map((w) => (
                          <li key={w.id}>
                            <Link
                              href={`/w/${w.authorUsername}/${w.id}`}
                              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0B0D12]/80 border border-[#242936]/70 hover:border-[#22D3A0]/50 text-xs transition-colors"
                            >
                              <span className="font-sans font-medium text-[#E0E2EC] hover:text-[#50F0BB] truncate">
                                {w.title}
                              </span>
                              <span className="font-mono text-[10px] text-[#64748B] shrink-0">
                                {w.ctfName}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="mb-4 pt-3 border-t border-[#242936]/60 font-mono text-[11px] text-[#64748B]">
                      No verified writeups published yet in {item.category}.
                    </div>
                  )}
                </div>

                {/* Footer Action Links */}
                <div className="pt-3 border-t border-[#242936]/60 flex items-center justify-between gap-3 text-xs font-mono">
                  <Link
                    href={`/category/${catLower}`}
                    className="inline-flex items-center gap-1.5 font-semibold hover:underline transition-colors"
                    style={{ color: style.color }}
                  >
                    <span>View {item.category} Archive</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href={`/explore?category=${item.category}`}
                    className="text-[#94A3B8] hover:text-white transition-colors"
                  >
                    Filter Feed
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

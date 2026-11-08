import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ShieldAlert,
  Flame,
  Search,
  ExternalLink,
  Activity,
  Layers,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { getRecentCves, getKevVulnerabilities } from "@/server/cve.service";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/config/site";

// Phase 1: Static ISR with 30-minute background revalidation
export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "CVE Directory // Exploited Vulnerabilities & PoC Archive",
  description:
    "Track active zero-day vulnerabilities, CISA KEV catalog exploits, EPSS threat scores, and verified community CTF walkthroughs.",
  canonicalPath: "/cves",
  noindex: false,
  nofollow: false,
});

export default async function CvesDirectoryPage() {
  const [cves, kevList] = await Promise.all([
    getRecentCves(),
    getKevVulnerabilities(),
  ]);

  const kevCount = kevList.length;

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
        name: "CVE Intelligence",
        item: `${SITE_URL}/cves`,
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
      {/* Header Banner */}
      <section className="w-full bg-[#10131A] border-b border-[#242936] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs w-fit">
                <Flame className="h-3.5 w-3.5" />
                <span>THREAT INTELLIGENCE &amp; CVE REPOSITORY</span>
              </div>
              <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Vulnerability Directory
              </h1>
              <p className="font-sans text-sm text-[#BACAC1] max-w-2xl leading-relaxed">
                Correlated intelligence from the CISA Known Exploited Vulnerabilities (KEV)
                catalog, FIRST.org EPSS exploit prediction metrics, and peer-reviewed WriteupHub
                walkthroughs.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-[#181C25] p-4 rounded-xl border border-[#242936] font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-[#475569] text-[10px] uppercase">
                  CISA KEV Monitored
                </span>
                <span className="text-xl font-bold text-rose-400">
                  {kevCount}+ Active
                </span>
              </div>
              <div className="h-8 w-px bg-[#242936]" />
              <div className="flex flex-col">
                <span className="text-[#475569] text-[10px] uppercase">
                  Cache Policy
                </span>
                <span className="text-xl font-bold text-[#22D3A0]">
                  30m ISR
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main CVE Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cves.map((cve) => {
            const isCritical = cve.severity === "CRITICAL";
            return (
              <div
                key={cve.cveId}
                className="p-5 rounded-xl border border-[#242936] bg-[#12151C]/90 hover:border-[#363E52] hover:bg-[#181C25] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-sm font-bold text-white group-hover:text-[#22D3A0] transition-colors">
                      {cve.cveId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {cve.isKev && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] font-semibold">
                          KEV ACTIVE
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                          isCritical
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        CVSS {cve.cvssScore.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-sans font-bold text-base text-white tracking-tight mb-2 line-clamp-2">
                    {cve.title}
                  </h3>

                  <p className="font-sans text-xs text-[#94A3B8] line-clamp-3 leading-relaxed mb-4">
                    {cve.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#242936]/60 flex items-center justify-between font-mono text-xs text-[#94A3B8]">
                  {cve.epssScore !== undefined && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Activity className="h-3 w-3 text-[#22D3A0]" />
                      <span>EPSS: {(cve.epssScore * 100).toFixed(1)}%</span>
                    </span>
                  )}

                  <Link
                    href={`/cves/${cve.cveId}`}
                    className="ml-auto inline-flex items-center gap-1 text-[#22D3A0] hover:underline"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

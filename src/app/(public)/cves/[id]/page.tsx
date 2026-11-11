import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  ShieldAlert,
  Flame,
  ArrowLeft,
  ExternalLink,
  FileCode,
  CheckCircle,
  Cpu,
  ShieldCheck,
  Bug,
} from "lucide-react";
import { getCveDetails } from "@/server/cve.service";
import { WriteupCard } from "@/components/writeup/writeup-card";
import { CveLinkedText } from "@/components/cve/cve-linked-text";
import { buildMetadata, extractCveIds } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/config/site";

interface CveDetailPageProps {
  params: Promise<{ id: string }>;
}

// Phase 1: Static ISR with 6-hour background revalidation
export const revalidate = 21600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [
    { id: "CVE-2024-21626" },
    { id: "CVE-2024-6387" },
    { id: "CVE-2023-38606" },
    { id: "CVE-2023-4863" },
    { id: "CVE-2024-3094" },
  ];
}

function isCveIndexEligible(cve: Awaited<ReturnType<typeof getCveDetails>>): boolean {
  if (!cve) return false;
  const hasWalkthroughs = Boolean(cve.relatedWriteups && cve.relatedWriteups.length >= 1);
  const hasRemediationOrEnrichment = Boolean(
    cve.isEnriched &&
      (cve.cwes.length > 0 ||
        cve.affectedCpes.length > 0 ||
        cve.mitigationSteps.length > 0 ||
        Boolean(cve.kevEntry?.requiredAction))
  );
  return hasWalkthroughs || hasRemediationOrEnrichment;
}

export async function generateMetadata({
  params,
}: CveDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const cve = await getCveDetails(id);

  if (!cve) {
    return buildMetadata({ title: "CVE Not Found", noindex: true });
  }

  const indexable = isCveIndexEligible(cve);

  return buildMetadata({
    title: `${cve.cveId} - Vulnerability Analysis & Exploit Research`,
    description: cve.description,
    canonicalPath: `/cves/${cve.cveId}`,
    noindex: !indexable,
    nofollow: false,
    ogType: "article",
    ogImage: `/cves/${cve.cveId}/opengraph-image`,
    publishedTime: cve.publishedDate,
    modifiedTime: cve.lastModifiedDate,
    tags: [cve.cveId, cve.severity, ...cve.cwes.map((c) => c.id)],
  });
}

export default async function CveDetailPage({ params }: CveDetailPageProps) {
  const { id } = await params;
  const cve = await getCveDetails(id);

  if (!cve) {
    notFound();
  }

  const isCritical = cve.severity === "CRITICAL";
  const canonicalUrl = `${SITE_URL}/cves/${cve.cveId}`;
  const ogImageUrl = `${SITE_URL}/cves/${cve.cveId}/opengraph-image`;
  const mentionedCves = extractCveIds(
    `${cve.title} ${cve.description} ${cve.mitigationSteps.join(" ")}`
  );
  const keywords = Array.from(
    new Set([
      cve.cveId,
      `${cve.severity} Vulnerability`,
      ...cve.cwes.map((c) => c.id),
      ...cve.affectedCpes.map((c) => `${c.vendor} ${c.product}`),
      ...mentionedCves,
    ])
  );

  const techArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${cve.cveId}: ${cve.title}`,
    description: cve.description,
    image: [ogImageUrl],
    datePublished: cve.publishedDate,
    dateModified: cve.lastModifiedDate,
    keywords,
    about: [
      {
        "@type": "Thing",
        name: cve.cveId,
        sameAs: `https://nvd.nist.gov/vuln/detail/${cve.cveId}`,
      },
      ...cve.cwes.map((cwe) => ({
        "@type": "Thing",
        name: `${cwe.id} (${cwe.name})`,
      })),
      ...cve.affectedCpes.slice(0, 4).map((cpe) => ({
        "@type": "SoftwareApplication",
        name: `${cpe.vendor} ${cpe.product}`,
        softwareVersion: cpe.versionRange,
      })),
    ],
    author: {
      "@type": "Organization",
      name: `${SITE_NAME} Threat Research`,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

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
      {
        "@type": "ListItem",
        position: 3,
        name: cve.cveId,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-transparent pb-24">
      {/* TechArticle & BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([techArticleJsonLd, breadcrumbJsonLd]).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <Link
            href="/cves"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors min-h-[36px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to CVE Directory</span>
          </Link>
          <span className="text-[#3A4252]">/</span>
          <span className="text-white font-semibold">{cve.cveId}</span>
        </nav>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* CVE Header Card */}
        <article className="p-6 sm:p-8 rounded-xl border border-[#242936] bg-[#12151C]/95 backdrop-blur-md shadow-lg">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-mono text-sm sm:text-base font-extrabold text-[#22D3A0]">
              {cve.cveId}
            </span>

            {cve.isKev && (
              <span className="px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-semibold flex items-center gap-1">
                <Flame className="h-3 w-3" />
                <span>CISA KEV CATALOG</span>
              </span>
            )}

            <span
              className={`px-2.5 py-0.5 rounded font-mono text-xs font-semibold ${
                isCritical
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
            >
              CVSS {cve.cvssScore.toFixed(1)} {cve.severity}
            </span>

            {cve.cvssVector && (
              <span className="font-mono text-[11px] text-[#94A3B8] px-2.5 py-0.5 rounded bg-[#0B0D12] border border-[#242936]">
                {cve.cvssVector}
              </span>
            )}
          </div>

          <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-4">
            {cve.title}
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#BACAC1] leading-relaxed mb-6">
            <CveLinkedText text={cve.description} />
          </p>

          {/* Telemetry Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#242936]/60 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#0B0D12] border border-[#242936]">
              <span className="text-[#475569] text-[10px] block uppercase">
                EPSS Exploit Prediction
              </span>
              <span className="text-base font-bold text-[#22D3A0]">
                {cve.epssScore !== null ? `${(cve.epssScore * 100).toFixed(1)}%` : "N/A"}
              </span>
              <span className="text-[10px] text-[#475569] block">
                Percentile: {cve.epssPercentile !== null ? `${(cve.epssPercentile * 100).toFixed(1)}th` : "N/A"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0B0D12] border border-[#242936]">
              <span className="text-[#475569] text-[10px] block uppercase">
                Active Weaponization
              </span>
              <span
                className={`text-base font-bold ${
                  cve.isKev ? "text-rose-400" : "text-[#BACAC1]"
                }`}
              >
                {cve.isKev ? "Exploited in the Wild" : "No Known Campaigns"}
              </span>
              <span className="text-[10px] text-[#475569] block">
                Ransomware: {cve.kevEntry?.knownRansomwareCampaignUse || "None Reported"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0B0D12] border border-[#242936]">
              <span className="text-[#475569] text-[10px] block uppercase">
                Published / Modified
              </span>
              <time dateTime={cve.publishedDate} className="text-base font-bold text-white block">
                {cve.publishedDate}
              </time>
              <span className="text-[10px] text-[#475569] block">
                Updated: {cve.lastModifiedDate}
              </span>
            </div>
          </div>
        </article>

        {/* Technical Enrichment Grid: CWE Breakdown, Affected CPEs, Detection & Mitigation */}
        {(cve.cwes.length > 0 || cve.affectedCpes.length > 0 || cve.mitigationSteps.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CWE Weakness Breakdown */}
            {cve.cwes.length > 0 && (
              <section className="p-6 rounded-xl border border-[#242936] bg-[#12151C]/90 flex flex-col gap-4">
                <h2 className="font-sans font-bold text-lg text-white flex items-center gap-2">
                  <Bug className="h-4 w-4 text-[#38BDF8]" />
                  <span>CWE Weakness Classification</span>
                </h2>
                <div className="flex flex-col gap-3">
                  {cve.cwes.map((cwe) => (
                    <div
                      key={cwe.id}
                      className="p-3.5 rounded-lg bg-[#0B0D12] border border-[#242936]"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#38BDF8]">
                          {cwe.id}
                        </span>
                        <span className="font-sans text-xs font-semibold text-white">
                          {cwe.name}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                        {cwe.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Affected CPE Versions */}
            {cve.affectedCpes.length > 0 && (
              <section className="p-6 rounded-xl border border-[#242936] bg-[#12151C]/90 flex flex-col gap-4">
                <h2 className="font-sans font-bold text-lg text-white flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-amber-400" />
                  <span>Affected Targets &amp; CPE Matrix</span>
                </h2>
                <div className="flex flex-col gap-2.5">
                  {cve.affectedCpes.map((cpe, i) => (
                    <div
                      key={`${cpe.criteria}-${i}`}
                      className="p-3 rounded-lg bg-[#0B0D12] border border-[#242936] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-mono">
                        <span className="text-white font-semibold">
                          {cpe.vendor} / {cpe.product}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px]">
                          {cpe.versionRange}
                        </span>
                      </div>
                      <code className="font-mono text-[10px] text-[#64748B] truncate">
                        {cpe.criteria}
                      </code>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Mitigation & Remediation Steps */}
            {cve.mitigationSteps.length > 0 && (
              <section
                className={`p-6 rounded-xl border border-[#242936] bg-[#12151C]/90 flex flex-col gap-4 ${
                  cve.cwes.length === 0 || cve.affectedCpes.length === 0 ? "lg:col-span-2" : "lg:col-span-2"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-sans font-bold text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#22D3A0]" />
                    <span>Detection &amp; Mitigation Guidance</span>
                  </h2>
                  {cve.kevEntry?.dueDate && (
                    <span className="font-mono text-[11px] text-rose-300 px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                      CISA Binding Due: {cve.kevEntry.dueDate}
                    </span>
                  )}
                </div>

                <ul className="space-y-2.5">
                  {cve.mitigationSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#BACAC1] leading-relaxed"
                    >
                      <CheckCircle className="h-4 w-4 text-[#22D3A0] shrink-0 mt-0.5" />
                      <span>
                        <CveLinkedText text={step} />
                      </span>
                    </li>
                  ))}
                </ul>

                {cve.references.length > 0 && (
                  <div className="pt-4 border-t border-[#242936]/60 flex flex-wrap gap-2">
                    {cve.references.map((ref) => (
                      <a
                        key={ref.url}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0D12] border border-[#242936] hover:border-[#22D3A0]/50 text-[11px] font-mono text-[#94A3B8] hover:text-white transition-colors"
                      >
                        <span className="truncate max-w-[260px]">
                          {ref.url.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-[#22D3A0]" />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Related WriteupHub Walkthroughs Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans font-bold text-xl text-white tracking-tight flex items-center gap-2">
              <FileCode className="h-5 w-5 text-[#22D3A0]" />
              <span>Community Exploitation Walkthroughs</span>
            </h2>
            <span className="font-mono text-xs text-[#94A3B8]">
              {cve.relatedWriteups.length} published
            </span>
          </div>

          {cve.relatedWriteups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cve.relatedWriteups.map((w) => (
                <WriteupCard key={w.id} writeup={w as any} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-[#242936] text-center font-mono text-xs text-[#94A3B8]">
              <p>No community writeups tagged with {cve.cveId} yet.</p>
              <Link
                href="/write"
                className="mt-3 inline-flex items-center gap-1.5 text-[#22D3A0] hover:underline"
              >
                <span>Publish the first walkthrough for this CVE</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

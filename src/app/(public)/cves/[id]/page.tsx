import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  ShieldAlert,
  Flame,
  ArrowLeft,
  ExternalLink,
  Activity,
  Calendar,
  AlertTriangle,
  FileCode,
  CheckCircle,
} from "lucide-react";
import { getCveDetails } from "@/server/cve.service";
import { WriteupCard } from "@/components/writeup/writeup-card";

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

export async function generateMetadata({
  params,
}: CveDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const cve = await getCveDetails(id);

  if (!cve) {
    return { title: "CVE Not Found | WriteupHub" };
  }

  return {
    title: `${cve.cveId} // Vulnerability Analysis & Exploit Research`,
    description: cve.description,
  };
}

export default async function CveDetailPage({ params }: CveDetailPageProps) {
  const { id } = await params;
  const cve = await getCveDetails(id);

  if (!cve) {
    notFound();
  }

  const isCritical = cve.severity === "CRITICAL";

  return (
    <div className="w-full min-h-screen bg-transparent pb-24">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <Link
          href="/cves"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94A3B8] hover:text-white transition-colors min-h-[36px]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to CVE Directory</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* CVE Header Card */}
        <div className="p-6 sm:p-8 rounded-xl border border-[#242936] bg-[#12151C]/95 backdrop-blur-md shadow-lg">
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
          </div>

          <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-4">
            {cve.title}
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#BACAC1] leading-relaxed mb-6">
            {cve.description}
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
                Published Date
              </span>
              <span className="text-base font-bold text-white">
                {cve.publishedDate}
              </span>
              <span className="text-[10px] text-[#475569] block">
                NVD Verified
              </span>
            </div>
          </div>
        </div>

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

import React from "react";
import Link from "next/link";
import {
  Rss,
  FileCode,
  ShieldCheck,
  ExternalLink,
  Lock,
  Globe,
  Radio,
  AlertTriangle,
  Flame,
  Terminal,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const cveLinks = [
    { name: "NIST NVD Database", url: "https://nvd.nist.gov/", desc: "Official U.S. vulnerability repository" },
    { name: "CISA KEV Catalog", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", desc: "Known Exploited Vulnerabilities" },
    { name: "MITRE CVE.org", url: "https://www.cve.org/", desc: "Standardized vulnerability identifiers" },
    { name: "FIRST EPSS Scoring", url: "https://www.first.org/epss/", desc: "Exploit Prediction Scoring System" },
    { name: "Google Project Zero", url: "https://googleprojectzero.blogspot.com/", desc: "Elite zero-day research team" },
    { name: "Exploit-DB (OffSec)", url: "https://www.exploit-db.com/", desc: "Public exploit code archive" },
  ];

  const ctfPlatforms = [
    { name: "CTFtime.org", url: "https://ctftime.org", desc: "Global tournament calendar & ratings" },
    { name: "Hack The Box", url: "https://www.hackthebox.com", desc: "Enterprise labs & vulnerable machines" },
    { name: "TryHackMe", url: "https://tryhackme.com", desc: "Guided browser-based training" },
    { name: "PortSwigger Academy", url: "https://portswigger.net/web-security", desc: "High-fidelity web security labs" },
    { name: "OverTheWire Wargames", url: "https://overthewire.org", desc: "Linux & command-line privilege wargames" },
    { name: "CryptoHack", url: "https://cryptohack.org", desc: "Interactive modern cryptography challenges" },
  ];

  const platformLinks = [
    { name: "Home", href: "/" },
    { name: "Writeups Explorer", href: "/explore" },
    { name: "CTF Sites Directory", href: "/ctf-sites" },
    { name: "Events & Hackathons", href: "/events" },
    { name: "Live CVE Telemetry", href: "/cves" },
    { name: "RSS Syndicate Feed", href: "/feed.xml", icon: Rss },
    { name: "System Sitemap", href: "/sitemap.xml", icon: FileCode },
  ];

  return (
    <footer className="border-t border-[#242936] bg-[#0B0D12]/95 backdrop-blur-xl text-[#94A3B8] text-xs font-mono py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {/* Top Grid: Brand & Informative Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-[#242936]/60">
          {/* Brand & Purpose Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Logo variant="horizontal" size={32} />
            <p className="text-[#BACAC1] font-sans text-xs sm:text-sm leading-relaxed max-w-sm">
              The open intelligence repository for verified CTF walkthroughs, zero-day research, and offensive engineering solutions.
            </p>
            <div className="p-3.5 rounded-xl bg-[#12151C] border border-[#242936] space-y-2 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-[#22D3A0] font-semibold">
                <Terminal className="h-3.5 w-3.5" />
                <span>COORDINATED DISCLOSURE STANDARDS</span>
              </div>
              <p className="text-[#94A3B8] font-sans text-[11px] leading-relaxed">
                We believe in ethical transparency and defense through rigorous verification. All solutions adhere to responsible disclosure norms.
              </p>
            </div>
          </div>

          {/* Official CVE Links Column */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="text-[11px] uppercase font-bold text-white tracking-wider flex items-center gap-2 pb-1 border-b border-[#242936]/40">
              <ShieldCheck className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span>Official CVE Feeds</span>
            </span>
            <ul className="space-y-2 pt-1">
              {cveLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-[#BACAC1] group-hover:text-[#38BDF8]">
                      <span>{item.name}</span>
                      <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] text-[#475569] font-sans truncate">
                      {item.desc}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTF Platforms Column */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="text-[11px] uppercase font-bold text-white tracking-wider flex items-center gap-2 pb-1 border-b border-[#242936]/40">
              <Globe className="h-3.5 w-3.5 text-[#22D3A0]" />
              <span>Featured CTF Labs</span>
            </span>
            <ul className="space-y-2 pt-1">
              {ctfPlatforms.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-[#BACAC1] group-hover:text-[#22D3A0]">
                      <span>{item.name}</span>
                      <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] text-[#475569] font-sans truncate">
                      {item.desc}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation & Resources Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <span className="text-[11px] uppercase font-bold text-white tracking-wider flex items-center gap-2 pb-1 border-b border-[#242936]/40">
              <Radio className="h-3.5 w-3.5 text-amber-400" />
              <span>Platform</span>
            </span>
            <ul className="space-y-2 pt-1">
              {platformLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-1.5 text-xs text-[#BACAC1] hover:text-[#22D3A0] transition-colors py-0.5"
                    >
                      {Icon && <Icon className="h-3 w-3 text-[#475569]" />}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Informative Security Disclaimer & Educational Defense Mission */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#12151C]/70 border border-[#242936] flex flex-col sm:flex-row items-start gap-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider">
              Educational Defense & Responsible Research Mandate
            </h3>
            <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
              WriteupHub is dedicated to authorized offensive and defensive security education. All walkthroughs, challenge scripts, and vulnerability analyses are published strictly for academic study, coordinated patching, and authorized penetration testing. Do not use any technique against infrastructure without explicit written permission.
            </p>
          </div>
        </div>

        {/* Bottom Telemetry Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#475569] pt-2">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-[#22D3A0]" />
            <span>WRITEUPHUB // SEC-LEVEL 3 SECURED TELEMETRY</span>
          </div>

          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} WriteupHub</span>
            <span>•</span>
            <span>Empowering ethical security researchers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

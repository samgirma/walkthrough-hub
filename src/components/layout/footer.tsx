import React from "react";
import Link from "next/link";
import { ExternalLink, Rss, FileCode, Shield, Terminal } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const cveLinks = [
    { name: "NIST NVD", url: "https://nvd.nist.gov/" },
    { name: "CISA KEV", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
    { name: "MITRE CVE.org", url: "https://www.cve.org/" },
    { name: "FIRST EPSS", url: "https://www.first.org/epss/" },
    { name: "Exploit-DB", url: "https://www.exploit-db.com/" },
    { name: "Project Zero", url: "https://googleprojectzero.blogspot.com/" },
  ];

  const ctfPlatforms = [
    { name: "CTFtime.org", url: "https://ctftime.org" },
    { name: "Hack The Box", url: "https://www.hackthebox.com" },
    { name: "TryHackMe", url: "https://tryhackme.com" },
    { name: "PortSwigger Academy", url: "https://portswigger.net/web-security" },
    { name: "OverTheWire", url: "https://overthewire.org" },
    { name: "CryptoHack", url: "https://cryptohack.org" },
  ];

  const platformLinks = [
    { name: "Explore Writeups", href: "/explore" },
    { name: "Browse Directory", href: "/browse" },
    { name: "CTF Platforms", href: "/ctf-sites" },
    { name: "Live Events", href: "/events" },
    { name: "CVE Telemetry", href: "/cves" },
  ];

  const resourceLinks = [
    { name: "RSS Feed", href: "/feed.xml", icon: Rss },
    { name: "Sitemap", href: "/sitemap.xml", icon: FileCode },
    { name: "Responsible Disclosure", href: "/cves" },
  ];

  return (
    <footer className="border-t border-[#242936] bg-[#0B0D12] text-[#94A3B8] text-xs font-mono py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Horizontal Columns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 pb-6 border-b border-[#242936]/60">
          {/* Brand Info */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-2.5">
            <Logo variant="horizontal" size={26} />
            <p className="text-[11px] text-[#BACAC1] font-sans leading-relaxed">
              Open intelligence archive for verified security research and CTF solutions.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-[#475569] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A0]" />
              <span>Coordinated disclosure aligned</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase font-bold text-white tracking-wider">
              Navigation
            </span>
            <ul className="space-y-1.5">
              {platformLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-xs text-[#BACAC1] hover:text-[#22D3A0] transition-colors py-0.5 inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Official CVE Links */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase font-bold text-white tracking-wider flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-[#38BDF8]" />
              <span>CVE Sources</span>
            </span>
            <ul className="space-y-1.5">
              {cveLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 text-xs text-[#BACAC1] hover:text-[#38BDF8] transition-colors py-0.5"
                  >
                    <span>{item.name}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTF Platforms */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase font-bold text-white tracking-wider flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-[#22D3A0]" />
              <span>CTF Labs</span>
            </span>
            <ul className="space-y-1.5">
              {ctfPlatforms.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 text-xs text-[#BACAC1] hover:text-[#22D3A0] transition-colors py-0.5"
                  >
                    <span>{item.name}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Feeds */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase font-bold text-white tracking-wider">
              Feeds & System
            </span>
            <ul className="space-y-1.5">
              {resourceLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-1.5 text-xs text-[#BACAC1] hover:text-[#22D3A0] transition-colors py-0.5"
                    >
                      {Icon && <Icon className="h-3 w-3 text-[#475569] group-hover:text-[#22D3A0]" />}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Minimal Bottom Bar without noisy boxes */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#475569]">
          <p>
            © {new Date().getFullYear()} WriteupHub. Published strictly for academic and defensive study.
          </p>
          <div className="flex items-center gap-3">
            <span>Auth verified</span>
            <span>•</span>
            <span>Static ISR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

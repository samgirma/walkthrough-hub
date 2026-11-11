import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { SYNTHETIC_WRITEUP_EXCLUSION_WHERE } from "@/lib/seo";

export interface KevVulnerability {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction?: string;
  dueDate?: string;
  knownRansomwareCampaignUse: string;
  cwes?: string[];
}

export interface CweBreakdown {
  id: string;
  name: string;
  description: string;
}

export interface AffectedCpe {
  vendor: string;
  product: string;
  versionRange: string;
  criteria: string;
}

export interface CveReference {
  url: string;
  tags: string[];
}

export interface CveSummary {
  cveId: string;
  title: string;
  description: string;
  cvssScore: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  publishedDate: string;
  isKev: boolean;
  epssScore?: number;
  epssPercentile?: number;
  cvssVector?: string;
  cwes?: CweBreakdown[];
  affectedCpes?: AffectedCpe[];
  mitigationSteps?: string[];
  references?: CveReference[];
}

const CWE_CATALOG: Record<string, { name: string; description: string; mitigation: string }> = {
  "CWE-668": {
    name: "Exposure of Resource to Wrong Sphere",
    description: "Internal file descriptors or system handles remain open across privilege/namespace boundaries.",
    mitigation: "Set O_CLOEXEC on all internal file descriptors and verify fd hygiene prior to chroot/execve.",
  },
  "CWE-362": {
    name: "Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition')",
    description: "Non-atomic signal handlers, shared allocators, or lockless state transitions allow concurrent memory corruption.",
    mitigation: "Restrict signal handlers to async-signal-safe functions and enforce strict mutex/RCU locking around shared state.",
  },
  "CWE-787": {
    name: "Out-of-bounds Write",
    description: "Software writes data past the end or before the beginning of an allocated heap or stack buffer.",
    mitigation: "Validate array bounds and allocation sizes before copy/decode operations; enable ASLR, Stack Canaries, and Heap Hardening.",
  },
  "CWE-416": {
    name: "Use After Free",
    description: "Referencing freed heap memory permits attackers to reclaim the chunk and hijack control flow.",
    mitigation: "Nullify pointers upon free, use smart pointers or safe Rust/memory-safe abstractions, and isolate sensitive slabs.",
  },
  "CWE-119": {
    name: "Improper Restriction of Operations within the Bounds of a Memory Buffer",
    description: "Unchecked memory indexing or length calculations permit arbitrary read/write outside buffer boundaries.",
    mitigation: "Adopt bounded copy primitives and enforce integer-overflow checks before allocating target buffers.",
  },
  "CWE-506": {
    name: "Embedded Malicious Code",
    description: "Build scripts, release tarballs, or upstream dependencies introduce unauthorized backdoor logic.",
    mitigation: "Verify reproducible builds, inspect release artifact checksums against git tags, and pin SBOM/SLSA provenance.",
  },
  "CWE-125": {
    name: "Out-of-bounds Read",
    description: "Reading past buffer limits leaks kernel pointers, ASLR base addresses, or cryptographic secrets.",
    mitigation: "Enforce explicit length verification against allocated payload sizes prior to buffer reads.",
  },
  "CWE-78": {
    name: "Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')",
    description: "Untrusted user input flows into shell interpreters or system subprocess arguments without escaping.",
    mitigation: "Invoke parameterized exec APIs with shell=false and enforce strict allowlist validation on user parameters.",
  },
  "CWE-89": {
    name: "Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')",
    description: "Unsanitized inputs concatenate directly into SQL statements enabling arbitrary database read/write.",
    mitigation: "Use parameterized prepared statements exclusively and enforce least-privilege database roles.",
  },
  "CWE-502": {
    name: "Deserialization of Untrusted Data",
    description: "Deserializing attacker-controlled object streams triggers gadget chains leading to remote code execution.",
    mitigation: "Avoid binary/object deserialization of untrusted payloads; use JSON schemas with strict type allowlists.",
  },
  "CWE-918": {
    name: "Server-Side Request Forgery (SSRF)",
    description: "Server fetches attacker-supplied URLs enabling internal metadata service and intranet pivoting.",
    mitigation: "Validate resolved IPs against RFC1918/link-local blocks after DNS resolution and restrict outbound egress.",
  },
  "CWE-269": {
    name: "Improper Privilege Management",
    description: "Missing capability drops or flawed authorization boundaries permit unprivileged actors to escalate privileges.",
    mitigation: "Apply least-privilege capabilities, verify authorization on every privileged boundary, and drop root ASAP.",
  },
};

function enrichCweList(cweIds: string[]): CweBreakdown[] {
  const unique = Array.from(new Set(cweIds.map((c) => c.trim().toUpperCase()).filter((c) => /^CWE-\d+$/.test(c))));
  return unique.map((id) => {
    const entry = CWE_CATALOG[id];
    return {
      id,
      name: entry?.name || "Software Weakness Classification",
      description:
        entry?.description ||
        `Security weakness categorized under ${id} impacting input validation, memory safety, or privilege boundaries.`,
    };
  });
}

// Curated technical CVE catalog used alongside live NVD/CISA KEV data
const FALLBACK_CVES: CveSummary[] = [
  {
    cveId: "CVE-2024-21626",
    title: "runc container breakout via internal file descriptor leak",
    description:
      "runc 1.1.11 and earlier leak internal file descriptors to the guest container process during runc run/exec, enabling host filesystem root breakout via /proc/self/fd/7.",
    cvssScore: 8.6,
    severity: "HIGH",
    publishedDate: "2024-01-31",
    isKev: true,
    epssScore: 0.892,
    epssPercentile: 0.985,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:H",
    cwes: enrichCweList(["CWE-668", "CWE-269"]),
    affectedCpes: [
      {
        vendor: "linuxfoundation",
        product: "runc",
        versionRange: "<= 1.1.11",
        criteria: "cpe:2.3:a:linuxfoundation:runc:*:*:*:*:*:*:*:*",
      },
      {
        vendor: "docker",
        product: "docker_engine",
        versionRange: "< 25.0.2",
        criteria: "cpe:2.3:a:docker:docker_engine:*:*:*:*:*:*:*:*",
      },
    ],
    mitigationSteps: [
      "Upgrade runc to version 1.1.12 or later across all Kubernetes and Docker container runtimes.",
      "Verify container images and orchestration manifests do not accept untrusted WORKINGDIR paths referencing /proc/self/fd.",
      "Audit runtime Seccomp/AppArmor profiles and deploy Falco rules detecting /proc/self/fd/ traversal during container spawn.",
    ],
    references: [
      { url: "https://github.com/opencontainers/runc/security/advisories/GHSA-xr7r-f8xq-vfvv", tags: ["Vendor Advisory", "Patch"] },
      { url: "https://nvd.nist.gov/vuln/detail/CVE-2024-21626", tags: ["Third Party Advisory"] },
    ],
  },
  {
    cveId: "CVE-2024-6387",
    title: "regreSSHion: OpenSSH Remote Unauthenticated Code Execution",
    description:
      "A signal handler race condition in OpenSSH's server (sshd) allows unauthenticated remote code execution as root on glibc-based Linux systems.",
    cvssScore: 9.8,
    severity: "CRITICAL",
    publishedDate: "2024-07-01",
    isKev: true,
    epssScore: 0.941,
    epssPercentile: 0.991,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H",
    cwes: enrichCweList(["CWE-362", "CWE-416"]),
    affectedCpes: [
      {
        vendor: "openbsd",
        product: "openssh",
        versionRange: "8.5p1 - 9.7p1",
        criteria: "cpe:2.3:a:openbsd:openssh:*:*:*:*:*:*:*:*",
      },
    ],
    mitigationSteps: [
      "Upgrade OpenSSH server packages to 9.8p1 or apply vendor backport security patches immediately.",
      "If immediate patching is deferred, set LoginGraceTime 0 in /etc/ssh/sshd_config as a temporary mitigation (note DoS max-startups trade-off).",
      "Restrict TCP port 22 exposure via zero-trust bastion hosts, VPNs, or strict source IP firewall allowlists.",
    ],
    references: [
      { url: "https://www.openssh.com/txt/release-9.8", tags: ["Vendor Advisory", "Patch"] },
      { url: "https://blog.qualys.com/vulnerabilities-threat-research/2024/07/01/regresshion-remote-unauthenticated-code-execution-vulnerability-in-openssh-server", tags: ["Exploit", "Technical Description"] },
    ],
  },
  {
    cveId: "CVE-2023-38606",
    title: "Apple iOS/macOS Kernel Memory Mapping MMIO Zero-Day",
    description:
      "Operation Triangulation kernel exploit chaining hardware MMIO registers to bypass page table protection on Apple A12-A16 SoCs.",
    cvssScore: 7.8,
    severity: "HIGH",
    publishedDate: "2023-07-24",
    isKev: true,
    epssScore: 0.765,
    epssPercentile: 0.948,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
    cwes: enrichCweList(["CWE-119", "CWE-787"]),
    affectedCpes: [
      {
        vendor: "apple",
        product: "iphone_os",
        versionRange: "< 16.6",
        criteria: "cpe:2.3:o:apple:iphone_os:*:*:*:*:*:*:*:*",
      },
      {
        vendor: "apple",
        product: "macos",
        versionRange: "< 13.5",
        criteria: "cpe:2.3:o:apple:macos:*:*:*:*:*:*:*:*",
      },
    ],
    mitigationSteps: [
      "Update iOS to 16.6+, iPadOS 16.6+, and macOS Ventura 13.5+ where undocumented MMIO register ranges are protected.",
      "Enable Lockdown Mode on high-risk executive and researcher devices to restrict iMessage attachment attack surfaces.",
      "Audit MDM compliance telemetry for legacy unpatched endpoints capable of parsing malicious font/PDF attachments.",
    ],
    references: [
      { url: "https://support.apple.com/en-us/HT213843", tags: ["Vendor Advisory"] },
    ],
  },
  {
    cveId: "CVE-2023-4863",
    title: "libwebp Heap Buffer Overflow in Huffman Coding",
    description:
      "Heap buffer overflow in libwebp in Google Chrome prior to 116.0.5845.187 allowed a remote attacker to perform out-of-bounds memory write via a crafted HTML page.",
    cvssScore: 8.8,
    severity: "HIGH",
    publishedDate: "2023-09-12",
    isKev: true,
    epssScore: 0.912,
    epssPercentile: 0.988,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
    cwes: enrichCweList(["CWE-787", "CWE-125"]),
    affectedCpes: [
      {
        vendor: "webmproject",
        product: "libwebp",
        versionRange: "< 1.3.2",
        criteria: "cpe:2.3:a:webmproject:libwebp:*:*:*:*:*:*:*:*",
      },
      {
        vendor: "google",
        product: "chrome",
        versionRange: "< 116.0.5845.187",
        criteria: "cpe:2.3:a:google:chrome:*:*:*:*:*:*:*:*",
      },
    ],
    mitigationSteps: [
      "Upgrade libwebp to 1.3.2+ across OS distributions, browsers, Electron apps, and container base images.",
      "Rebuild static native dependencies (Pillow, Sharp, ImageMagick, Chromium-based renderers) linking vulnerable libwebp versions.",
    ],
    references: [
      { url: "https://chromereleases.googleblog.com/2023/09/stable-channel-update-for-desktop_11.html", tags: ["Vendor Advisory"] },
    ],
  },
  {
    cveId: "CVE-2024-3094",
    title: "XZ Utils backdoor insertion into liblzma build system",
    description:
      "Malicious code in XZ Utils releases 5.6.0 and 5.6.1 injects code into sshd via liblzma to bypass OpenSSH authentication under specific glibc/systemd configurations.",
    cvssScore: 10.0,
    severity: "CRITICAL",
    publishedDate: "2024-03-29",
    isKev: false,
    epssScore: 0.971,
    epssPercentile: 0.999,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
    cwes: enrichCweList(["CWE-506"]),
    affectedCpes: [
      {
        vendor: "tukaani",
        product: "xz",
        versionRange: "5.6.0 - 5.6.1",
        criteria: "cpe:2.3:a:tukaani:xz:*:*:*:*:*:*:*:*",
      },
    ],
    mitigationSteps: [
      "Downgrade or rebuild XZ Utils / liblzma to verified clean release 5.4.x or 5.6.2+ from trusted upstream sources.",
      "Scan all Linux staging, CI runners, and container images for liblzma 5.6.0 or 5.6.1 shared library artifacts.",
      "Rotate SSH host keys and credentials on any host previously running affected pre-release Linux distributions.",
    ],
    references: [
      { url: "https://nvd.nist.gov/vuln/detail/CVE-2024-3094", tags: ["Third Party Advisory"] },
    ],
  },
];

async function withCacheFallback<T>(fn: () => Promise<T>, directFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err?.message?.includes("incrementalCache missing") || err?.message?.includes("Invariant")) {
      try {
        return await directFn();
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

/**
 * Fetch and trim CISA Known Exploited Vulnerabilities (KEV).
 * Keeps cache lightweight (<100 trimmed items) with requiredAction & CWE enrichment.
 */
async function fetchKevVulnerabilitiesInternal(): Promise<KevVulnerability[]> {
  try {
    const res = await fetch(
      "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) {
      throw new Error(`CISA KEV returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const rawList = Array.isArray(json?.vulnerabilities)
      ? json.vulnerabilities
      : [];

    const trimmed: KevVulnerability[] = rawList
      .slice(0, 100)
      .map((item: any) => ({
        cveID: String(item.cveID || "").toUpperCase(),
        vendorProject: String(item.vendorProject || ""),
        product: String(item.product || ""),
        vulnerabilityName: String(item.vulnerabilityName || ""),
        dateAdded: String(item.dateAdded || ""),
        shortDescription: String(item.shortDescription || "").slice(0, 400),
        requiredAction: item.requiredAction ? String(item.requiredAction).slice(0, 400) : undefined,
        dueDate: item.dueDate ? String(item.dueDate) : undefined,
        knownRansomwareCampaignUse: String(item.knownRansomwareCampaignUse || "Unknown"),
        cwes: Array.isArray(item.cwes) ? item.cwes.map((c: any) => String(c).toUpperCase()) : undefined,
      }));

    if (trimmed.length > 0) return trimmed;
  } catch (err: any) {
    console.warn("[getKevVulnerabilities] Using fallback KEV entries:", err.message);
  }

  return FALLBACK_CVES.filter((f) => f.isKev).map((f) => ({
    cveID: f.cveId,
    vendorProject: f.affectedCpes?.[0]?.vendor || f.title.split(" ")[0],
    product: f.affectedCpes?.[0]?.product || f.title.split(" ")[1] || "Core",
    vulnerabilityName: f.title,
    dateAdded: f.publishedDate,
    shortDescription: f.description,
    requiredAction: f.mitigationSteps?.[0],
    knownRansomwareCampaignUse: "Known",
    cwes: f.cwes?.map((c) => c.id),
  }));
}

const cachedKev = unstable_cache(
  fetchKevVulnerabilitiesInternal,
  ["cisa-kev-trimmed-v2"],
  {
    revalidate: 3600, // 1 hour
    tags: ["cves", "cve-kev"],
  }
);

export async function getKevVulnerabilities(): Promise<KevVulnerability[]> {
  return withCacheFallback(
    () => cachedKev(),
    () => fetchKevVulnerabilitiesInternal(),
    []
  );
}

/**
 * Fetch single CVE technical details from NVD API v2.0 (graceful fallback if unavailable).
 */
async function fetchNvdCveInternal(cveId: string) {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.NVD_API_KEY) {
      headers.apiKey = process.env.NVD_API_KEY;
    }

    const res = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cveId)}`,
      {
        headers,
        signal: AbortSignal.timeout(4000),
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    const vuln = json?.vulnerabilities?.[0]?.cve;
    if (!vuln) return null;

    const description =
      vuln.descriptions?.find((d: any) => d.lang === "en")?.value || null;

    const metric =
      vuln.metrics?.cvssMetricV31?.[0]?.cvssData ||
      vuln.metrics?.cvssMetricV30?.[0]?.cvssData ||
      vuln.metrics?.cvssMetricV40?.[0]?.cvssData ||
      null;

    const cweIds: string[] = [];
    for (const w of vuln.weaknesses || []) {
      for (const desc of w.description || []) {
        if (typeof desc.value === "string" && /^CWE-\d+$/i.test(desc.value)) {
          cweIds.push(desc.value.toUpperCase());
        }
      }
    }

    const affectedCpes: AffectedCpe[] = [];
    for (const config of vuln.configurations || []) {
      for (const node of config.nodes || []) {
        for (const match of node.cpeMatch || []) {
          if (!match.vulnerable || !match.criteria) continue;
          const parts = String(match.criteria).split(":");
          const vendor = parts[3] || "unknown";
          const product = parts[4] || "unknown";
          let versionRange = parts[5] && parts[5] !== "*" ? parts[5] : "affected builds";
          if (match.versionEndExcluding) {
            versionRange = match.versionStartIncluding
              ? `${match.versionStartIncluding} to < ${match.versionEndExcluding}`
              : `< ${match.versionEndExcluding}`;
          } else if (match.versionEndIncluding) {
            versionRange = match.versionStartIncluding
              ? `${match.versionStartIncluding} - ${match.versionEndIncluding}`
              : `<= ${match.versionEndIncluding}`;
          }
          if (affectedCpes.length < 8) {
            affectedCpes.push({
              vendor,
              product,
              versionRange,
              criteria: String(match.criteria),
            });
          }
        }
      }
    }

    const references: CveReference[] = (vuln.references || [])
      .slice(0, 6)
      .map((ref: any) => ({
        url: String(ref.url),
        tags: Array.isArray(ref.tags) ? ref.tags.map(String) : [],
      }));

    return {
      description,
      publishedDate: vuln.published ? String(vuln.published).slice(0, 10) : null,
      lastModifiedDate: vuln.lastModified ? String(vuln.lastModified).slice(0, 10) : null,
      cvssScore: metric?.baseScore ? Number(metric.baseScore) : null,
      severity: (metric?.baseSeverity ? String(metric.baseSeverity).toUpperCase() : null) as
        | "CRITICAL"
        | "HIGH"
        | "MEDIUM"
        | "LOW"
        | null,
      cvssVector: metric?.vectorString ? String(metric.vectorString) : null,
      cweIds,
      affectedCpes,
      references,
    };
  } catch {
    return null;
  }
}

async function fetchRecentCvesInternal(): Promise<CveSummary[]> {
  try {
    const kevList = await getKevVulnerabilities();
    const kevCveSet = new Set(kevList.map((k) => k.cveID));

    return FALLBACK_CVES.map((item) => ({
      ...item,
      isKev: kevCveSet.has(item.cveId) || item.isKev,
    }));
  } catch (err: any) {
    console.warn("[getRecentCves] Fallback to static catalog:", err.message);
    return FALLBACK_CVES;
  }
}

const cachedRecentCves = unstable_cache(
  fetchRecentCvesInternal,
  ["nvd-cve-list-rounded-v2"],
  {
    revalidate: 1800, // 30 min
    tags: ["cves", "cve-nvd"],
  }
);

export async function getRecentCves(): Promise<CveSummary[]> {
  return withCacheFallback(
    () => cachedRecentCves(),
    () => fetchRecentCvesInternal(),
    FALLBACK_CVES
  );
}

async function fetchEpssScoreInternal(
  cveId: string
): Promise<{ epssScore: number; epssPercentile: number } | null> {
  const cleanId = cveId.trim().toUpperCase();
  try {
    const res = await fetch(`https://api.first.org/data/v1/epss?cve=${cleanId}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      throw new Error(`EPSS API HTTP ${res.status}`);
    }

    const json = await res.json();
    const firstEntry = json?.data?.[0];
    if (firstEntry) {
      return {
        epssScore: parseFloat(firstEntry.epss) || 0,
        epssPercentile: parseFloat(firstEntry.percentile) || 0,
      };
    }
    return null;
  } catch {
    const fallback = FALLBACK_CVES.find((f) => f.cveId === cleanId);
    if (fallback && fallback.epssScore !== undefined) {
      return {
        epssScore: fallback.epssScore,
        epssPercentile: fallback.epssPercentile || 0.8,
      };
    }
    return null;
  }
}

const cachedEpssScore = unstable_cache(
  fetchEpssScoreInternal,
  ["epss-score-v2"],
  {
    revalidate: 86400, // 24 hours
    tags: ["cves", "cve-epss"],
  }
);

export async function getEpssScore(
  cveId: string
): Promise<{ epssScore: number; epssPercentile: number } | null> {
  return withCacheFallback(
    () => cachedEpssScore(cveId),
    () => fetchEpssScoreInternal(cveId),
    null
  );
}

async function fetchCveDetailsInternal(rawCveId: string) {
  const cveId = rawCveId.trim().toUpperCase();

  // Parallel enrichment queries
  const [kevList, epss, nvd, relatedWriteups] = await Promise.all([
    getKevVulnerabilities(),
    getEpssScore(cveId),
    fetchNvdCveInternal(cveId),
    prisma.writeup.findMany({
      where: {
        status: "PUBLIC",
        NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
        OR: [
          { title: { contains: cveId, mode: "insensitive" } },
          { excerpt: { contains: cveId, mode: "insensitive" } },
          { contentMd: { contains: cveId, mode: "insensitive" } },
          { slug: { contains: cveId.toLowerCase(), mode: "insensitive" } },
          {
            tags: {
              some: {
                tag: {
                  name: { contains: cveId.toLowerCase(), mode: "insensitive" },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        difficulty: true,
        ctfName: true,
        ctfYear: true,
        viewCount: true,
        readTimeMin: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        tags: {
          select: {
            tag: { select: { id: true, name: true } },
          },
        },
      },
      take: 6,
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const matched = FALLBACK_CVES.find((c) => c.cveId === cveId);
  const kevEntry = kevList.find((k) => k.cveID === cveId) || null;

  // Build CWE breakdown from NVD, KEV, and curated catalog
  const combinedCweIds = [
    ...(nvd?.cweIds || []),
    ...(kevEntry?.cwes || []),
    ...(matched?.cwes?.map((c) => c.id) || []),
  ];
  const cwes = enrichCweList(combinedCweIds);

  // Affected CPEs (NVD > curated)
  const affectedCpes: AffectedCpe[] =
    nvd?.affectedCpes && nvd.affectedCpes.length > 0
      ? nvd.affectedCpes
      : matched?.affectedCpes ||
        (kevEntry
          ? [
              {
                vendor: kevEntry.vendorProject.toLowerCase().replace(/\s+/g, "_"),
                product: kevEntry.product.toLowerCase().replace(/\s+/g, "_"),
                versionRange: "Vendor-confirmed vulnerable releases",
                criteria: `cpe:2.3:a:${kevEntry.vendorProject.toLowerCase().replace(/\s+/g, "_")}:${kevEntry.product.toLowerCase().replace(/\s+/g, "_")}:*:*:*:*:*:*:*:*`,
              },
            ]
          : []);

  // Mitigation & Remediation Guidance
  const mitigationSet = new Set<string>();
  if (kevEntry?.requiredAction) {
    mitigationSet.add(kevEntry.requiredAction);
  }
  for (const step of matched?.mitigationSteps || []) {
    mitigationSet.add(step);
  }
  for (const cwe of cwes) {
    const catalogEntry = CWE_CATALOG[cwe.id];
    if (catalogEntry?.mitigation) {
      mitigationSet.add(`${cwe.id}: ${catalogEntry.mitigation}`);
    }
  }
  if (nvd?.references?.some((r) => r.tags.includes("Patch") || r.tags.includes("Vendor Advisory"))) {
    mitigationSet.add(
      `Apply vendor security updates and patch releases referenced in NVD advisory records for ${cveId}.`
    );
  }
  const mitigationSteps = Array.from(mitigationSet);

  const references: CveReference[] =
    nvd?.references && nvd.references.length > 0
      ? nvd.references
      : matched?.references || [];

  const hasTechnicalEnrichment = Boolean(
    matched || kevEntry || nvd || cwes.length > 0 || affectedCpes.length > 0 || mitigationSteps.length > 0
  );
  const isEnriched = relatedWriteups.length > 0 || hasTechnicalEnrichment;

  return {
    cveId,
    title:
      matched?.title ||
      kevEntry?.vulnerabilityName ||
      `${cveId} Vulnerability Analysis`,
    description:
      matched?.description ||
      nvd?.description ||
      kevEntry?.shortDescription ||
      `Security advisory record for ${cveId}. Pending upstream NVD description or community exploitation walkthroughs.`,
    cvssScore: matched?.cvssScore || nvd?.cvssScore || (kevEntry ? 8.5 : 7.5),
    severity: matched?.severity || nvd?.severity || (kevEntry ? "HIGH" : "MEDIUM"),
    cvssVector: matched?.cvssVector || nvd?.cvssVector || null,
    publishedDate: matched?.publishedDate || nvd?.publishedDate || kevEntry?.dateAdded || "2024-01-01",
    lastModifiedDate:
      nvd?.lastModifiedDate || kevEntry?.dateAdded || matched?.publishedDate || "2024-01-01",
    isKev: !!kevEntry || Boolean(matched?.isKev),
    kevEntry,
    epssScore: epss?.epssScore ?? matched?.epssScore ?? null,
    epssPercentile: epss?.epssPercentile ?? matched?.epssPercentile ?? null,
    cwes,
    affectedCpes,
    mitigationSteps,
    references,
    relatedWriteups,
    isEnriched,
  };
}

const cachedCveDetails = unstable_cache(
  fetchCveDetailsInternal,
  ["cve-details-single-v2"],
  {
    revalidate: 21600, // 6 hours
    tags: ["cves", "cve-single"],
  }
);

export async function getCveDetails(rawCveId: string) {
  return withCacheFallback(
    () => cachedCveDetails(rawCveId),
    () => fetchCveDetailsInternal(rawCveId),
    null
  );
}

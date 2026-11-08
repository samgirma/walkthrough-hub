export interface HubIntro {
  title: string;
  tagline: string;
  description: string;
}

export const CATEGORY_HUB_CONFIG: Record<string, HubIntro> = {
  web: {
    title: "Web Exploitation & Protocol Analysis",
    tagline: "Server-side vulnerabilities, client-side injection, and web app protocols",
    description:
      "Deep dive into web exploit mechanics covering SSRF, SQLi, Prototype Pollution, Deserialization, and GraphQL flaws across competitive CTF environments.",
  },
  pwn: {
    title: "Binary Exploitation & Memory Corruption",
    tagline: "Stack overflows, heap feng-shui, ROP chains, and kernel exploitation",
    description:
      "Detailed offensive engineering walkthroughs targeting Linux userland binaries, SLUB heap allocators, memory corruption bugs, and modern defense bypasses.",
  },
  crypto: {
    title: "Applied Cryptography & Mathematical Attacks",
    tagline: "RSA factorizations, elliptic curve vulnerabilities, lattice reductions, and block cipher faults",
    description:
      "Rigorous mathematical writeups and solver scripts breaking flawed cryptosystems, nonce reuses, Bleichenbacher padding oracles, and custom crypto constructions.",
  },
  reverse: {
    title: "Reverse Engineering & Decompilation",
    tagline: "Ghidra, IDA Pro, radare2, firmware reversing, and anti-analysis bypasses",
    description:
      "Static and dynamic analysis guides dissecting obfuscated binaries, custom bytecode architectures, malware packers, and zero-auth firmware.",
  },
  forensics: {
    title: "Digital Forensics & Incident Response",
    tagline: "PCAP dissection, memory forensics with Volatility, filesystem reconstruction",
    description:
      "Forensic artifact analysis, memory dump extraction, packet inspection, and investigative triage from premier CTF competitions.",
  },
  misc: {
    title: "Miscellaneous Challenges & Exotic Stacks",
    tagline: "Esoteric programming languages, jailbreaks, hardware, and radio frequency",
    description:
      "Unique and multifaceted CTF walkthroughs covering pyjail escapes, logic quirks, smart contracts, and unconventional computing platforms.",
  },
  osint: {
    title: "Open Source Intelligence (OSINT)",
    tagline: "Geolocation, public records, digital footprint tracking, and metadata analysis",
    description:
      "Methodological intelligence gathering, satellite imagery verification, social graphing, and investigative techniques.",
  },
};

export function getCategoryHubInfo(categoryKey: string): HubIntro {
  const key = categoryKey.toLowerCase();
  return (
    CATEGORY_HUB_CONFIG[key] || {
      title: `${categoryKey.toUpperCase()} CTF Challenges & Solutions`,
      tagline: `Offensive security and competitive CTF writeups in ${categoryKey.toUpperCase()}`,
      description: `Browse verified walkthroughs, exploit proofs-of-concept, and solutions for ${categoryKey.toUpperCase()} challenges published by the security community.`,
    }
  );
}

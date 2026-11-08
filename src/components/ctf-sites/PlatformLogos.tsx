import React from "react";

interface PlatformLogoProps {
  id: string;
  className?: string;
  ariaLabel?: string;
}

export function PlatformLogo({
  id,
  className = "w-20 h-20",
  ariaLabel,
}: PlatformLogoProps) {
  switch (id) {
    case "hackthebox":
      // Hack The Box: Iconic isometric cube with glowing green geometric faces
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "Hack The Box Logo"}
        >
          <defs>
            <linearGradient id="htb-top" x1="50" y1="14" x2="50" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9FEF00" />
              <stop offset="1" stopColor="#22D3A0" />
            </linearGradient>
            <linearGradient id="htb-left" x1="18" y1="36" x2="50" y2="88" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E293B" />
              <stop offset="1" stopColor="#0B132B" />
            </linearGradient>
            <linearGradient id="htb-right" x1="50" y1="36" x2="82" y2="88" gradientUnits="userSpaceOnUse">
              <stop stopColor="#334155" />
              <stop offset="1" stopColor="#1E293B" />
            </linearGradient>
            <filter id="htb-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#9FEF00" floodOpacity="0.4" />
            </filter>
          </defs>
          <g filter="url(#htb-glow)">
            {/* Top Isometric Face */}
            <polygon points="50,14 82,32 50,50 18,32" fill="url(#htb-top)" />
            {/* Left Face */}
            <polygon points="18,34 50,52 50,88 18,70" fill="url(#htb-left)" stroke="#9FEF00" strokeWidth="1.5" strokeOpacity="0.6" />
            {/* Right Face */}
            <polygon points="50,52 82,34 82,70 50,88" fill="url(#htb-right)" stroke="#22D3A0" strokeWidth="1.5" strokeOpacity="0.8" />
            {/* Center Cube Joint */}
            <polyline points="50,52 50,88" stroke="#9FEF00" strokeWidth="2.5" strokeLinecap="round" />
            {/* Inner Hex Core */}
            <polygon points="50,30 64,38 50,46 36,38" fill="#0B0D12" />
          </g>
        </svg>
      );

    case "ctftime":
      // CTFtime: Global flag waving atop cyber competition leaderboard podium
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "CTFtime Logo"}
        >
          <defs>
            <linearGradient id="ctftime-grad" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22D3A0" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
            <filter id="ctf-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#22D3A0" floodOpacity="0.5" />
            </filter>
          </defs>
          <g filter="url(#ctf-glow)">
            {/* Shield / Badge Background */}
            <path d="M50 10 L84 22 V50 C84 72 50 90 50 90 C50 90 16 72 16 50 V22 Z" fill="#12151C" stroke="url(#ctftime-grad)" strokeWidth="2.5" />
            {/* Flagpole */}
            <path d="M34 26 V74" stroke="#BACAC1" strokeWidth="2.5" strokeLinecap="round" />
            {/* CTF Flag Banner */}
            <path d="M35 28 C48 24 54 36 68 32 V54 C54 58 48 46 35 50 Z" fill="url(#ctftime-grad)" />
            {/* Stopwatch tick marker */}
            <circle cx="68" cy="72" r="3" fill="#22D3A0" />
            <path d="M60 76 L68 72 L76 76" stroke="#22D3A0" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "portswigger":
      // PortSwigger / Burp Suite: Vibrant orange circular scanner intercept target
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "PortSwigger Web Security Academy Logo"}
        >
          <defs>
            <linearGradient id="burp-orange" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF7700" />
              <stop offset="1" stopColor="#FF3300" />
            </linearGradient>
            <filter id="burp-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FF6600" floodOpacity="0.5" />
            </filter>
          </defs>
          <g filter="url(#burp-glow)">
            {/* Outer Target Intercept Ring */}
            <circle cx="50" cy="50" r="38" stroke="url(#burp-orange)" strokeWidth="3" strokeDasharray="16 6" />
            {/* Inner Ring */}
            <circle cx="50" cy="50" r="26" stroke="#FB923C" strokeWidth="2" />
            {/* Center Core Scanner Node */}
            <circle cx="50" cy="50" r="14" fill="url(#burp-orange)" />
            {/* Crosshair Intercept Markers */}
            <path d="M50 16 V28 M50 72 V84 M16 50 H28 M72 50 H84" stroke="#FFAA55" strokeWidth="2.5" strokeLinecap="round" />
            {/* Stylized 'B' in Center */}
            <path d="M47 43 H52 C54 43 55 44.5 55 46 C55 47.5 54 49 52 49 H47 V43 Z M47 49 H53 C55 49 56.5 50.5 56.5 52.5 C56.5 54.5 55 56 53 56 H47 V49 Z" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case "tryhackme":
      // TryHackMe: Iconic flame / shield crest with red glow
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "TryHackMe Logo"}
        >
          <defs>
            <linearGradient id="thm-red" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF2E56" />
              <stop offset="1" stopColor="#C4002B" />
            </linearGradient>
            <filter id="thm-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FF2E56" floodOpacity="0.45" />
            </filter>
          </defs>
          <g filter="url(#thm-glow)">
            {/* Shield Outline */}
            <path d="M50 12 L82 24 V52 C82 72 50 88 50 88 C50 88 18 72 18 52 V24 Z" fill="#12151C" stroke="url(#thm-red)" strokeWidth="2.5" />
            {/* Dual Flame Silhouette */}
            <path d="M50 26 C53 36 64 42 64 54 C64 63 58 70 50 74 C42 70 36 63 36 54 C36 44 45 34 50 26 Z" fill="url(#thm-red)" />
            {/* Inner Hot White Flame Tongue */}
            <path d="M50 44 C52 50 56 54 56 60 C56 64 53 67 50 69 C47 67 44 64 44 60 C44 54 48 50 50 44 Z" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case "overthewire":
      // OverTheWire: Classic CLI terminal prompt inside emerald wireframe
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "OverTheWire Wargames Logo"}
        >
          <defs>
            <linearGradient id="otw-teal" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#14B8A6" />
              <stop offset="1" stopColor="#0D9488" />
            </linearGradient>
            <filter id="otw-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#14B8A6" floodOpacity="0.4" />
            </filter>
          </defs>
          <g filter="url(#otw-glow)">
            <rect x="14" y="20" width="72" height="60" rx="8" fill="#0E1217" stroke="url(#otw-teal)" strokeWidth="2.5" />
            {/* Terminal Window Header */}
            <line x1="14" y1="36" x2="86" y2="36" stroke="#242936" strokeWidth="1.5" />
            <circle cx="24" cy="28" r="2.5" fill="#EF4444" />
            <circle cx="32" cy="28" r="2.5" fill="#EAB308" />
            <circle cx="40" cy="28" r="2.5" fill="#22D3A0" />
            {/* Terminal Prompt '>_' */}
            <path d="M26 48 L36 56 L26 64" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="42" y1="64" x2="56" y2="64" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" />
            {/* Matrix Wire Nodes in background */}
            <circle cx="70" cy="50" r="2" fill="#14B8A6" opacity="0.6" />
            <circle cx="76" cy="62" r="2" fill="#14B8A6" opacity="0.6" />
            <line x1="70" y1="50" x2="76" y2="62" stroke="#14B8A6" strokeWidth="1" opacity="0.4" />
          </g>
        </svg>
      );

    case "cryptohack":
      // CryptoHack: Cryptographic Key & Elliptic Curve lock in deep violet
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "CryptoHack Logo"}
        >
          <defs>
            <linearGradient id="crypto-purp" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C084FC" />
              <stop offset="1" stopColor="#7E22CE" />
            </linearGradient>
            <filter id="crypto-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#A855F7" floodOpacity="0.45" />
            </filter>
          </defs>
          <g filter="url(#crypto-glow)">
            {/* Quantum Orbit Ring */}
            <ellipse cx="50" cy="50" rx="36" ry="16" transform="rotate(-30 50 50)" stroke="url(#crypto-purp)" strokeWidth="2" strokeDasharray="5 3" />
            {/* Padlock Body */}
            <rect x="32" y="44" width="36" height="34" rx="6" fill="#12151C" stroke="url(#crypto-purp)" strokeWidth="2.5" />
            {/* Padlock Shackle */}
            <path d="M40 44 V32 C40 26.5 44.5 22 50 22 C55.5 22 60 26.5 60 32 V44" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
            {/* Keyhole */}
            <circle cx="50" cy="58" r="4" fill="#C084FC" />
            <path d="M48 60 L47 70 H53 L52 60 Z" fill="#C084FC" />
          </g>
        </svg>
      );

    case "pwnable-tw":
      // Pwnable.tw: Binary Heap Memory & Buffer Overflow ROP Stack in Crimson
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "Pwnable.tw Logo"}
        >
          <defs>
            <linearGradient id="pwn-red" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F43F5E" />
              <stop offset="1" stopColor="#9F1239" />
            </linearGradient>
            <filter id="pwn-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F43F5E" floodOpacity="0.4" />
            </filter>
          </defs>
          <g filter="url(#pwn-glow)">
            {/* Hexagon Shield */}
            <polygon points="50,14 84,32 84,68 50,86 16,68 16,32" fill="#12151C" stroke="url(#pwn-red)" strokeWidth="2.5" />
            {/* Memory Registers / Stack blocks */}
            <rect x="30" y="32" width="40" height="7" rx="1.5" fill="#F43F5E" opacity="0.9" />
            <rect x="30" y="43" width="40" height="7" rx="1.5" fill="#FB7185" opacity="0.75" />
            <rect x="30" y="54" width="40" height="7" rx="1.5" fill="#E11D48" opacity="0.9" />
            {/* RIP Overwrite Pointer */}
            <path d="M46 67 L50 71 L54 67" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="50" y1="63" x2="50" y2="71" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "picoctf":
      // picoCTF: CMU Cyber Banner Trophy & Collegiate Star
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "picoCTF Logo"}
        >
          <defs>
            <linearGradient id="pico-blue" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
            <filter id="pico-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#38BDF8" floodOpacity="0.45" />
            </filter>
          </defs>
          <g filter="url(#pico-glow)">
            <circle cx="50" cy="50" r="38" fill="#12151C" stroke="url(#pico-blue)" strokeWidth="2.5" />
            {/* Central 5-Point Star */}
            <polygon points="50,24 57,39 74,40 61,51 65,68 50,58 35,68 39,51 26,40 43,39" fill="url(#pico-blue)" />
            {/* Inner Mini Star */}
            <circle cx="50" cy="48" r="5" fill="#FFFFFF" />
            {/* Tech Nodes */}
            <circle cx="50" cy="12" r="3" fill="#38BDF8" />
            <circle cx="88" cy="50" r="3" fill="#38BDF8" />
            <circle cx="50" cy="88" r="3" fill="#38BDF8" />
            <circle cx="12" cy="50" r="3" fill="#38BDF8" />
          </g>
        </svg>
      );

    case "root-me":
      // Root-Me: Cyber Skull & Target Crosshairs in gold/amber
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "Root-Me Logo"}
        >
          <defs>
            <linearGradient id="root-gold" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FACC15" />
              <stop offset="1" stopColor="#CA8A04" />
            </linearGradient>
            <filter id="root-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#EAB308" floodOpacity="0.45" />
            </filter>
          </defs>
          <g filter="url(#root-glow)">
            {/* Crosshair Outer Ring */}
            <circle cx="50" cy="50" r="37" stroke="url(#root-gold)" strokeWidth="2" strokeDasharray="14 4" />
            {/* Cyber Skull Face */}
            <path d="M30 42 C30 28 40 22 50 22 C60 22 70 28 70 42 C70 54 64 58 64 64 H36 C36 58 30 54 30 42 Z" fill="#12151C" stroke="url(#root-gold)" strokeWidth="2.5" />
            {/* Skull Eyes */}
            <ellipse cx="42" cy="42" rx="4.5" ry="6" fill="#FACC15" />
            <ellipse cx="58" cy="42" rx="4.5" ry="6" fill="#FACC15" />
            {/* Skull Teeth */}
            <path d="M42 64 V72 M50 64 V72 M58 64 V72" stroke="url(#root-gold)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Hash Root Symbol */}
            <text x="50" y="85" textAnchor="middle" fill="#FACC15" fontFamily="monospace" fontSize="10" fontWeight="bold"># root</text>
          </g>
        </svg>
      );

    case "crackmes":
      // Crackmes.one: Disassembler keygen chip with padlock unlocked & binary trace in purple
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "Crackmes.one Logo"}
        >
          <defs>
            <linearGradient id="crack-purple" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C084FC" />
              <stop offset="1" stopColor="#9333EA" />
            </linearGradient>
            <filter id="crack-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#A855F7" floodOpacity="0.4" />
            </filter>
          </defs>
          <g filter="url(#crack-glow)">
            <rect x="20" y="20" width="60" height="60" rx="10" fill="#12151C" stroke="url(#crack-purple)" strokeWidth="2.5" />
            {/* IC Chip Legs */}
            <line x1="14" y1="36" x2="20" y2="36" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="14" y1="50" x2="20" y2="50" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="14" y1="64" x2="20" y2="64" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="80" y1="36" x2="86" y2="36" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="80" y1="50" x2="86" y2="50" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="80" y1="64" x2="86" y2="64" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
            {/* Unlocked Key Symbol */}
            <circle cx="44" cy="48" r="8" stroke="#C084FC" strokeWidth="2.5" fill="none" />
            <path d="M52 48 H66 V56 M60 48 V54" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "underthewire":
      // UnderTheWire: Windows PowerShell 'PS >_' terminal chevron in cyan
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "UnderTheWire Logo"}
        >
          <defs>
            <linearGradient id="utw-cyan" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22D3EE" />
              <stop offset="1" stopColor="#0891B2" />
            </linearGradient>
            <filter id="utw-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#06B6D4" floodOpacity="0.45" />
            </filter>
          </defs>
          <g filter="url(#utw-glow)">
            <rect x="15" y="18" width="70" height="64" rx="8" fill="#0D1927" stroke="url(#utw-cyan)" strokeWidth="2.5" />
            <line x1="15" y1="34" x2="85" y2="34" stroke="#164E63" strokeWidth="1.5" />
            {/* Windows 4-Square Emblem */}
            <rect x="22" y="24" width="3" height="3" fill="#22D3EE" />
            <rect x="27" y="24" width="3" height="3" fill="#22D3EE" />
            <rect x="22" y="28" width="3" height="3" fill="#22D3EE" />
            <rect x="27" y="28" width="3" height="3" fill="#22D3EE" />
            {/* 'PS >' Text */}
            <text x="24" y="56" fill="#22D3EE" fontFamily="monospace" fontSize="16" fontWeight="bold">PS &gt;</text>
            <line x1="68" y1="56" x2="78" y2="56" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "exploit-education":
      // Exploit Education: Multi-arch processor CPU (ARM/MIPS/x86) in electric orange/amber
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "Exploit Education Logo"}
        >
          <defs>
            <linearGradient id="exp-orange" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FB923C" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
            <filter id="exp-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FB923C" floodOpacity="0.4" />
            </filter>
          </defs>
          <g filter="url(#exp-glow)">
            <rect x="22" y="22" width="56" height="56" rx="6" fill="#12151C" stroke="url(#exp-orange)" strokeWidth="2.5" />
            {/* CPU Pins */}
            <line x1="36" y1="14" x2="36" y2="22" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="14" x2="50" y2="22" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
            <line x1="64" y1="14" x2="64" y2="22" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
            <line x1="36" y1="78" x2="36" y2="86" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="78" x2="50" y2="86" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
            <line x1="64" y1="78" x2="64" y2="86" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
            {/* Silicon Die Core */}
            <rect x="34" y="34" width="32" height="32" rx="3" fill="#242936" stroke="#FB923C" strokeWidth="1.5" />
            {/* Exploit Lightning Spark */}
            <path d="M52 38 L44 50 H52 L48 62 L60 48 H52 Z" fill="#FB923C" />
          </g>
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label={ariaLabel || "Platform Logo"}
        >
          <rect x="20" y="20" width="60" height="60" rx="12" fill="#12151C" stroke="#22D3A0" strokeWidth="2" />
          <path d="M40 38 L50 48 L40 58 M52 58 H60" stroke="#22D3A0" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
}

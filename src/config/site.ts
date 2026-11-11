// Single source of truth for Site Configuration, URLs, and SEO Thresholds

export const CANONICAL_HOST = "https://walkthrough-by.samgirma.app";

export const SITE_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  // Enforce production canonical domain in production builds or when env points to localhost
  if (process.env.NODE_ENV === "production" || !envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
    if (process.env.NODE_ENV === "development" && envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
      return envUrl;
    }
    return CANONICAL_HOST;
  }
  return envUrl;
})();

export const SITE_NAME = "WriteupHub";
export const SITE_TAGLINE = "Verified CTF Writeups, CVE Exploits & Security Research";
export const SITE_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const SITE_DESCRIPTION =
  "Explore verified CTF writeups, zero-day CVE exploit guides, and vulnerability research built for CTF players, bug bounty hunters, and security analysts.";

export const DEFAULT_OG_IMAGE = "/og/og-default.png";

export const SOCIAL_HANDLES = {
  twitter: "@writeuphub",
  github: "https://github.com/samgirma/walkthrough-hub",
  telegram: "https://t.me/writeuphub",
} as const;

export const SEO_THRESHOLDS = {
  MIN_WORDS: 300,
  MIN_AUTHOR_AGE_DAYS: 3,
  MIN_HUB_WRITEUPS: 3,
  MAX_TITLE_CHARS: 60,
  MAX_DESC_CHARS: 155,
  MIN_DESC_CHARS: 110,
} as const;

export const siteConfig = {
  name: SITE_NAME,
  shortName: SITE_NAME,
  description: SITE_DESCRIPTION,
  tagline: SITE_TAGLINE,
  url: SITE_URL,
  ogImage: DEFAULT_OG_IMAGE,
  links: {
    github: SOCIAL_HANDLES.github,
    twitter: "https://twitter.com/writeuphub",
  },
  themeColors: {
    primary: "#22D3A0",
    primaryLight: "#50F0BB",
    secondary: "#38BDF8",
    background: "#0B0D12",
    surfaceDark: "#12151C",
    surfaceLight: "#F4F6FA",
    border: "#242936",
  },
} as const;

export type SiteConfig = typeof siteConfig;

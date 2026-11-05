export const siteConfig = {
  name: "WriteupHub",
  shortName: "WriteupHub",
  description:
    "The open platform where cybersecurity learners, CTF players, and exploit researchers dissect challenges, publish cryptographically verified walkthroughs, and level up together.",
  tagline: "CTF & Security Research Vault",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://walkthrough-by.samgirma.app",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/samgirma/walkthrough-hub",
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

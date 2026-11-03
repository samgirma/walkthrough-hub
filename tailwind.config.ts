import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#0B0D12",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Design system specific surface layers
        surface: {
          base: "#0B0D12",
          1: "#12151C",
          2: "#181C25",
          3: "#1D2027",
          dim: "#10131A",
          bright: "#363941",
        },
        // Stitch design border colors
        stroke: {
          DEFAULT: "#242936",
          focus: "#363E52",
        },
        // CTF category semantic colors
        category: {
          web: "#38BDF8",
          pwn: "#F43F5E",
          crypto: "#A855F7",
          reverse: "#FB923C",
          forensics: "#14B8A6",
          misc: "#94A3B8",
          osint: "#EAB308",
        },
        // CTF difficulty semantic colors
        difficulty: {
          easy: "#22C55E",
          medium: "#F59E0B",
          hard: "#EF4444",
          insane: "#EC4899",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "12px",
        "2xl": "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "glow-primary": "0 0 20px -3px rgba(34, 211, 160, 0.25)",
        "glow-primary-lg": "0 0 24px -2px rgba(34, 211, 160, 0.4)",
        "glow-cyan": "0 0 20px -3px rgba(56, 189, 248, 0.25)",
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(135deg, #22D3A0 0%, #38BDF8 100%)",
        "gradient-accent-hover": "linear-gradient(135deg, #38DFAB 0%, #60A5FA 100%)",
        "cyber-grid": "radial-gradient(#181C25 1px, transparent 1px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

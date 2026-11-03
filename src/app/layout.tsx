import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0B0D12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "WriteupHub // CTF & Security Research Publishing",
    template: "%s | WriteupHub",
  },
  description:
    "The open platform where cybersecurity learners, CTF players, and exploit researchers dissect challenges, publish cryptographically verified walkthroughs, and level up together.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "WriteupHub",
    title: "WriteupHub // CTF & Security Research Publishing",
    description:
      "The open platform where cybersecurity learners, CTF players, and exploit researchers dissect challenges, publish cryptographically verified walkthroughs, and level up together.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WriteupHub // CTF & Security Research Publishing",
    description:
      "The open platform where cybersecurity learners, CTF players, and exploit researchers dissect challenges, publish cryptographically verified walkthroughs, and level up together.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0B0D12] text-[#E0E2EC] min-h-screen selection:bg-[#22D3A0] selection:text-[#003828]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

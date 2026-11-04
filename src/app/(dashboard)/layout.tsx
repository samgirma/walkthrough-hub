import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Terminal,
  Grid,
  FileText,
  Bookmark,
  Settings,
  Plus,
  Search,
  ExternalLink,
  PenLine,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = session.user;
  const username = user.username || "author";

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: Grid },
    { label: "My Writeups", href: "/dashboard/writeups", icon: FileText },
    { label: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0D12] text-[#E0E2EC]">
      {/* Desktop Sidebar Navigation (Hidden on mobile) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#12151C] border-r border-[#242936] z-50 flex-col justify-between py-4">
        <div className="flex flex-col gap-4">
          {/* Logo Brand Header */}
          <div className="h-14 px-6 flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#22D3A0] to-[#38BDF8] flex items-center justify-center text-[#0B0D12]">
                <Terminal className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-base text-white tracking-tight leading-none">
                  Writeup<span className="text-[#22D3A0]">Hub</span>
                </span>
                <span className="font-mono text-[9px] text-[#475569] uppercase tracking-wider mt-0.5">
                  CTF Telemetry
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 font-mono text-xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:bg-[#181C25] hover:text-white transition-colors min-h-[40px]"
                >
                  <Icon className="h-4 w-4 text-[#94A3B8]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Indicator */}
        <div className="px-4 flex flex-col gap-2 font-mono text-xs">
          <Link
            href={`/u/${username}`}
            className="p-2.5 rounded-lg bg-[#0B0D12] hover:bg-[#181C25] border border-[#242936] flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-2 truncate">
              {user.image ? (
                <img
                  src={user.image}
                  alt={username}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-[10px]">
                  {username[0].toUpperCase()}
                </div>
              )}
              <span className="text-white text-xs truncate">
                @{username}
              </span>
            </div>
            <ExternalLink className="h-3 w-3 text-[#475569] group-hover:text-primary transition-colors" />
          </Link>

          <div className="bg-[#181C25] p-2 rounded-lg border border-[#242936] flex items-center justify-between text-[10px] text-[#475569]">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="uppercase">Node Active</span>
            </div>
            <span>v2.4.0-sec</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="pl-0 lg:pl-64 flex-1 flex flex-col min-h-screen pb-20 lg:pb-0 w-full">
        {/* Top Header */}
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-14 bg-[#12151C]/90 backdrop-blur-xl border-b border-[#242936] z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-1 max-w-sm sm:max-w-md">
            <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0 mr-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#22D3A0] to-[#38BDF8] flex items-center justify-center text-[#0B0D12]">
                <Terminal className="h-4 w-4 stroke-[2.5]" />
              </div>
            </Link>

            <div className="relative w-full flex items-center">
              <Search className="h-3.5 w-3.5 absolute left-3 text-[#475569]" />
              <input
                placeholder="Search writeups, payloads, CVEs..."
                className="w-full h-8 pl-8 pr-3 bg-[#0B0D12] border border-[#242936] rounded-lg text-xs text-white placeholder:text-[#475569] focus:outline-none focus:border-[#22D3A0]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
            <Link href="/write">
              <Button
                size="sm"
                className="h-8 gradient-cta text-[#0B0D12] font-mono font-bold text-xs gap-1 shadow-[0_0_16px_rgba(34,211,160,0.25)] min-h-[36px]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Writeup</span>
                <span className="sm:hidden">Write</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className="pt-14 p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (Dashboard, Writeups, New, Bookmarks, Settings) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[#12151C]/95 backdrop-blur-xl border-t border-[#242936] px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl"
      >
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center p-1 text-[#BACAC1] hover:text-white transition-colors min-h-[44px] min-w-[50px] rounded-lg"
        >
          <Grid className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-mono mt-0.5">Overview</span>
        </Link>

        <Link
          href="/dashboard/writeups"
          className="flex flex-col items-center justify-center p-1 text-[#BACAC1] hover:text-white transition-colors min-h-[44px] min-w-[50px] rounded-lg"
        >
          <FileText className="h-4 w-4 text-[#38BDF8]" />
          <span className="text-[10px] font-mono mt-0.5">Writeups</span>
        </Link>

        <Link
          href="/write"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[50px]"
        >
          <div className="w-10 h-10 rounded-full gradient-cta text-[#0B0D12] flex items-center justify-center shadow-[0_0_12px_rgba(34,211,160,0.4)]">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
        </Link>

        <Link
          href="/dashboard/bookmarks"
          className="flex flex-col items-center justify-center p-1 text-[#BACAC1] hover:text-white transition-colors min-h-[44px] min-w-[50px] rounded-lg"
        >
          <Bookmark className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] font-mono mt-0.5">Bookmarks</span>
        </Link>

        <Link
          href="/dashboard/settings"
          className="flex flex-col items-center justify-center p-1 text-[#BACAC1] hover:text-white transition-colors min-h-[44px] min-w-[50px] rounded-lg"
        >
          <Settings className="h-4 w-4 text-[#94A3B8]" />
          <span className="text-[10px] font-mono mt-0.5">Settings</span>
        </Link>
      </nav>
    </div>
  );
}

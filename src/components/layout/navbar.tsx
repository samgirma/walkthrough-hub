"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Search, PenLine, User, LogOut, LayoutDashboard, Bookmark, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/layout/search-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

interface NavbarProps {
  user?: {
    id: string;
    username: string;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { label: "Explore", href: "/explore" },
    { label: "Categories", href: "/explore?view=categories" },
    { label: "Events", href: "/explore?view=events" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0D12]/90 backdrop-blur-xl border-b border-[#242936]/60">
        <div className="h-16 max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#22D3A0] to-[#38BDF8] flex items-center justify-center text-[#0B0D12] shadow-[0_0_16px_rgba(34,211,160,0.4)] group-hover:shadow-[0_0_24px_rgba(34,211,160,0.6)] transition-all">
                <Terminal className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-lg tracking-tight text-white group-hover:text-[#50F0BB] transition-colors">
                  Writeup<span className="text-[#22D3A0]">Hub</span>
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      isActive
                        ? "bg-[#181C25] text-white font-semibold"
                        : "text-[#94A3B8] hover:bg-[#181C25] hover:text-[#E0E2EC]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search Trigger Command Bar */}
          <div className="flex-1 max-w-md hidden lg:block">
            <button
              onClick={() => setSearchOpen(true)}
              type="button"
              className="w-full h-10 px-3 rounded-xl bg-[#0B0D12] border border-[#242936] text-[#BACAC1] hover:border-[#363E52] transition-colors flex items-center justify-between text-xs font-sans group shadow-inner"
            >
              <div className="flex items-center gap-2.5 text-[#94A3B8]">
                <Search className="h-4 w-4 text-[#475569] group-hover:text-[#22D3A0] transition-colors" />
                <span>Search writeups, CVEs, authors, CTFs...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[#181C25] border border-[#242936] text-[10px] font-mono text-[#94A3B8] select-none">
                /
              </kbd>
            </button>
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              className="lg:hidden text-[#94A3B8]"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Link href="/write">
              <Button
                size="sm"
                className="gap-1.5 text-xs font-semibold gradient-cta text-[#0B0D12] shadow-[0_0_16px_rgba(34,211,160,0.25)] hover:shadow-[0_0_20px_rgba(34,211,160,0.4)]"
              >
                <PenLine className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Write a writeup</span>
                <span className="sm:hidden">Write</span>
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full border border-[#242936] bg-[#12151C] hover:border-[#363E52] transition-colors focus:outline-none">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#181C25] flex items-center justify-center text-primary text-xs font-mono font-bold">
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#12151C] border-[#242936] text-xs font-mono">
                  <div className="px-3 py-2 border-b border-[#242936]/60">
                    <p className="font-semibold text-white">@{user.username}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                      <span>Author Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${user.username}`} className="flex items-center gap-2 cursor-pointer">
                      <User className="h-3.5 w-3.5 text-secondary" />
                      <span>Public Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/bookmarks" className="flex items-center gap-2 cursor-pointer">
                      <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                      <span>Saved Bookmarks</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-3.5 w-3.5 text-[#94A3B8]" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#242936]" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 text-rose-400 focus:text-rose-300 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-mono text-[#BACAC1] hover:text-white">
                    Sign in
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

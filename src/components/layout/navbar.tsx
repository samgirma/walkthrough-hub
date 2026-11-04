"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Search,
  PenLine,
  User,
  LogOut,
  LayoutDashboard,
  Bookmark,
  Settings,
  Menu,
  X,
  Compass,
  FolderTree,
  Calendar,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/layout/search-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Hide navbar on scroll down, show on scroll up on mobile
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 60) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Categories", href: "/explore?view=categories", icon: FolderTree },
    { label: "Events", href: "/explore?view=events", icon: Calendar },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-[#0B0D12]/90 backdrop-blur-xl border-b border-[#242936]/60 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full md:translate-y-0"
        }`}
      >
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group tap-target">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#22D3A0] to-[#38BDF8] flex items-center justify-center text-[#0B0D12] shadow-[0_0_16px_rgba(34,211,160,0.4)] group-hover:shadow-[0_0_24px_rgba(34,211,160,0.6)] transition-all shrink-0">
                <Terminal className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-lg tracking-tight text-white group-hover:text-[#50F0BB] transition-colors leading-none">
                  Writeup<span className="text-[#22D3A0]">Hub</span>
                </span>
                <span className="font-mono text-[9px] text-[#94A3B8] tracking-widest hidden sm:inline">
                  CTF VAULT
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors min-h-[36px] flex items-center ${
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

          {/* Desktop Search Trigger Command Bar */}
          <div className="flex-1 max-w-md hidden lg:block">
            <button
              onClick={() => setSearchOpen(true)}
              type="button"
              className="w-full h-10 px-3 rounded-xl bg-[#0B0D12] border border-[#242936] text-[#BACAC1] hover:border-[#363E52] transition-colors flex items-center justify-between text-xs font-sans group shadow-inner focus:outline-none focus:ring-2 focus:ring-[#22D3A0]"
            >
              <div className="flex items-center gap-2.5 text-[#94A3B8]">
                <Search className="h-4 w-4 text-[#94A3B8] group-hover:text-[#22D3A0] transition-colors" />
                <span>Search writeups, CVEs, authors, CTFs...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[#181C25] border border-[#242936] text-[10px] font-mono text-[#94A3B8] select-none">
                /
              </kbd>
            </button>
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#181C25] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#22D3A0]"
              onClick={() => setSearchOpen(true)}
              aria-label="Search Writeups"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Desktop Write CTA */}
            <Link href="/write" className="hidden sm:inline-flex">
              <Button
                size="sm"
                className="gap-1.5 text-xs font-semibold gradient-cta text-[#0B0D12] shadow-[0_0_16px_rgba(34,211,160,0.25)] hover:shadow-[0_0_20px_rgba(34,211,160,0.4)] min-h-[40px]"
              >
                <PenLine className="h-3.5 w-3.5" />
                <span>Write</span>
              </Button>
            </Link>

            {/* Desktop User Dropdown */}
            {user ? (
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 p-1 rounded-full border border-[#242936] bg-[#12151C] hover:border-[#363E52] transition-colors focus:outline-none focus:ring-2 focus:ring-[#22D3A0] min-w-[44px] min-h-[44px] justify-center"
                      aria-label="User menu"
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#181C25] flex items-center justify-center text-primary text-xs font-mono font-bold">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-[#12151C] border-[#242936] text-xs font-mono"
                  >
                    <div className="px-3 py-2 border-b border-[#242936]/60">
                      <p className="font-semibold text-white">@{user.username}</p>
                      <p className="text-[11px] text-[#94A3B8] truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer py-2">
                        <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                        <span>Author Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/u/${user.username}`} className="flex items-center gap-2 cursor-pointer py-2">
                        <User className="h-3.5 w-3.5 text-secondary" />
                        <span>Public Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/bookmarks" className="flex items-center gap-2 cursor-pointer py-2">
                        <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                        <span>Saved Bookmarks</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer py-2">
                        <Settings className="h-3.5 w-3.5 text-[#94A3B8]" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#242936]" />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 text-rose-400 focus:text-rose-300 cursor-pointer py-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-mono text-[#BACAC1] hover:text-white min-h-[40px]"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] border border-[#242936] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#22D3A0]"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Command Search Palette */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile Slide-in Drawer Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-xs bg-[#12151C] border-l border-[#242936] p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <SheetHeader className="text-left pb-4 border-b border-[#242936]">
              <SheetTitle className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#22D3A0] to-[#38BDF8] flex items-center justify-center text-[#0B0D12]">
                  <Terminal className="h-4 w-4 stroke-[2.5]" />
                </div>
                <span className="font-sans font-bold text-base text-white">
                  Writeup<span className="text-[#22D3A0]">Hub</span>
                </span>
              </SheetTitle>
            </SheetHeader>

            {/* Primary Mobile "Write" Button */}
            <Link
              href="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button className="w-full min-h-[44px] gradient-cta text-[#0B0D12] font-bold text-sm gap-2 shadow-[0_0_16px_rgba(34,211,160,0.3)]">
                <PenLine className="h-4 w-4" />
                <span>Write a Writeup</span>
              </Button>
            </Link>

            {/* Main Navigation Links */}
            <div className="flex flex-col gap-1 font-mono text-sm">
              <span className="text-[10px] uppercase text-[#475569] font-semibold tracking-wider px-2 mb-1">
                Directory
              </span>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg min-h-[44px] transition-colors ${
                      isActive
                        ? "bg-[#181C25] text-white font-semibold border border-[#242936]"
                        : "text-[#BACAC1] hover:bg-[#181C25] hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-[#22D3A0]" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Links or Auth */}
            <div className="flex flex-col gap-1 font-mono text-sm pt-4 border-t border-[#242936]">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-[#0B0D12] rounded-lg border border-[#242936]">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-xs">
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="text-white font-semibold text-xs truncate">
                        @{user.username}
                      </span>
                      <span className="text-[10px] text-[#475569] truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] min-h-[44px]"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span>Author Dashboard</span>
                  </Link>

                  <Link
                    href={`/u/${user.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] min-h-[44px]"
                  >
                    <User className="h-4 w-4 text-secondary" />
                    <span>Public Profile</span>
                  </Link>

                  <Link
                    href="/dashboard/bookmarks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] min-h-[44px]"
                  >
                    <Bookmark className="h-4 w-4 text-amber-400" />
                    <span>Saved Bookmarks</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] min-h-[44px]"
                  >
                    <Settings className="h-4 w-4 text-[#94A3B8]" />
                    <span>Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-[#181C25] min-h-[44px] text-left mt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px] bg-[#181C25] border-[#242936] text-white font-mono text-xs gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button
                      variant="ghost"
                      className="w-full min-h-[44px] text-[#22D3A0] hover:bg-[#181C25] font-mono text-xs gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Create Account</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#242936] text-[11px] font-mono text-[#475569] flex items-center justify-between">
            <span>DARK MODE DEFAULT</span>
            <span className="text-[#22D3A0]">v2.4.0</span>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

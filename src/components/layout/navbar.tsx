"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  PenLine,
  Menu,
  Compass,
  FolderTree,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useIdleSession } from "@/lib/use-idle-session";
import { Logo } from "@/components/brand/Logo";
import { prefetchSearchIndex } from "@/lib/search-engine";

const SearchDialog = dynamic(
  () => import("@/components/layout/search-dialog").then((m) => m.SearchDialog),
  { ssr: false }
);

const UserMenu = dynamic(
  () => import("./user-menu").then((m) => m.UserMenu),
  {
    ssr: false,
    loading: () => (
      <div className="w-8 h-8 rounded-full bg-[#181C25] border border-[#242936] animate-pulse" />
    ),
  }
);

const MobileMenu = dynamic(
  () => import("./mobile-menu").then((m) => m.MobileMenu),
  { ssr: false }
);

interface NavbarProps {
  user?: {
    id: string;
    username?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  } | null;
}

export function Navbar({ user: initialUser }: NavbarProps) {
  const { user: idleUser, status, signOut } = useIdleSession();
  const user =
    initialUser ??
    (idleUser
      ? {
          id: idleUser.id,
          username: idleUser.username,
          email: idleUser.email,
          avatarUrl: idleUser.image,
          role: idleUser.role,
        }
      : null);

  const isLoading = status === "loading" && initialUser === undefined;
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Global Cmd/Ctrl+K and '/' keyboard shortcut for command palette search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    { label: "CVEs", href: "/cves", icon: ShieldAlert },
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
        <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Desktop: Horizontal Logo (height ~32px) */}
            <div className="hidden md:flex items-center">
              <Logo variant="horizontal" size={32} priority />
            </div>

            {/* Mobile: Icon-only Logo (height 32px) so it never crowds 360px screen */}
            <div className="flex md:hidden items-center">
              <Logo variant="icon" size={32} priority />
            </div>

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

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger (Desktop & Mobile) */}
            <button
              onClick={() => setSearchOpen(true)}
              onMouseEnter={prefetchSearchIndex}
              onTouchStart={prefetchSearchIndex}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12151C] border border-[#242936] text-[#94A3B8] hover:text-[#E0E2EC] hover:border-[#363E52] transition-colors text-xs font-mono min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#22D3A0]"
              aria-label="Open search dialog"
            >
              <Search className="h-4 w-4 text-[#22D3A0]" />
              <span className="hidden sm:inline">Search writeups...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#181C25] border border-[#242936] text-[10px] text-[#475569]">
                ⌘K
              </kbd>
            </button>

            {/* Write CTA Button (Desktop) */}
            <Link href="/write" className="hidden sm:block">
              <Button
                size="sm"
                className="gradient-cta text-[#0B0D12] font-semibold text-xs gap-1.5 min-h-[40px] px-3.5 shadow-[0_0_12px_rgba(34,211,160,0.2)] hover:shadow-[0_0_16px_rgba(34,211,160,0.4)] transition-all font-mono"
              >
                <PenLine className="h-3.5 w-3.5" />
                <span>Write</span>
              </Button>
            </Link>

            {/* Desktop User Dropdown / Loading Skeleton / Sign in */}
            {isLoading ? (
              <div className="hidden sm:flex items-center justify-center min-w-[44px] min-h-[44px]">
                <div className="w-8 h-8 rounded-full bg-[#181C25] border border-[#242936] animate-pulse" />
              </div>
            ) : user ? (
              <div className="hidden sm:block">
                <UserMenu user={user} signOut={signOut} />
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
      {searchOpen && (
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      )}

      {/* Mobile Slide-in Drawer Sheet */}
      {mobileMenuOpen && (
        <MobileMenu
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          user={user}
          isLoading={isLoading}
          navLinks={navLinks}
          pathname={pathname}
          signOut={signOut}
        />
      )}
    </>
  );
}

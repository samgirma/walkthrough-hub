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
  ShieldAlert,
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
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/brand/Logo";

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
  const { data: session, status } = useSession();
  const user = initialUser ?? (session?.user ? {
    id: session.user.id,
    username: session.user.username,
    email: session.user.email,
    avatarUrl: session.user.image,
    role: session.user.role,
  } : null);

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

  // Global '/' keyboard shortcut for command palette search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

          {/* Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop User Dropdown / Loading Skeleton / Sign in */}
            {isLoading ? (
              <div className="hidden sm:flex items-center justify-center min-w-[44px] min-h-[44px]">
                <div className="w-8 h-8 rounded-full bg-[#181C25] border border-[#242936] animate-pulse" />
              </div>
            ) : user ? (
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
                          alt={user.username || "user"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#181C25] flex items-center justify-center text-primary text-xs font-mono font-bold">
                          {(user.username || "U").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-[#12151C] border-[#242936] text-xs font-mono"
                  >
                    <div className="px-3 py-2 border-b border-[#242936]/60">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <p className="font-semibold text-white truncate">@{user.username || "anonymous"}</p>
                        {user.role === "ADMIN" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                            ADMIN
                          </span>
                        )}
                      </div>
                      {user.email ? (
                        <p className="text-[11px] text-[#94A3B8] truncate">{user.email}</p>
                      ) : (
                        <p className="text-[10px] text-[#22D3A0] font-mono">Telegram Verified</p>
                      )}
                    </div>
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/admin" className="flex items-center gap-2 cursor-pointer py-2 text-amber-400 focus:text-amber-300">
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                          <span>Admin Console</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer py-2">
                        <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                        <span>Author Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={user.username ? `/u/${user.username}` : "/dashboard"} className="flex items-center gap-2 cursor-pointer py-2">
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
              <SheetTitle className="flex items-center">
                <Logo variant="horizontal" size={28} />
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
              {isLoading ? (
                <div className="h-12 w-full rounded-lg bg-[#0B0D12] border border-[#242936] animate-pulse mb-2" />
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-[#0B0D12] rounded-lg border border-[#242936]">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username || "user"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-xs">
                        {(user.username || "U").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col truncate flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-white font-semibold text-xs truncate">
                          @{user.username || "anonymous"}
                        </span>
                        {user.role === "ADMIN" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                            ADMIN
                          </span>
                        )}
                      </div>
                      {user.email ? (
                        <span className="text-[10px] text-[#475569] truncate">
                          {user.email}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#22D3A0] font-mono">
                          Telegram Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {user.role === "ADMIN" && (
                    <Link
                      href="/dashboard/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 min-h-[44px] border border-amber-500/20 mb-1"
                    >
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                      <span>Admin Console</span>
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] min-h-[44px]"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span>Author Dashboard</span>
                  </Link>

                  <Link
                    href={user.username ? `/u/${user.username}` : "/dashboard"}
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

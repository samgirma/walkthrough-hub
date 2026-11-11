"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PenLine,
  User,
  LogOut,
  LayoutDashboard,
  Bookmark,
  Settings,
  ShieldAlert,
  LogIn,
  UserPlus,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { UserMenuUser } from "./user-menu";

interface NavLinkItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserMenuUser | null;
  isLoading: boolean;
  navLinks: NavLinkItem[];
  pathname: string;
  signOut: (options?: { callbackUrl?: string }) => void;
}

export function MobileMenu({
  open,
  onOpenChange,
  user,
  isLoading,
  navLinks,
  pathname,
  signOut,
}: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[85vw] max-w-xs bg-[#12151C] border-l border-[#242936] p-6 flex flex-col justify-between"
      >
        <div className="flex flex-col gap-6">
          <SheetHeader className="text-left pb-4 border-b border-[#242936]">
            <SheetTitle className="flex items-center">
              <Logo variant="horizontal" size={28} decorative />
            </SheetTitle>
          </SheetHeader>

          {/* Primary Mobile "Write" Button */}
          <Link
            href="/write"
            onClick={() => onOpenChange(false)}
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
                  onClick={() => onOpenChange(false)}
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
                    <Image
                      src={user.avatarUrl}
                      alt={user.username || "user"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                      unoptimized
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
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 min-h-[44px] border border-amber-500/20 mb-1"
                  >
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    <span>Admin Console</span>
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] min-h-[44px]"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span>Author Dashboard</span>
                </Link>

                <Link
                  href={user.username ? `/u/${user.username}` : "/dashboard"}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] min-h-[44px]"
                >
                  <User className="h-4 w-4 text-secondary" />
                  <span>Public Profile</span>
                </Link>

                <Link
                  href="/dashboard/bookmarks"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] min-h-[44px]"
                >
                  <Bookmark className="h-4 w-4 text-amber-400" />
                  <span>Saved Bookmarks</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] min-h-[44px]"
                >
                  <Settings className="h-4 w-4 text-[#94A3B8]" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={() => {
                    onOpenChange(false);
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
                  onClick={() => onOpenChange(false)}
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
                  onClick={() => onOpenChange(false)}
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
  );
}

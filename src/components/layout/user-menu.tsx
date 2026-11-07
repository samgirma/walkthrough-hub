"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  LayoutDashboard,
  Bookmark,
  Settings,
  ShieldAlert,
} from "lucide-react";

export interface UserMenuUser {
  id: string;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
}

interface UserMenuProps {
  user: UserMenuUser;
  signOut: (options?: { callbackUrl?: string }) => void;
}

export function UserMenu({ user, signOut }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#22D3A0]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#22D3A0] min-w-[36px] min-h-[36px]"
          aria-label="User Account Menu"
        >
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.username || "user"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border border-[#242936]"
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#181C25] border border-[#242936] text-primary flex items-center justify-center font-bold text-xs">
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
  );
}

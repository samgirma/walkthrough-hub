"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  Bookmark,
  ShieldAlert,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface DashboardUserMenuProps {
  user: {
    id: string;
    username: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export function DashboardUserMenu({ user }: DashboardUserMenuProps) {
  const username = user.username || "anonymous";
  const avatarSrc = user.image;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 p-1 rounded-full border border-[#242936] bg-[#0B0D12] hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-w-[36px] min-h-[36px] justify-center cursor-pointer group"
          aria-label={`User menu for @${username}`}
        >
          <div className="relative">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold font-mono text-xs">
                {username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0B0D12]" />
          </div>
          <span className="hidden md:inline text-xs font-mono text-[#BACAC1] group-hover:text-white transition-colors truncate max-w-[120px] pr-1">
            @{username}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-[#12151C] border-[#242936] text-xs font-mono"
      >
        <div className="px-3 py-2 border-b border-[#242936]/60">
          <div className="flex items-center justify-between gap-1.5 mb-0.5">
            <p className="font-semibold text-white truncate">@{username}</p>
            {user.role === "ADMIN" && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                ADMIN
              </span>
            )}
          </div>
          {user.email && (
            <p className="text-[11px] text-[#94A3B8] truncate">{user.email}</p>
          )}
        </div>

        {user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-2 cursor-pointer py-2 text-amber-400 focus:text-amber-300"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin Console</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link
            href={user.username ? `/u/${user.username}` : "/dashboard"}
            className="flex items-center gap-2 cursor-pointer py-2 text-[#E0E2EC]"
          >
            <User className="h-3.5 w-3.5 text-secondary" />
            <span>Public Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/bookmarks"
            className="flex items-center gap-2 cursor-pointer py-2 text-[#E0E2EC]"
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
            <span>Saved Bookmarks</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 cursor-pointer py-2 text-[#E0E2EC]"
          >
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

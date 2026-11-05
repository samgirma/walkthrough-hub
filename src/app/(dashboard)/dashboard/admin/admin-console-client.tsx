"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  FileText,
  Eye,
  Bookmark,
  Activity,
  Server,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  UserCheck,
  UserX,
  ExternalLink,
  Search,
  Filter,
  Lock,
  RefreshCw,
  Loader2,
  Calendar,
  Layers,
  Globe,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCompactNumber, formatDate } from "@/lib/utils";
import type {
  AdminStats,
  AdminUserListItem,
  AdminWriteupListItem,
} from "@/server/admin.service";
import {
  updateUserRoleAction,
  deleteUserAction,
  adminUpdateWriteupStatusAction,
  adminDeleteWriteupAction,
} from "@/server/admin.actions";
import { Role, Status, Category } from "@prisma/client";

interface AdminConsoleClientProps {
  currentAdminId: string;
  stats: AdminStats;
  initialUsers: AdminUserListItem[];
  initialWriteups: AdminWriteupListItem[];
  enabledProviders: Record<string, boolean>;
}

export function AdminConsoleClient({
  currentAdminId,
  stats,
  initialUsers,
  initialWriteups,
  enabledProviders,
}: AdminConsoleClientProps) {
  const [users, setUsers] = useState<AdminUserListItem[]>(initialUsers);
  const [writeups, setWriteups] = useState<AdminWriteupListItem[]>(initialWriteups);

  // Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");

  const [writeupSearch, setWriteupSearch] = useState("");
  const [writeupStatusFilter, setWriteupStatusFilter] = useState<"ALL" | Status>("ALL");
  const [writeupCategoryFilter, setWriteupCategoryFilter] = useState<"ALL" | Category>("ALL");

  // Async Pending State
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dialog States
  const [roleModalUser, setRoleModalUser] = useState<AdminUserListItem | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserListItem | null>(null);
  const [deleteModalWriteup, setDeleteModalWriteup] = useState<AdminWriteupListItem | null>(null);

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !userSearch.trim() ||
      (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());

    const matchesRole =
      userRoleFilter === "ALL" || u.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  // Filtered Writeups List
  const filteredWriteups = writeups.filter((w) => {
    const matchesSearch =
      !writeupSearch.trim() ||
      w.title.toLowerCase().includes(writeupSearch.toLowerCase()) ||
      w.ctfName.toLowerCase().includes(writeupSearch.toLowerCase()) ||
      (w.author.username && w.author.username.toLowerCase().includes(writeupSearch.toLowerCase())) ||
      w.slug.toLowerCase().includes(writeupSearch.toLowerCase());

    const matchesStatus =
      writeupStatusFilter === "ALL" || w.status === writeupStatusFilter;

    const matchesCategory =
      writeupCategoryFilter === "ALL" || w.category === writeupCategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handlers
  const handleRoleToggle = (targetUser: AdminUserListItem) => {
    const newRole: Role = targetUser.role === "ADMIN" ? "USER" : "ADMIN";
    startTransition(async () => {
      try {
        const res = await updateUserRoleAction(targetUser.id, newRole);
        if (res.success) {
          setUsers((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
          );
          setActionMessage({
            type: "success",
            text: `Successfully updated @${targetUser.username} to ${newRole}.`,
          });
        }
      } catch (err: any) {
        setActionMessage({
          type: "error",
          text: err.message || "Failed to update user role.",
        });
      } finally {
        setRoleModalUser(null);
      }
    });
  };

  const handleDeleteUser = (targetUser: AdminUserListItem) => {
    startTransition(async () => {
      try {
        const res = await deleteUserAction(targetUser.id);
        if (res.success) {
          setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
          setActionMessage({
            type: "success",
            text: `Successfully purged user account @${targetUser.username}.`,
          });
        }
      } catch (err: any) {
        setActionMessage({
          type: "error",
          text: err.message || "Failed to delete user account.",
        });
      } finally {
        setDeleteModalUser(null);
      }
    });
  };

  const handleUpdateWriteupStatus = (writeupId: string, newStatus: Status) => {
    startTransition(async () => {
      try {
        const res = await adminUpdateWriteupStatusAction(writeupId, newStatus);
        if (res.success) {
          setWriteups((prev) =>
            prev.map((w) => (w.id === writeupId ? { ...w, status: newStatus } : w))
          );
          setActionMessage({
            type: "success",
            text: `Updated writeup visibility to ${newStatus}.`,
          });
        }
      } catch (err: any) {
        setActionMessage({
          type: "error",
          text: err.message || "Failed to update writeup status.",
        });
      }
    });
  };

  const handleDeleteWriteup = (targetWriteup: AdminWriteupListItem) => {
    startTransition(async () => {
      try {
        const res = await adminDeleteWriteupAction(targetWriteup.id);
        if (res.success) {
          setWriteups((prev) => prev.filter((w) => w.id !== targetWriteup.id));
          setActionMessage({
            type: "success",
            text: `Moderation complete: Purged "${targetWriteup.title}".`,
          });
        }
      } catch (err: any) {
        setActionMessage({
          type: "error",
          text: err.message || "Failed to delete writeup.",
        });
      } finally {
        setDeleteModalWriteup(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-amber-500/25 bg-[#12151C]/90 shadow-lg">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="font-sans font-bold text-2xl text-white tracking-tight">
              Admin Console
            </h1>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Root Privilege
            </span>
          </div>
          <p className="font-sans text-xs text-[#94A3B8] max-w-2xl">
            Centralized operations hub for researcher user accounts, platform-wide CTF writeup content moderation, and infrastructure health.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#94A3B8] bg-[#0B0D12] px-3 py-1.5 rounded-lg border border-[#242936] self-start sm:self-auto">
          <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>Active Node: Supabase pg-pool</span>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionMessage && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg border font-mono text-xs ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/25 text-[#50F0BB]"
              : "bg-rose-500/10 border-rose-500/25 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-[11px] underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Tabs Container */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#12151C] border border-[#242936] p-1 gap-1">
          <TabsTrigger value="overview" className="gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Platform Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>User Management ({users.length})</span>
          </TabsTrigger>
          <TabsTrigger value="moderation" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Writeup Moderation ({writeups.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* =========================================================================
            TAB 1: OVERVIEW & SYSTEM DIAGNOSTICS
            ========================================================================= */}
        <TabsContent value="overview" className="mt-4 flex flex-col gap-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2 text-[#475569] font-mono text-[11px] uppercase">
                <span>Total Researchers</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-sans font-bold text-3xl text-white">
                  {stats.totalUsers}
                </span>
                <span className="font-mono text-[11px] text-amber-400">
                  {stats.adminUsers} Admins
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-mono">
                {stats.totalUsers - stats.adminUsers} standard accounts
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2 text-[#475569] font-mono text-[11px] uppercase">
                <span>Total Writeups</span>
                <FileText className="h-4 w-4 text-[#38BDF8]" />
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-sans font-bold text-3xl text-white">
                  {stats.totalWriteups}
                </span>
                <span className="font-mono text-[11px] text-emerald-400">
                  {stats.publicWriteups} Public
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-mono">
                {stats.unlistedWriteups} Unlisted // {stats.draftWriteups} Drafts
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2 text-[#475569] font-mono text-[11px] uppercase">
                <span>Global Views</span>
                <Eye className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-sans font-bold text-3xl text-white">
                  {formatCompactNumber(stats.totalViews)}
                </span>
                <span className="font-mono text-[11px] text-purple-400">
                  Live Readers
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-mono">
                Aggregated CTF impressions
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2 text-[#475569] font-mono text-[11px] uppercase">
                <span>Bookmarks Saved</span>
                <Bookmark className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-sans font-bold text-3xl text-white">
                  {stats.totalBookmarks}
                </span>
                <span className="font-mono text-[11px] text-amber-400">
                  Community
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-mono">
                High-value payload saves
              </p>
            </div>
          </div>

          {/* Infrastructure Health & Auth Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* System Status */}
            <div className="p-5 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#242936] pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  <h3 className="font-sans font-bold text-sm text-white">
                    Platform Infrastructure Diagnostics
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ALL SYSTEMS NOMINAL
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#242936]/60">
                  <span className="text-[#94A3B8]">Database Architecture</span>
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Supabase PostgreSQL (AWS us-east-1)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#242936]/60">
                  <span className="text-[#94A3B8]">Security Strategy</span>
                  <span className="text-white">Auth.js v5 (Edge-Safe Split + JWE)</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#242936]/60">
                  <span className="text-[#94A3B8]">Session Cookie Encryption</span>
                  <span className="text-white">AES-256-GCM / 30-Day TTL</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#242936]/60">
                  <span className="text-[#94A3B8]">Authorization Boundary</span>
                  <span className="text-white">React cache() DAL + requireRole()</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#94A3B8]">Application Framework</span>
                  <span className="text-white">Next.js 15 App Router (Turbopack)</span>
                </div>
              </div>
            </div>

            {/* Auth Providers Status */}
            <div className="p-5 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#242936] pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#38BDF8]" />
                  <h3 className="font-sans font-bold text-sm text-white">
                    Authentication Gateways
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  Runtime Handlers
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#0B0D12] border border-[#242936] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-semibold text-xs text-white">Google OAuth</span>
                    {enabledProviders.google ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#475569]" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#94A3B8]">
                    {enabledProviders.google ? "OIDC Active / Auto-Link" : "Disabled (Missing credentials)"}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0B0D12] border border-[#242936] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-semibold text-xs text-white">GitHub OAuth</span>
                    {enabledProviders.github ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#475569]" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#94A3B8]">
                    {enabledProviders.github ? "OAuth 2.0 Active" : "Disabled (Missing credentials)"}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0B0D12] border border-[#242936] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-semibold text-xs text-white">Telegram Widget</span>
                    {enabledProviders.telegram ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#475569]" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#94A3B8]">
                    {enabledProviders.telegram ? "HMAC Replay Guard Active" : "Disabled (Missing Bot token)"}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0B0D12] border border-[#242936] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-semibold text-xs text-white">Dev Bypass</span>
                    {enabledProviders.dev ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#475569]" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#94A3B8]">
                    {enabledProviders.dev ? "Enabled (Local dev only)" : "Inactive in Production"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <div className="p-5 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col gap-3">
            <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>CTF Category Exploits Distribution</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
              {stats.categoryDistribution.map((item) => (
                <div
                  key={item.category}
                  className="p-3 rounded-lg bg-[#0B0D12] border border-[#242936] flex flex-col gap-1 text-center"
                >
                  <span className="text-[11px] font-mono font-bold text-[#BACAC1]">
                    {item.category}
                  </span>
                  <span className="text-xl font-bold font-sans text-white">
                    {item.count}
                  </span>
                  <span className="text-[10px] font-mono text-[#475569]">
                    writeups
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            TAB 2: USER MANAGEMENT
            ========================================================================= */}
        <TabsContent value="users" className="mt-4 flex flex-col gap-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-[#242936] bg-[#12151C]">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input
                type="text"
                placeholder="Search by username, email, name, or cuid..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-[#0B0D12] border border-[#242936] rounded-lg text-xs font-mono text-white placeholder:text-[#475569] focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto font-mono text-xs">
              <span className="text-[11px] text-[#475569] mr-1 hidden sm:inline">Role:</span>
              <button
                onClick={() => setUserRoleFilter("ALL")}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  userRoleFilter === "ALL"
                    ? "bg-[#181C25] text-white border border-[#242936]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setUserRoleFilter("ADMIN")}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  userRoleFilter === "ADMIN"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-[#94A3B8] hover:text-amber-400"
                }`}
              >
                Admins ({users.filter((u) => u.role === "ADMIN").length})
              </button>
              <button
                onClick={() => setUserRoleFilter("USER")}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  userRoleFilter === "USER"
                    ? "bg-[#181C25] text-white border border-[#242936]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Users ({users.filter((u) => u.role === "USER").length})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl border border-[#242936] bg-[#12151C] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#0B0D12] border-b border-[#242936] text-[10px] text-[#94A3B8] uppercase">
                  <tr>
                    <th className="py-3 px-4">Researcher Profile</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3 text-center">Writeups</th>
                    <th className="py-3 px-3 text-center">Bookmarks</th>
                    <th className="py-3 px-3">Registered</th>
                    <th className="py-3 px-4 text-right">Privilege Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242936]/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                        No researchers found matching the query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isCurrentSession = user.id === currentAdminId;
                      const avatarSrc = user.avatarUrl || user.image;

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-[#181C25]/50 transition-colors"
                        >
                          {/* Profile Column */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {avatarSrc ? (
                                <img
                                  src={avatarSrc}
                                  alt={user.username || "User avatar"}
                                  className="w-8 h-8 rounded-full object-cover border border-[#242936]"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-xs border border-[#242936]">
                                  {(user.username || "U").slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="flex flex-col truncate max-w-[200px]">
                                <span className="font-bold text-white text-xs truncate">
                                  @{user.username || "anonymous"}
                                </span>
                                <span className="text-[10px] text-[#94A3B8] truncate">
                                  {user.email || "No email linked"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role Column */}
                          <td className="py-3 px-3">
                            {user.role === "ADMIN" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                ADMIN
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider bg-[#181C25] text-[#BACAC1] border border-[#242936]">
                                USER
                              </span>
                            )}
                          </td>

                          {/* Writeups Count */}
                          <td className="py-3 px-3 text-center text-white">
                            {user.writeupCount}
                          </td>

                          {/* Bookmarks Count */}
                          <td className="py-3 px-3 text-center text-[#94A3B8]">
                            {user.bookmarkCount}
                          </td>

                          {/* Registered Date */}
                          <td className="py-3 px-3 text-[#94A3B8] text-[11px]">
                            {formatDate(user.createdAt)}
                          </td>

                          {/* Privilege Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isCurrentSession ? (
                                <span className="px-2 py-1 rounded bg-[#181C25] text-[#94A3B8] text-[10px] flex items-center gap-1 border border-[#242936]">
                                  <Lock className="w-3 h-3" />
                                  <span>You (Current)</span>
                                </span>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setRoleModalUser(user)}
                                    className={`h-7 px-2 text-[10px] font-mono ${
                                      user.role === "ADMIN"
                                        ? "text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
                                        : "text-amber-400 hover:text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                                    }`}
                                  >
                                    {user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeleteModalUser(user)}
                                    className="h-7 w-7 p-0 text-[#475569] hover:text-rose-400 hover:bg-rose-500/10"
                                    title="Purge User Account"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            TAB 3: WRITEUP MODERATION
            ========================================================================= */}
        <TabsContent value="moderation" className="mt-4 flex flex-col gap-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-[#242936] bg-[#12151C]">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input
                type="text"
                placeholder="Search by title, CTF event, author..."
                value={writeupSearch}
                onChange={(e) => setWriteupSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-[#0B0D12] border border-[#242936] rounded-lg text-xs font-mono text-white placeholder:text-[#475569] focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto font-mono text-xs">
              <button
                onClick={() => setWriteupStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  writeupStatusFilter === "ALL"
                    ? "bg-[#181C25] text-white border border-[#242936]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                All ({writeups.length})
              </button>
              <button
                onClick={() => setWriteupStatusFilter("PUBLIC")}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  writeupStatusFilter === "PUBLIC"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-[#94A3B8] hover:text-emerald-400"
                }`}
              >
                Public ({writeups.filter((w) => w.status === "PUBLIC").length})
              </button>
              <button
                onClick={() => setWriteupStatusFilter("UNLISTED")}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  writeupStatusFilter === "UNLISTED"
                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                    : "text-[#94A3B8] hover:text-sky-400"
                }`}
              >
                Unlisted ({writeups.filter((w) => w.status === "UNLISTED").length})
              </button>
              <button
                onClick={() => setWriteupStatusFilter("DRAFT")}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  writeupStatusFilter === "DRAFT"
                    ? "bg-[#181C25] text-[#BACAC1] border border-[#242936]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Drafts ({writeups.filter((w) => w.status === "DRAFT").length})
              </button>
            </div>
          </div>

          {/* Moderation Table */}
          <div className="rounded-xl border border-[#242936] bg-[#12151C] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#0B0D12] border-b border-[#242936] text-[10px] text-[#94A3B8] uppercase">
                  <tr>
                    <th className="py-3 px-4">Exploit Writeup</th>
                    <th className="py-3 px-3">Author</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Visibility</th>
                    <th className="py-3 px-3 text-center">Reads</th>
                    <th className="py-3 px-4 text-right">Moderation Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242936]/60">
                  {filteredWriteups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                        No writeups found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredWriteups.map((w) => (
                      <tr
                        key={w.id}
                        className="hover:bg-[#181C25]/50 transition-colors"
                      >
                        {/* Title & CTF Name */}
                        <td className="py-3 px-4 max-w-sm">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-xs truncate">
                              {w.title}
                            </span>
                            <span className="text-[10px] text-[#94A3B8] truncate">
                              {w.ctfName} {w.ctfYear} • /{w.slug}
                            </span>
                          </div>
                        </td>

                        {/* Author */}
                        <td className="py-3 px-3">
                          <Link
                            href={w.author.username ? `/u/${w.author.username}` : "#"}
                            className="text-primary hover:underline"
                          >
                            @{w.author.username || "anonymous"}
                          </Link>
                        </td>

                        {/* Category & Difficulty */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Badge variant={w.category.toLowerCase() as any} className="text-[9px]">
                              {w.category}
                            </Badge>
                            <span className="text-[10px] text-[#475569] uppercase">
                              {w.difficulty}
                            </span>
                          </div>
                        </td>

                        {/* Status Switcher */}
                        <td className="py-3 px-3">
                          <select
                            value={w.status}
                            onChange={(e) => handleUpdateWriteupStatus(w.id, e.target.value as Status)}
                            className="bg-[#0B0D12] text-xs font-mono text-white border border-[#242936] rounded px-2 py-1 focus:outline-none focus:border-primary"
                          >
                            <option value="PUBLIC">PUBLIC</option>
                            <option value="UNLISTED">UNLISTED</option>
                            <option value="DRAFT">DRAFT</option>
                          </select>
                        </td>

                        {/* Views */}
                        <td className="py-3 px-3 text-center text-white">
                          {formatCompactNumber(w.viewCount)}
                        </td>

                        {/* Controls */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {w.author.username && (
                              <Link
                                href={`/w/${w.author.username}/${w.slug}`}
                                target="_blank"
                                className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#181C25] transition-colors"
                                title="View Public Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteModalWriteup(w)}
                              className="h-7 w-7 p-0 text-[#475569] hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete Writeup"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Role Toggle Confirmation Modal */}
      <Dialog open={!!roleModalUser} onOpenChange={() => setRoleModalUser(null)}>
        <DialogContent className="bg-[#12151C] border-[#242936] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <span>Modify Administrative Privileges</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-mono pt-2">
              Are you sure you want to change the role of{" "}
              <strong className="text-white">@{roleModalUser?.username}</strong> to{" "}
              <strong className="text-amber-400">
                {roleModalUser?.role === "ADMIN" ? "USER" : "ADMIN"}
              </strong>
              ?
              {roleModalUser?.role === "USER" && (
                <span className="block mt-2 text-amber-300">
                  Granting ADMIN role gives this researcher full access to the Admin Console, including user management and platform writeup moderation.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleModalUser(null)}
              className="text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => roleModalUser && handleRoleToggle(roleModalUser)}
              className="gradient-cta text-[#0B0D12] text-xs font-mono font-bold"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Confirm Role Change"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Account Confirmation Modal */}
      <Dialog open={!!deleteModalUser} onOpenChange={() => setDeleteModalUser(null)}>
        <DialogContent className="bg-[#12151C] border-rose-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <span>Purge Researcher Account</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-mono pt-2">
              This action is <strong className="text-rose-400">irreversible</strong>. Deleting{" "}
              <strong className="text-white">@{deleteModalUser?.username}</strong> will permanently remove all their published writeups, bookmarks, and connected accounts from WriteupHub.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalUser(null)}
              className="text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteModalUser && handleDeleteUser(deleteModalUser)}
              className="text-xs font-mono bg-rose-600 hover:bg-rose-500 text-white"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Permanently Purge User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Writeup Confirmation Modal */}
      <Dialog open={!!deleteModalWriteup} onOpenChange={() => setDeleteModalWriteup(null)}>
        <DialogContent className="bg-[#12151C] border-rose-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <span>Moderation: Purge Exploit Documentation</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-mono pt-2">
              Are you sure you want to delete{" "}
              <strong className="text-white">&quot;{deleteModalWriteup?.title}&quot;</strong> by{" "}
              <strong className="text-primary">@{deleteModalWriteup?.author.username}</strong>?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalWriteup(null)}
              className="text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteModalWriteup && handleDeleteWriteup(deleteModalWriteup)}
              className="text-xs font-mono bg-rose-600 hover:bg-rose-500 text-white"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Purge Writeup"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

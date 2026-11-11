import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOnboarded } from "@/server/auth/dal";
import { getUserById } from "@/server/auth.service";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";
import { ConnectedAccounts } from "./connected-accounts";
import { DeleteAccountCard } from "./delete-account-card";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Author Settings",
  canonicalPath: "/dashboard/settings",
  noindex: true,
  nofollow: true,
});

export default async function SettingsPage() {
  const currentUser = await requireOnboarded("/dashboard/settings");

  const [user, accounts] = await Promise.all([
    getUserById(currentUser.id),
    prisma.account.findMany({
      where: { userId: currentUser.id },
      select: { provider: true },
    }),
  ]);

  if (!user) {
    notFound();
  }

  const linkedProviders = accounts.map((a) => a.provider.toLowerCase());

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-sans font-bold text-2xl text-white tracking-tight">
          Account & Profile Settings
        </h1>
        <p className="text-sm text-slate-400">
          Manage your public CTF author identity, connected accounts, and preferences.
        </p>
      </div>

      <ConnectedAccounts linkedProviders={linkedProviders} />

      <SettingsForm user={user} />

      <DeleteAccountCard username={user.username} />
    </div>
  );
}

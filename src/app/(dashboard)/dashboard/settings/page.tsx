import React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById } from "@/server/auth.service";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Author Settings // WriteupHub",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-sans font-bold text-2xl text-white tracking-tight">
          Account & Profile Settings
        </h1>
        <p className="text-sm text-slate-400">
          Manage your public CTF author identity, linked GitHub profile, and preferences.
        </p>
      </div>

      <SettingsForm user={user} />
    </div>
  );
}

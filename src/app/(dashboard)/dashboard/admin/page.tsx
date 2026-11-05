import React from "react";
import { Metadata } from "next";
import { requireRole } from "@/server/auth/dal";
import { getAdminStats, getAdminUsers, getAdminWriteups } from "@/server/admin.service";
import { getEnabledProviders } from "@/env";
import { AdminConsoleClient } from "./admin-console-client";

export const metadata: Metadata = {
  title: "Admin Console // WriteupHub Operations",
};

export default async function AdminDashboardPage() {
  const admin = await requireRole("ADMIN", "/dashboard");

  const [stats, usersData, writeupsData] = await Promise.all([
    getAdminStats(),
    getAdminUsers({ limit: 100 }),
    getAdminWriteups({ limit: 100 }),
  ]);

  const enabledProviders = getEnabledProviders();

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      <AdminConsoleClient
        currentAdminId={admin.id}
        stats={stats}
        initialUsers={usersData.users}
        initialWriteups={writeupsData.writeups}
        enabledProviders={enabledProviders}
      />
    </div>
  );
}

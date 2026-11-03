import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0D12] text-[#E0E2EC]">
      <Navbar
        user={
          session?.user
            ? {
                id: session.user.id,
                username: session.user.username,
                email: session.user.email,
                avatarUrl: session.user.image,
              }
            : null
        }
      />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

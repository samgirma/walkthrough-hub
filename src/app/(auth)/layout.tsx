import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 w-full min-h-[100svh] bg-[#0B0D12] text-[#E0E2EC] overflow-x-hidden">
      {children}
    </div>
  );
}

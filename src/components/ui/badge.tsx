import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "border border-emerald-500/25 bg-emerald-500/10 text-[#50F0BB]",
        secondary:
          "border border-[#242936] bg-[#181C25] text-[#BACAC1] hover:bg-[#1D2027]",
        destructive:
          "border border-rose-500/25 bg-rose-500/10 text-rose-400",
        outline:
          "border border-[#242936] text-[#94A3B8]",
        web:
          "border border-sky-500/25 bg-sky-500/10 text-[#38BDF8]",
        pwn:
          "border border-rose-500/25 bg-rose-500/10 text-[#F43F5E]",
        crypto:
          "border border-purple-500/25 bg-purple-500/10 text-[#A855F7]",
        reverse:
          "border border-orange-500/25 bg-orange-500/10 text-[#FB923C]",
        forensics:
          "border border-teal-500/25 bg-teal-500/10 text-[#14B8A6]",
        misc:
          "border border-slate-500/25 bg-slate-500/10 text-[#94A3B8]",
        osint:
          "border border-yellow-500/25 bg-yellow-500/10 text-[#EAB308]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

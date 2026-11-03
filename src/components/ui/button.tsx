import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "gradient-cta text-[#0B0D12] font-semibold shadow-[0_0_16px_rgba(34,211,160,0.25)] hover:shadow-[0_0_20px_rgba(34,211,160,0.4)] active:scale-[0.98]",
        secondary:
          "bg-[#12151C] text-[#F1F5F9] border border-[#242936] hover:bg-[#181C25] hover:border-[#363E52] active:scale-[0.98]",
        ghost:
          "text-[#BACAC1] hover:text-[#E0E2EC] hover:bg-[#181C25] active:scale-[0.98]",
        destructive:
          "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 active:scale-[0.98]",
        outline:
          "border border-[#242936] bg-transparent text-[#E0E2EC] hover:bg-[#12151C] hover:border-[#363E52] active:scale-[0.98]",
        terminal:
          "border border-dashed border-[#242936] bg-transparent text-[#94A3B8] font-mono text-xs hover:border-[#22D3A0] hover:text-[#22D3A0]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

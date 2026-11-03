import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-[#242936] bg-[#0B0D12] px-3 py-2 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:outline-none focus:border-[#22D3A0] focus:ring-1 focus:ring-[#22D3A0] disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-inner",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

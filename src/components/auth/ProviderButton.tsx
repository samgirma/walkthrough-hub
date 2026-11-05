import React from "react";
import { Loader2 } from "lucide-react";

export interface ProviderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label: string;
  isLoading?: boolean;
}

export function ProviderButton({
  icon,
  label,
  isLoading = false,
  disabled,
  className = "",
  onClick,
  ...props
}: ProviderButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      onClick={onClick}
      className={`relative h-[52px] w-full flex items-center justify-center gap-3 rounded-[12px] border border-[#2B3142] bg-white/[0.04] text-[#E8ECF4] text-[15px] font-semibold transition-all duration-150 select-none cursor-pointer hover:border-[#22D3A0] hover:bg-[#22D3A0]/[0.08] active:scale-[0.99] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38BDF8] focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-[#2B3142] disabled:hover:bg-white/[0.04] disabled:active:scale-100 ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-[#22D3A0] shrink-0" />
      ) : (
        icon && <span className="w-5 h-5 flex items-center justify-center shrink-0">{icon}</span>
      )}
      <span>{label}</span>
    </button>
  );
}

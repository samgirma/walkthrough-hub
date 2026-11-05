import React from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export type LogoVariant = "horizontal" | "stacked" | "icon";

export interface LogoProps {
  variant?: LogoVariant;
  /** Height in pixels. Width will automatically scale proportionally. */
  size?: number;
  className?: string;
  imageClassName?: string;
  href?: string | null;
  priority?: boolean;
  theme?: "auto" | "dark" | "light";
  "aria-label"?: string;
}

const DIMENSIONS: Record<LogoVariant, { ratio: number; defaultHeight: number }> = {
  horizontal: { ratio: 299.2 / 64, defaultHeight: 32 },
  stacked: { ratio: 208 / 128, defaultHeight: 48 },
  icon: { ratio: 1, defaultHeight: 32 },
};

export function Logo({
  variant = "horizontal",
  size,
  className = "",
  imageClassName = "",
  href = "/",
  priority = false,
  theme = "auto",
  "aria-label": customAriaLabel,
}: LogoProps) {
  const { ratio, defaultHeight } = DIMENSIONS[variant];
  const height = size ?? defaultHeight;
  const width = Math.round(height * ratio);

  const alt = `${siteConfig.name} logo`;
  const ariaLabel = customAriaLabel || `${siteConfig.name} home`;

  const renderContent = () => {
    if (variant === "horizontal") {
      if (theme === "dark") {
        return (
          <Image
            src="/brand/logo/logo-horizontal.svg"
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            unoptimized
            className={`h-auto max-w-full ${imageClassName}`}
            style={{ height: `${height}px`, width: `${width}px` }}
          />
        );
      }
      if (theme === "light") {
        return (
          <Image
            src="/brand/logo/logo-horizontal-light.svg"
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            unoptimized
            className={`h-auto max-w-full ${imageClassName}`}
            style={{ height: `${height}px`, width: `${width}px` }}
          />
        );
      }
      // Zero-flicker theme toggle: render both dark & light SVGs and toggle via CSS classes
      return (
        <span className="relative inline-flex items-center">
          <Image
            src="/brand/logo/logo-horizontal.svg"
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            unoptimized
            className={`hidden dark:block h-auto max-w-full ${imageClassName}`}
            style={{ height: `${height}px`, width: `${width}px` }}
          />
          <Image
            src="/brand/logo/logo-horizontal-light.svg"
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            unoptimized
            className={`block dark:hidden h-auto max-w-full ${imageClassName}`}
            style={{ height: `${height}px`, width: `${width}px` }}
          />
        </span>
      );
    }

    if (variant === "stacked") {
      return (
        <Image
          src="/brand/logo/logo-stacked.svg"
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          unoptimized
          className={`h-auto max-w-full ${imageClassName}`}
          style={{ height: `${height}px`, width: `${width}px` }}
        />
      );
    }

    // Default icon variant (square 64x64)
    return (
      <Image
        src="/brand/logo/logo-icon.svg"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        unoptimized
        className={`h-auto max-w-full ${imageClassName}`}
        style={{ height: `${height}px`, width: `${width}px` }}
      />
    );
  };

  const interactiveClasses =
    "inline-flex items-center shrink-0 transition-all duration-200 hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3A0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D12] rounded-lg";

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={`${interactiveClasses} ${className}`}>
        {renderContent()}
      </Link>
    );
  }

  return <span className={`inline-flex items-center shrink-0 ${className}`}>{renderContent()}</span>;
}

"use client";

import React, { useCallback } from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";

interface CardLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function CardLink({ href, children, className, onClick, ...props }: CardLinkProps) {
  const router = useRouter();

  const handlePrefetch = useCallback(() => {
    if (typeof href === "string") {
      router.prefetch(href);
    }
  }, [router, href]);

  return (
    <Link
      href={href}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
}

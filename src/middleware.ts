import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth?.user;

  // 1. Logged-in users navigating to /login or /register -> send to dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // 2. /onboarding route protection
  if (pathname === "/onboarding") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", "/onboarding");
      return NextResponse.redirect(loginUrl);
    }
    // Allow authenticated users to view onboarding; page component checks DB to redirect if already onboarded
    return NextResponse.next();
  }

  // 3. Protected author areas: /dashboard, /write, /settings
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/write") ||
    pathname.startsWith("/settings");

  if (isProtected) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Authenticated users are let through to the DAL layer (requireOnboarded) which does a fresh DB check
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/write/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/onboarding",
  ],
};

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest & { auth?: any }) => {
  const { pathname, search } = req.nextUrl;
  const host = req.headers.get("host") || "";

  // 1. Apex redirect: 301-redirect www.domain to apex domain
  if (host.startsWith("www.")) {
    const apexHost = host.replace(/^www\./, "");
    const protocol = req.nextUrl.protocol || "https:";
    const targetUrl = new URL(`${protocol}//${apexHost}${pathname}${search}`);
    return NextResponse.redirect(targetUrl, 301);
  }

  // 2. Trailing slash policy: 301-redirect trailing slashes (except root "/")
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const cleanPath = pathname.slice(0, -1);
    const targetUrl = new URL(`${cleanPath}${search}`, req.nextUrl);
    return NextResponse.redirect(targetUrl, 301);
  }

  // 3. Lowercase URL policy: enforce lowercase on writeup, profile, category, tag paths
  const needsLowercase =
    pathname.startsWith("/w/") ||
    pathname.startsWith("/u/") ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/tag/");

  if (needsLowercase && /[A-Z]/.test(pathname)) {
    const targetUrl = new URL(`${pathname.toLowerCase()}${search}`, req.nextUrl);
    return NextResponse.redirect(targetUrl, 301);
  }

  const isAuthenticated = !!req.auth?.user;

  // 4. Logged-in users navigating to /login or /register -> send to dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // 5. /onboarding route protection
  if (pathname === "/onboarding") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", "/onboarding");
      return NextResponse.redirect(loginUrl);
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // 6. Protected author areas: /dashboard, /write, /settings
  const isProtected =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/write" ||
    pathname.startsWith("/write/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  if (isProtected) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // 7. API routes: add X-Robots-Tag: noindex, nofollow
  if (pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, manifest.webmanifest
     * - google verification files
     * - static files with extensions (.png, .jpg, .svg, .xml, .txt, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|google[a-zA-Z0-9_-]+\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff|woff2|xml|txt)$).*)",
  ],
};

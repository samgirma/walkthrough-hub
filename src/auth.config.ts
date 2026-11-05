import type { NextAuthConfig } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { isProviderEnabled } from "@/env";

/**
 * Edge-safe NextAuth configuration.
 * Contains no Prisma or database adapter imports so it can execute safely inside Edge runtime / middleware.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/onboarding",
  },
  providers: [
    ...(isProviderEnabled("google") && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(isProviderEnabled("github") && process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            issuer: "https://github.com/login/oauth",
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/write") ||
        pathname.startsWith("/settings") ||
        pathname === "/onboarding";

      if (isProtected) {
        return isLoggedIn;
      }

      return true;
    },
  },
};

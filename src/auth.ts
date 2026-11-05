import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { isProviderEnabled, logStartupDiagnostics } from "@/env";
import { verifyTelegramAuth } from "@/lib/telegram-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import type { UserRole } from "@/types/next-auth";

// Log server boot diagnostics once
logStartupDiagnostics();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
  providers: [
    // 1. Google OAuth (only if enabled via env)
    ...(isProviderEnabled("google") && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
              const isVerified = profile.email_verified === true;
              return {
                id: profile.sub,
                name: profile.name,
                email: isVerified ? profile.email : null,
                emailVerified: isVerified ? new Date() : null,
                image: profile.picture,
                avatarUrl: profile.picture,
                username: null, // chosen on /onboarding
                role: "USER" as UserRole,
              };
            },
          }),
        ]
      : []),

    // 2. GitHub OAuth (only if enabled via env)
    ...(isProviderEnabled("github") && process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            issuer: "https://github.com/login/oauth",
            allowDangerousEmailAccountLinking: true,
            async profile(profile, tokens) {
              let verifiedEmail: string | null = null;

              if (tokens.access_token) {
                try {
                  const res = await fetch("https://api.github.com/user/emails", {
                    headers: {
                      Authorization: `Bearer ${tokens.access_token}`,
                      "User-Agent": "WriteupHub-Auth",
                    },
                  });
                  if (res.ok) {
                    const emails: Array<{
                      email: string;
                      primary: boolean;
                      verified: boolean;
                    }> = await res.json();
                    const primaryVerified = emails.find((e) => e.primary && e.verified);
                    if (primaryVerified) {
                      verifiedEmail = primaryVerified.email;
                    }
                  }
                } catch (e) {
                  console.warn("[Auth] Could not query GitHub emails API:", e);
                }
              }

              return {
                id: String(profile.id),
                name: profile.name || profile.login,
                email: verifiedEmail,
                emailVerified: verifiedEmail ? new Date() : null,
                image: profile.avatar_url,
                avatarUrl: profile.avatar_url,
                githubUrl: profile.html_url,
                bio: profile.bio,
                username: null,
                role: "USER" as UserRole,
              };
            },
          }),
        ]
      : []),

    // 3. Telegram Login (Custom Credentials Provider)
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { type: "text" },
        first_name: { type: "text" },
        last_name: { type: "text" },
        username: { type: "text" },
        photo_url: { type: "text" },
        auth_date: { type: "text" },
        hash: { type: "text" },
      },
      async authorize(credentials) {
        if (!isProviderEnabled("telegram")) {
          throw new Error("Telegram authentication is currently disabled.");
        }

        const idKey = credentials?.id ? String(credentials.id) : "unknown";
        const rl = checkRateLimit(`tg-auth:${idKey}`, 10, 60000);
        if (!rl.success) {
          throw new Error("Too many sign-in attempts. Please wait a minute.");
        }

        const verifyResult = verifyTelegramAuth(credentials);
        if (!verifyResult.valid || !verifyResult.data) {
          throw new Error(verifyResult.error || "Telegram authentication failed.");
        }

        const tg = verifyResult.data;
        const providerAccountId = String(tg.id);
        const authDateInt = tg.auth_date;

        // 1. Check if Telegram account is already linked
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "telegram",
              providerAccountId,
            },
          },
          include: { user: true },
        });

        if (existingAccount) {
          // Replay attack check: reject if auth_date is equal or older than stored lastAuthDate
          if (existingAccount.lastAuthDate && authDateInt <= existingAccount.lastAuthDate) {
            throw new Error("Authentication request has already been used (replay detected).");
          }

          // Update lastAuthDate
          await prisma.account.update({
            where: { id: existingAccount.id },
            data: { lastAuthDate: authDateInt },
          });

          return {
            id: existingAccount.user.id,
            name: existingAccount.user.name,
            username: existingAccount.user.username,
            email: existingAccount.user.email,
            image: existingAccount.user.avatarUrl || tg.photo_url,
            role: (existingAccount.user.role as UserRole) || "USER",
            onboarded: Boolean(existingAccount.user.username),
          };
        }

        // 2. New user registration via Telegram (email is null)
        const fullName = [tg.first_name, tg.last_name].filter(Boolean).join(" ").trim() || "Telegram User";

        const newUser = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name: fullName,
              username: null, // to be chosen during onboarding
              email: null,
              avatarUrl: tg.photo_url || null,
              image: tg.photo_url || null,
              role: "USER",
            },
          });

          await tx.account.create({
            data: {
              userId: user.id,
              type: "credentials",
              provider: "telegram",
              providerAccountId,
              lastAuthDate: authDateInt,
            },
          });

          return user;
        });

        return {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: null,
          image: newUser.avatarUrl,
          role: "USER" as UserRole,
          onboarded: false,
        };
      },
    }),

    // 4. Dev-Only Credentials Login (strictly active in development when DEV_LOGIN=true)
    ...(process.env.NODE_ENV === "development" && process.env.DEV_LOGIN === "true"
      ? [
          CredentialsProvider({
            id: "dev",
            name: "Development Login",
            credentials: {
              username: { label: "Username", type: "text" },
            },
            async authorize(credentials) {
              if (process.env.NODE_ENV !== "development" || process.env.DEV_LOGIN !== "true") {
                return null;
              }

              const targetUsername = credentials?.username ? String(credentials.username).trim() : "0xNullPtr";
              const user = await prisma.user.findFirst({
                where: {
                  OR: [
                    { username: targetUsername },
                    { email: `${targetUsername.toLowerCase()}@writeuphub.sec` },
                  ],
                },
              });

              if (!user) {
                return null;
              }

              return {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                image: user.avatarUrl,
                role: (user.role as UserRole) || "USER",
                onboarded: Boolean(user.username),
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const lookupId = (user?.id as string) || (token.id as string) || (token.sub as string);
      const lookupEmail = (user?.email as string) || (token.email as string);

      // On initial sign-in, session update, or missing username/role, synchronize directly from DB
      if (lookupId || lookupEmail) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(lookupId ? [{ id: lookupId }] : []),
              ...(lookupEmail ? [{ email: lookupEmail }] : []),
              ...(lookupId ? [{ accounts: { some: { providerAccountId: lookupId } } }] : []),
            ],
          },
          select: { id: true, username: true, role: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.role = (dbUser.role as UserRole) || "USER";
          token.onboarded = Boolean(dbUser.username);
        } else if (user) {
          token.id = (user.id as string) || (token.sub as string);
          token.username = user.username ?? null;
          token.role = (user.role as UserRole) || "USER";
          token.onboarded = Boolean(user.username);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.onboarded = token.onboarded;
      }
      return session;
    },
  },
});

import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

export type UserRole = "USER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      role: UserRole;
      onboarded: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    username?: string | null;
    role?: UserRole;
    onboarded?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string | null;
    role: UserRole;
    onboarded: boolean;
  }
}

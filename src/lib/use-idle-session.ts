"use client";

import { useState, useEffect } from "react";

export interface IdleSessionUser {
  id: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

let cachedUser: IdleSessionUser | null | undefined = undefined;
let pendingPromise: Promise<IdleSessionUser | null> | null = null;
const listeners = new Set<(user: IdleSessionUser | null) => void>();

function notify(user: IdleSessionUser | null) {
  cachedUser = user;
  listeners.forEach((listener) => listener(user));
}

export function fetchIdleSession(): Promise<IdleSessionUser | null> {
  if (cachedUser !== undefined) {
    return Promise.resolve(cachedUser);
  }
  if (!pendingPromise) {
    pendingPromise = fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        const user = data.user || null;
        notify(user);
        return user;
      })
      .catch(() => {
        notify(null);
        return null;
      })
      .finally(() => {
        pendingPromise = null;
      });
  }
  return pendingPromise;
}

export function useIdleSession() {
  const [user, setUser] = useState<IdleSessionUser | null>(
    cachedUser !== undefined ? cachedUser : null
  );
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(
    cachedUser === undefined
      ? "loading"
      : cachedUser
      ? "authenticated"
      : "unauthenticated"
  );

  useEffect(() => {
    const handleUpdate = (newUser: IdleSessionUser | null) => {
      setUser(newUser);
      setStatus(newUser ? "authenticated" : "unauthenticated");
    };

    listeners.add(handleUpdate);

    if (cachedUser === undefined) {
      // Defer network call until after browser is completely idle
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const id = (window as any).requestIdleCallback(
          () => {
            fetchIdleSession();
          },
          { timeout: 2500 }
        );
        return () => {
          listeners.delete(handleUpdate);
          if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
            (window as any).cancelIdleCallback(id);
          }
        };
      } else {
        const timer = setTimeout(() => {
          fetchIdleSession();
        }, 150);
        return () => {
          listeners.delete(handleUpdate);
          clearTimeout(timer);
        };
      }
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const signOut = async (options?: { callbackUrl?: string }) => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {
      // ignore
    }
    notify(null);
    window.location.href = options?.callbackUrl || "/";
  };

  return {
    user,
    status,
    isAuthenticated: !!user,
    signOut,
  };
}

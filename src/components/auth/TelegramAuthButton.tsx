"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProviderButton } from "@/components/auth/ProviderButton";
import { TelegramIcon } from "@/components/auth/BrandIcons";

declare global {
  interface Window {
    Telegram?: {
      Login: {
        auth: (
          options: { bot_id: string; request_access?: "read" | "write" },
          callback: (user: any) => void
        ) => void;
      };
    };
  }
}

export interface TelegramAuthButtonProps {
  onSuccess: (data: Record<string, unknown>) => Promise<void>;
  onError: (error: string) => void;
  botId?: string;
  disabled?: boolean;
}

export function TelegramAuthButton({
  onSuccess,
  onError,
  botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || "",
  disabled = false,
}: TelegramAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const fallbackContainerRef = useRef<HTMLDivElement>(null);

  // Dynamically load telegram-widget.js when requested
  const loadTelegramWidget = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Telegram?.Login) {
        return resolve(true);
      }

      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.onload = () => {
        resolve(!!window.Telegram?.Login);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleTelegramClick = async () => {
    if (!botId) {
      onError("Telegram Bot ID is not configured (NEXT_PUBLIC_TELEGRAM_BOT_ID).");
      return;
    }

    setLoading(true);

    try {
      const isLoaded = await loadTelegramWidget();

      if (isLoaded && window.Telegram?.Login?.auth) {
        window.Telegram.Login.auth(
          { bot_id: botId, request_access: "write" },
          async (user) => {
            if (!user) {
              setLoading(false);
              onError("Telegram authentication cancelled.");
              return;
            }

            try {
              await onSuccess(user);
            } catch (err: any) {
              onError(err.message || "Failed to sign in with Telegram.");
            } finally {
              setLoading(false);
            }
          }
        );
      } else {
        // Fallback to official widget if popup API is blocked or unavailable
        setUseFallback(true);
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      onError(err.message || "Could not launch Telegram login.");
    }
  };

  // Mount fallback official widget if needed
  useEffect(() => {
    if (useFallback && fallbackContainerRef.current && botId) {
      fallbackContainerRef.current.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", botId);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "12");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-auth-url", "/api/auth/telegram/callback");
      script.async = true;
      fallbackContainerRef.current.appendChild(script);
    }
  }, [useFallback, botId]);

  if (useFallback) {
    return (
      <div className="w-full flex flex-col items-center gap-2">
        <div ref={fallbackContainerRef} className="w-full flex justify-center py-2" />
        <button
          type="button"
          onClick={() => setUseFallback(false)}
          className="text-[11px] font-mono text-[#9AA3B5] hover:text-[#22D3A0] underline"
        >
          Try custom popup
        </button>
      </div>
    );
  }

  return (
    <ProviderButton
      icon={<TelegramIcon size={20} />}
      label="Continue with Telegram"
      isLoading={loading}
      disabled={disabled || loading}
      onClick={handleTelegramClick}
    />
  );
}

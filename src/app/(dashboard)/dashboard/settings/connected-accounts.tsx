"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleIcon, GithubIcon, TelegramIcon } from "@/components/auth/BrandIcons";
import { TelegramAuthButton } from "@/components/auth/TelegramAuthButton";
import { unlinkProviderAction, linkTelegramAccountAction } from "@/server/auth.actions";
import { Check, Link as LinkIcon, Unlink, AlertCircle, Loader2 } from "lucide-react";

interface ConnectedAccountsProps {
  linkedProviders: string[];
}

export function ConnectedAccounts({ linkedProviders }: ConnectedAccountsProps) {
  const router = useRouter();
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUnlink = async (provider: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setUnlinking(provider);

    try {
      const res = await unlinkProviderAction(provider);
      if (res.success) {
        setSuccessMsg(`Successfully disconnected ${provider} from your account.`);
        router.refresh();
      } else {
        setErrorMsg(res.error || `Could not disconnect ${provider}.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to unlink account.");
    } finally {
      setUnlinking(null);
    }
  };

  const handleLinkOAuth = async (provider: "google" | "github") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    await signIn(provider, { callbackUrl: "/dashboard/settings" });
  };

  const handleLinkTelegram = async (payload: Record<string, unknown>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await linkTelegramAccountAction(payload);
    if (res.success) {
      setSuccessMsg("Successfully linked Telegram to your WriteupHub account.");
      router.refresh();
    } else {
      setErrorMsg(res.error || "Failed to link Telegram account.");
    }
  };

  const isOnlyMethod = linkedProviders.length <= 1;

  const providers = [
    {
      id: "google",
      name: "Google",
      icon: <GoogleIcon size={18} />,
      isLinked: linkedProviders.includes("google"),
      onLink: () => handleLinkOAuth("google"),
    },
    {
      id: "github",
      name: "GitHub",
      icon: <GithubIcon size={18} />,
      isLinked: linkedProviders.includes("github"),
      onLink: () => handleLinkOAuth("github"),
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: <TelegramIcon size={18} />,
      isLinked: linkedProviders.includes("telegram"),
      isTelegram: true,
    },
  ];

  return (
    <Card className="bg-[#12151C]/90 backdrop-blur-md border-[#242936]">
      <CardHeader>
        <div className="flex items-center gap-2 text-white">
          <LinkIcon className="w-4 h-4 text-[#22D3A0]" />
          <CardTitle className="text-base font-sans font-bold">Connected Sign-in Methods</CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-400">
          Manage OAuth providers linked to your account. You can log in using any linked provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="divide-y divide-[#242936]">
          {providers.map((p) => (
            <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#181C25] border border-[#242936] flex items-center justify-center shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-white">{p.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {p.isLinked ? (
                      <span className="text-emerald-400 font-mono inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      "Not connected"
                    )}
                  </p>
                </div>
              </div>

              <div>
                {p.isLinked ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isOnlyMethod || unlinking === p.id}
                    onClick={() => handleUnlink(p.id)}
                    title={isOnlyMethod ? "Cannot remove your only sign-in method" : undefined}
                    className="text-xs font-mono h-8 border-[#242936] text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 disabled:opacity-40"
                  >
                    {unlinking === p.id ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                    ) : (
                      <Unlink className="w-3 h-3 mr-1.5 text-rose-400" />
                    )}
                    <span>Disconnect</span>
                  </Button>
                ) : p.isTelegram ? (
                  <TelegramAuthButton
                    onSuccess={handleLinkTelegram}
                    onError={(err) => setErrorMsg(err)}
                  />
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={p.onLink}
                    className="text-xs font-mono h-8 border-[#242936] text-[#BACAC1] hover:text-white hover:bg-[#181C25]"
                  >
                    <LinkIcon className="w-3 h-3 mr-1.5 text-[#22D3A0]" />
                    <span>Connect {p.name}</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isOnlyMethod && (
          <p className="text-[11px] font-mono text-slate-500 pt-2 border-t border-[#242936]">
            * You must maintain at least one linked authentication method to sign in.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

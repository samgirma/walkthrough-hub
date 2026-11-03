"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareModalProps {
  title: string;
  url: string;
}

export function ShareModal({ title, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const twitterShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out this CTF writeup: "${title}"`
  )}&url=${encodeURIComponent(url)}`;

  const redditShare = `https://reddit.com/submit?url=${encodeURIComponent(
    url
  )}&title=${encodeURIComponent(`[Writeup] ${title}`)}`;

  const linkedInShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url
  )}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs font-mono gap-1.5 text-[#BACAC1] hover:text-white">
          <Share2 className="h-3.5 w-3.5" />
          <span>Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-[#12151C] border-[#242936] rounded-xl p-6 text-white shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>Share Public Walkthrough</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#94A3B8] uppercase">
                Shareable Public URL
              </label>
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                ZERO-AUTH ACCESSIBLE
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#0B0D12] p-1.5 rounded-lg border border-[#242936]">
              <input
                readOnly
                value={url}
                className="w-full bg-transparent px-2 text-xs font-mono text-[#E0E2EC] focus:outline-none select-all truncate"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopy}
                className="text-xs font-mono gap-1 shrink-0 h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-primary" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#242936]/60">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase">
              Broadcast to Security Community
            </span>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={twitterShare}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center py-2 px-3 rounded-lg bg-[#0B0D12] hover:bg-[#181C25] border border-[#242936] text-xs font-mono text-[#BACAC1] hover:text-white transition-colors"
              >
                𝕏 Twitter
              </a>
              <a
                href={redditShare}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center py-2 px-3 rounded-lg bg-[#0B0D12] hover:bg-[#181C25] border border-[#242936] text-xs font-mono text-[#BACAC1] hover:text-white transition-colors"
              >
                Reddit
              </a>
              <a
                href={linkedInShare}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center py-2 px-3 rounded-lg bg-[#0B0D12] hover:bg-[#181C25] border border-[#242936] text-xs font-mono text-[#BACAC1] hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

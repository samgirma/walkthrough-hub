"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Globe,
  Lock,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryType, DifficultyType, StatusType } from "@/types";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  ctfName: string;
  ctfYear: number;
  category: CategoryType;
  difficulty: DifficultyType;
  status: StatusType;
  tags: string[];
  writeupId?: string;
  authorUsername: string;
  onSaveSuccess?: (updated: any) => void;
  onSessionExpired?: () => void;
}

export function PublishModal({
  open,
  onOpenChange,
  title,
  slug,
  excerpt,
  contentMd,
  ctfName,
  ctfYear,
  category,
  difficulty,
  status,
  tags,
  writeupId,
  authorUsername,
  onSaveSuccess,
  onSessionExpired,
}: PublishModalProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: title || "Untitled Writeup",
    slug: slug || "",
    excerpt: excerpt || "",
    ctfName: ctfName || "CTF Competition",
    ctfYear: ctfYear || new Date().getFullYear(),
    category: category || "PWN",
    difficulty: difficulty || "MEDIUM",
    status: status || "PUBLIC",
    tagsString: tags ? tags.join(", ") : "kernel, exploit",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const parsedTags = formData.tagsString
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || undefined,
      excerpt: formData.excerpt.trim() || undefined,
      contentMd,
      ctfName: formData.ctfName.trim(),
      ctfYear: Number(formData.ctfYear),
      category: formData.category,
      difficulty: formData.difficulty,
      status: formData.status,
      tags: parsedTags,
    };

    try {
      let res;
      if (writeupId) {
        res = await fetch(`/api/writeups/${writeupId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/writeups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        if (res.status === 401 && onSessionExpired) {
          onOpenChange(false);
          onSessionExpired();
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save writeup.");
      }

      const data = await res.json();

      const fullUrl = `${window.location.origin}/w/${authorUsername}/${data.id || data.slug}`;
      setPublishedUrl(fullUrl);
      if (onSaveSuccess) onSaveSuccess(data);
    } catch (err: any) {
      setError(err?.message || "An error occurred while publishing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publishedUrl) return;
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[580px] w-[95vw] sm:w-full max-h-[90svh] overflow-y-auto bg-[#12151C] border-[#242936] text-[#E0E2EC] p-4 sm:p-8 rounded-2xl sm:rounded-xl shadow-2xl">
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#22D3A0] to-transparent opacity-80" />

        {publishedUrl ? (
          /* Publication Affirmation & Success View */
          <div className="flex flex-col gap-6 py-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#22D3A0] shadow-[0_0_20px_rgba(34,211,160,0.3)]">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-sans font-bold text-xl text-white">
                  Your writeup is live!
                </h2>
                <p className="font-sans text-xs text-[#94A3B8]">
                  Indexed in WriteupHub and accessible to security researchers globally.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-[#BACAC1] uppercase">
                  Shareable Public URL
                </label>
                <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                  ZERO-AUTH VERIFIED
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#0B0D12] p-1.5 rounded-lg border border-[#242936]">
                <input
                  readOnly
                  value={publishedUrl}
                  className="w-full bg-transparent px-2 text-xs font-mono text-white focus:outline-none select-all truncate"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className="gap-1 shrink-0 h-8 gradient-cta text-[#0B0D12] font-semibold text-xs font-mono"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy link</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242936]/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  setPublishedUrl(null);
                }}
                className="font-mono text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  window.open(publishedUrl, "_blank");
                }}
                className="gap-1.5 font-mono text-xs gradient-cta text-[#0B0D12] font-bold"
              >
                <span>View Live Writeup</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Publication Form */
          <form onSubmit={handlePublish} className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                <Rocket className="h-5 w-5 text-primary" />
                <span>Publish CTF Walkthrough</span>
              </DialogTitle>
            </DialogHeader>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-[#BACAC1]">
                  CTF Competition Name
                </label>
                <Input
                  required
                  value={formData.ctfName}
                  onChange={(e) =>
                    setFormData({ ...formData, ctfName: e.target.value })
                  }
                  placeholder="DEF CON 32 Quals"
                  className="font-sans text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-[#BACAC1]">
                  Year
                </label>
                <Input
                  required
                  type="number"
                  value={formData.ctfYear}
                  onChange={(e) =>
                    setFormData({ ...formData, ctfYear: Number(e.target.value) })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-[#BACAC1]">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(val: any) =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger className="font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#181C25] border-[#242936] text-xs font-mono">
                    <SelectItem value="WEB">WEB // Exploitation</SelectItem>
                    <SelectItem value="PWN">PWN // Binary &amp; Kernel</SelectItem>
                    <SelectItem value="CRYPTO">CRYPTO // Cryptography</SelectItem>
                    <SelectItem value="REVERSE">REVERSE // Reverse Eng</SelectItem>
                    <SelectItem value="FORENSICS">FORENSICS // Telemetry</SelectItem>
                    <SelectItem value="MISC">MISC // Unclassified</SelectItem>
                    <SelectItem value="OSINT">OSINT // Intelligence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-[#BACAC1]">
                  Difficulty
                </label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(val: any) =>
                    setFormData({ ...formData, difficulty: val })
                  }
                >
                  <SelectTrigger className="font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#181C25] border-[#242936] text-xs font-mono">
                    <SelectItem value="EASY">🟢 Easy</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                    <SelectItem value="HARD">🔴 Hard</SelectItem>
                    <SelectItem value="INSANE">🟣 Insane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visibility Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-[#BACAC1]">
                Visibility Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(val: any) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger className="font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#181C25] border-[#242936] text-xs font-mono">
                  <SelectItem value="PUBLIC">
                    🌐 PUBLIC // Listed in feed &amp; search indexed
                  </SelectItem>
                  <SelectItem value="UNLISTED">
                    🔗 UNLISTED // Anyone with share link (noindex)
                  </SelectItem>
                  <SelectItem value="DRAFT">
                    🔒 DRAFT // Author only access
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-[#BACAC1]">
                Tags (comma-separated)
              </label>
              <Input
                value={formData.tagsString}
                onChange={(e) =>
                  setFormData({ ...formData, tagsString: e.target.value })
                }
                placeholder="kernel, slub, heap-spray, rop"
                className="font-mono text-xs"
              />
            </div>

            {/* Excerpt */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-[#BACAC1]">
                Brief Excerpt (Optional)
              </label>
              <Textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Short summary displayed on card previews..."
                className="font-sans text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242936]/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="font-mono text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gradient-cta text-[#0B0D12] font-bold text-xs font-mono gap-1.5 shadow-[0_0_16px_rgba(34,211,160,0.3)]"
              >
                <Rocket className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Publishing..." : "Publish Walkthrough"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Loader2, AlertCircle } from "lucide-react";
import { deleteAccountAction } from "@/server/auth.actions";

interface DeleteAccountCardProps {
  username: string | null;
}

export function DeleteAccountCard({ username }: DeleteAccountCardProps) {
  const [open, setOpen] = useState(false);
  const [confirmHandle, setConfirmHandle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const expectedHandle = username || "DELETE";
  const isMatch = confirmHandle.trim() === expectedHandle;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) return;

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await deleteAccountAction(confirmHandle.trim());
      if (res.success) {
        // Sign out client-side and redirect to home page with query param
        await signOut({ callbackUrl: "/?deleted=true" });
      } else {
        setErrorMsg(res.error || "Failed to delete account. Please try again.");
        setIsDeleting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while deleting account.");
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-rose-900/40 bg-rose-950/10 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <CardTitle className="text-base font-sans font-bold text-rose-200">
            Danger Zone
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-rose-300/70">
          Permanent actions regarding your account data and public persona.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h4 className="text-sm font-semibold text-white">Delete Account</h4>
          <p className="text-xs text-slate-400 max-w-lg mt-0.5">
            Permanently delete your profile, all published and draft CTF writeups, bookmarks, and sessions. This action cannot be undone.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="border-rose-800 text-rose-400 hover:text-white hover:bg-rose-900/40 shrink-0 text-xs font-mono"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="border-rose-900/60 bg-[#12151C] text-slate-200 sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-400 mb-1">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <DialogTitle className="text-lg font-bold text-white">
                  Permanently Delete Account?
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-400 space-y-2">
                <span className="block text-rose-300/90 font-medium">
                  This action is irreversible. All your writeups, comments, bookmarks, and account records will be permanently wiped.
                </span>
                <span className="block">
                  To confirm, type your username{" "}
                  <strong className="text-white font-mono bg-[#181C25] px-1.5 py-0.5 rounded border border-[#242936]">
                    {expectedHandle}
                  </strong>{" "}
                  below:
                </span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleDelete} className="space-y-4 pt-2">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Input
                  type="text"
                  placeholder={`Type '${expectedHandle}' to confirm`}
                  value={confirmHandle}
                  onChange={(e) => setConfirmHandle(e.target.value)}
                  disabled={isDeleting}
                  className="bg-[#181C25] border-[#242936] focus:border-rose-500 font-mono text-sm text-white"
                  autoFocus
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isDeleting}
                  className="border-[#242936] text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isMatch || isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium disabled:opacity-40"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Confirm & Delete Account"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

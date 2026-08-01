"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountDialog({ role }: { role: "STUDENT" | "TEACHER" }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!password) {
      toast.error("Enter your password to confirm");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to delete account");
        return;
      }
      toast.success("Your account has been deleted");
      await signOut({ callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" /> Delete Account
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-destructive">Delete your account?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            This permanently deletes your account, profile, submissions, grades, and everything
            attached to it.
            {role === "TEACHER" &&
              " This includes every class, lesson, and announcement you've created — your students will lose access to all of it."}{" "}
            This can&apos;t be undone. Enter your password to confirm.
          </Dialog.Description>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="delete-password">Password</Label>
            <div className="relative">
              <Input
                id="delete-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Permanently Delete Account
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

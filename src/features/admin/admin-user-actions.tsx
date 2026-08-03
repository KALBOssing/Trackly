"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldOff, ShieldCheck, KeyRound, UserCog, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function AdminUserActions({
  userId,
  userName,
  suspended,
}: {
  userId: string;
  userName: string;
  suspended: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  async function toggleSuspend() {
    setLoading("suspend");
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to update");
        return;
      }
      toast.success(suspended ? `${userName} reinstated` : `${userName} suspended`);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function resetPassword() {
    setLoading("reset");
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to generate reset link");
        return;
      }
      setResetLink(json.resetLink);
      toast.success("Reset link generated (and emailed, if email is configured)");
    } finally {
      setLoading(null);
    }
  }

  async function impersonate() {
    setLoading("impersonate");
    try {
      const res = await fetch(`/api/admin/users/${userId}/impersonate`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to impersonate");
        return;
      }
      window.location.href = json.redirectTo;
    } finally {
      setLoading(null);
    }
  }

  async function remove() {
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error ?? "Failed to delete");
      return;
    }
    toast.success(`${userName}'s account deleted`);
    router.push("/admin/users");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={!!loading} onClick={impersonate}>
          {loading === "impersonate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCog className="h-4 w-4" />}
          Log in as {userName}
        </Button>
        <Button variant="outline" disabled={!!loading} onClick={resetPassword}>
          {loading === "reset" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          Generate Password Reset Link
        </Button>
        <Button variant="outline" disabled={!!loading} onClick={toggleSuspend}>
          {loading === "suspend" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : suspended ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <ShieldOff className="h-4 w-4" />
          )}
          {suspended ? "Reinstate Account" : "Suspend Account"}
        </Button>
        <ConfirmButton
          onConfirm={remove}
          title={`Delete ${userName}'s account?`}
          description="This permanently deletes their account and everything attached to it (classes, lessons, submissions, grades). This can't be undone."
          confirmLabel="Delete Account"
          triggerVariant="outline"
          triggerLabel="Delete Account"
          triggerIcon={<Trash2 className="h-4 w-4" />}
          className="border-destructive text-destructive hover:bg-destructive/10"
        />
      </div>

      {resetLink && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 p-3 text-sm">
          <code className="flex-1 truncate">{resetLink}</code>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(resetLink);
              toast.success("Copied");
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

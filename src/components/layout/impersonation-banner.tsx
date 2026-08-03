"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function stop() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stop-impersonating", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to return to your account");
        return;
      }
      window.location.href = json.redirectTo;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-destructive px-4 py-2 text-sm text-destructive-foreground">
      <span className="flex items-center gap-2">
        <UserCog className="h-4 w-4" /> You&apos;re viewing Trackly as this user (admin impersonation).
      </span>
      <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10" onClick={stop} disabled={loading}>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Return to my account
      </Button>
    </div>
  );
}

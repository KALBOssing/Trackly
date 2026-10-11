"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResendVerification({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      toast.error("Couldn't send the email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p role="status" className="flex items-start gap-2 text-sm text-muted-foreground">
        <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        If that address has an unverified account, a new link is on its way. Check your inbox and spam folder.
      </p>
    );
  }

  return (
    <form onSubmit={resend} className="space-y-3 text-left">
      <div className="space-y-1.5">
        <Label htmlFor="resend-email">Email</Label>
        <Input
          id="resend-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
        />
      </div>
      <Button type="submit" variant="outline" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Send a new verification link
      </Button>
    </form>
  );
}

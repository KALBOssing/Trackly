"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PendingRequest = {
  id: string;
  message: string | null;
  student: { user: { firstName: string; lastName: string; email: string } };
  class: { id: string; name: string };
};

export function PendingJoinRequests({ requests }: { requests: PendingRequest[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function respond(id: string, action: "approve" | "deny") {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/class-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to update request");
        return;
      }
      toast.success(action === "approve" ? "Student admitted" : "Request declined");
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  if (requests.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Join Requests ({requests.length})</CardTitle>
        <CardDescription>Students waiting to be admitted into one of your classes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {requests.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
            <div>
              <p className="font-medium">
                {r.student.user.firstName} {r.student.user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {r.student.user.email} · wants to join {r.class.name}
              </p>
              {r.message && <p className="mt-1 text-xs italic text-muted-foreground">&quot;{r.message}&quot;</p>}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={loadingId === r.id}
                onClick={() => respond(r.id, "deny")}
              >
                {loadingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                Deny
              </Button>
              <Button size="sm" disabled={loadingId === r.id} onClick={() => respond(r.id, "approve")}>
                {loadingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Admit
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

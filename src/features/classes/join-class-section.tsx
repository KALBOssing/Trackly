"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AvailableClass = {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  teacher: { user: { firstName: string; lastName: string } };
};

type PendingRequest = {
  id: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  class: { id: string; name: string };
};

export function JoinClassSection({
  availableClasses,
  myRequests,
}: {
  availableClasses: AvailableClass[];
  myRequests: PendingRequest[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const requestByClassId = new Map(myRequests.map((r) => [r.class.id, r]));

  async function requestToJoin(classId: string) {
    setLoadingId(classId);
    try {
      const res = await fetch("/api/class-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to send request");
        return;
      }
      toast.success("Request sent. Your teacher will review it soon.");
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a Class</CardTitle>
        <CardDescription>
          Request to join a class. Your teacher will need to admit you before you can see its lessons.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {availableClasses.map((c) => {
          const existing = requestByClassId.get(c.id);
          return (
            <div key={c.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.gradeLevel} · {c.section} · {c.teacher.user.firstName} {c.teacher.user.lastName}
                </p>
              </div>
              {existing?.status === "PENDING" ? (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Request pending
                </span>
              ) : existing?.status === "DENIED" ? (
                <Button size="sm" variant="outline" disabled={loadingId === c.id} onClick={() => requestToJoin(c.id)}>
                  {loadingId === c.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Request again
                </Button>
              ) : (
                <Button size="sm" disabled={loadingId === c.id} onClick={() => requestToJoin(c.id)}>
                  {loadingId === c.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Request to Join
                </Button>
              )}
            </div>
          );
        })}
        {availableClasses.length === 0 && (
          <p className="text-sm text-muted-foreground">No classes available to join right now.</p>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { LogOut } from "lucide-react";

export function LeaveClassButton({ classId, className }: { classId: string; className: string }) {
  const router = useRouter();

  async function leave() {
    const res = await fetch(`/api/classes/${classId}/enrollment`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error ?? "Failed to leave class");
      return;
    }
    toast.success(`Left ${className}`);
    router.refresh();
  }

  return (
    <ConfirmButton
      onConfirm={leave}
      title={`Leave ${className}?`}
      description="You'll lose access to its lessons and announcements unless you're admitted again."
      confirmLabel="Leave Class"
      triggerVariant="outline"
      triggerSize="sm"
      triggerLabel="Leave"
      triggerIcon={<LogOut className="h-3.5 w-3.5" />}
    />
  );
}

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserMinus } from "lucide-react";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function RemoveStudentButton({
  classId,
  studentId,
  studentName,
}: {
  classId: string;
  studentId: string;
  studentName: string;
}) {
  const router = useRouter();

  async function remove() {
    const res = await fetch(`/api/classes/${classId}/students/${studentId}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error ?? "Failed to remove student");
      return;
    }
    toast.success(`Removed ${studentName} from the class`);
    router.refresh();
  }

  return (
    <ConfirmButton
      onConfirm={remove}
      title={`Remove ${studentName}?`}
      description="They'll lose access to this class's lessons and announcements. They can request to rejoin later."
      confirmLabel="Remove Student"
      triggerVariant="ghost"
      triggerSize="icon"
      triggerIcon={<UserMinus className="h-3.5 w-3.5" />}
    />
  );
}

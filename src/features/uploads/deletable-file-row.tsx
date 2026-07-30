"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function DeletableFileRow({
  fileName,
  fileSizeBytes,
  deleteUrl,
  canDelete = true,
}: {
  fileName: string;
  fileSizeBytes: number;
  deleteUrl: string;
  canDelete?: boolean;
}) {
  const router = useRouter();

  async function remove() {
    const res = await fetch(deleteUrl, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error ?? "Failed to remove file");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
      <span className="truncate">{fileName}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{formatBytes(fileSizeBytes)}</span>
        {canDelete && (
          <ConfirmButton
            onConfirm={remove}
            title="Remove this file?"
            description={`"${fileName}" will be permanently deleted. This can't be undone.`}
            confirmLabel="Remove"
            triggerVariant="ghost"
            triggerSize="icon"
            className="h-6 w-6"
            triggerIcon={<X className="h-3.5 w-3.5" />}
          />
        )}
      </div>
    </div>
  );
}

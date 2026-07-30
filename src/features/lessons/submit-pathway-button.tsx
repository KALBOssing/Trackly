"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubmitPathwayButton({
  lessonPathwayId,
  currentStatus,
}: {
  lessonPathwayId: string;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"SAVE_DRAFT" | "SUBMIT" | null>(null);

  async function act(action: "SAVE_DRAFT" | "SUBMIT") {
    setLoading(action);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonPathwayId, action }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Something went wrong");
        return;
      }
      toast.success(action === "SUBMIT" ? "Submitted" : "Draft saved");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const alreadyGraded = currentStatus === "GRADED";

  return (
    <div className="flex gap-2">
      <Button variant="outline" disabled={!!loading || alreadyGraded} onClick={() => act("SAVE_DRAFT")}>
        {loading === "SAVE_DRAFT" && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Draft
      </Button>
      <Button disabled={!!loading || alreadyGraded} onClick={() => act("SUBMIT")}>
        {loading === "SUBMIT" && <Loader2 className="h-4 w-4 animate-spin" />}
        {currentStatus && currentStatus !== "DRAFT" ? "Resubmit" : "Submit"}
      </Button>
    </div>
  );
}

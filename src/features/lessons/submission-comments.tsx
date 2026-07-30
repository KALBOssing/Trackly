"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

type Comment = {
  id: string;
  body: string;
  createdAt: string | Date;
  studentId: string | null;
};

export function SubmissionComments({
  submissionId,
  comments,
}: {
  submissionId: string;
  comments: Comment[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function post() {
    if (!body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        toast.error("Failed to post comment");
        return;
      }
      setBody("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Comments</p>
      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="rounded-md border border-border p-2 text-sm">
            <p>{c.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {c.studentId ? "Student" : "Teacher"} · {formatDateTime(c.createdAt)}
            </p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet.</p>}
      </div>
      <div className="flex gap-2">
        <Textarea
          rows={2}
          placeholder="Leave a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1"
        />
        <Button size="icon" onClick={post} disabled={loading} aria-label="Post comment">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

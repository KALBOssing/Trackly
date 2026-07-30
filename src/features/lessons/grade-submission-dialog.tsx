"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Paperclip, X } from "lucide-react";
import { gradeSchema } from "@/lib/validations/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

type GradeInput = z.infer<typeof gradeSchema>;

export function GradeSubmissionDialog({
  submissionId,
  studentName,
  maxScore,
  existingScore,
  existingFeedback,
  existingFeedbackFileUrl,
}: {
  submissionId: string;
  studentName: string;
  maxScore: number;
  existingScore?: number;
  existingFeedback?: string | null;
  existingFeedbackFileUrl?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [feedbackFileUrl, setFeedbackFileUrl] = useState(existingFeedbackFileUrl ?? "");
  const [feedbackFileName, setFeedbackFileName] = useState(
    existingFeedbackFileUrl ? existingFeedbackFileUrl.split("/").pop() ?? "Attached file" : ""
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GradeInput>({
    resolver: zodResolver(gradeSchema),
    defaultValues: { score: existingScore, feedback: existingFeedback ?? "" },
  });

  async function handleFeedbackFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to upload feedback file");
        return;
      }
      setFeedbackFileUrl(json.url);
      setFeedbackFileName(json.fileName);
    } finally {
      setUploadingFile(false);
    }
  }

  async function onSubmit(data: GradeInput) {
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, feedbackFileUrl }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to save grade");
        return;
      }
      toast.success("Grade released to student");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="outline">
          {existingScore !== undefined ? "Edit Grade" : "Grade"}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">Grade {studentName}</Dialog.Title>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="score">Score (out of {maxScore})</Label>
              <Input id="score" type="number" step="0.5" {...register("score")} />
              {errors.score && <p className="text-xs text-destructive">{errors.score.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea id="feedback" rows={4} {...register("feedback")} />
            </div>
            <div className="space-y-1.5">
              <Label>Feedback File (optional)</Label>
              {feedbackFileUrl ? (
                <div className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <Paperclip className="h-3.5 w-3.5 shrink-0" /> {feedbackFileName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackFileUrl("");
                      setFeedbackFileName("");
                    }}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground hover:bg-secondary/50">
                  {uploadingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Paperclip className="h-4 w-4" /> Attach a file
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    disabled={uploadingFile}
                    onChange={handleFeedbackFile}
                  />
                </label>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploadingFile}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Release Grade
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

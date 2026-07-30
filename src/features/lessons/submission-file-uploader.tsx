"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileDropzone, type UploadedFile } from "@/features/uploads/file-dropzone";

export function SubmissionFileUploader({ lessonPathwayId }: { lessonPathwayId: string }) {
  const router = useRouter();

  async function handleUploaded(file: UploadedFile) {
    const res = await fetch(`/api/lesson-pathways/${lessonPathwayId}/submission-files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(file),
    });
    if (!res.ok) {
      toast.error("Uploaded, but failed to attach to your submission");
      return;
    }
    router.refresh();
  }

  return <FileDropzone onUploaded={handleUploaded} />;
}

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileDropzone, type UploadedFile } from "@/features/uploads/file-dropzone";

export function LessonResourcesUploader({ lessonId }: { lessonId: string }) {
  const router = useRouter();

  async function handleUploaded(file: UploadedFile) {
    const res = await fetch(`/api/lessons/${lessonId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.fileName,
        fileUrl: file.url,
        fileType: file.fileType,
        fileSizeBytes: file.fileSizeBytes,
      }),
    });
    if (!res.ok) {
      toast.error("Uploaded, but failed to attach to the lesson");
      return;
    }
    router.refresh();
  }

  return <FileDropzone onUploaded={handleUploaded} />;
}

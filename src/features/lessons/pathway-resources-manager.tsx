"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileDropzone, type UploadedFile } from "@/features/uploads/file-dropzone";
import { DeletableFileRow } from "@/features/uploads/deletable-file-row";

export function PathwayResourcesManager({
  lessonPathwayId,
  resources,
}: {
  lessonPathwayId: string;
  resources: { id: string; fileName: string; fileSizeBytes: number }[];
}) {
  const router = useRouter();

  async function handleUploaded(file: UploadedFile) {
    const res = await fetch(`/api/pathways/${lessonPathwayId}/resources`, {
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
      toast.error("Uploaded, but failed to attach to the pathway");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {resources.map((r) => (
        <DeletableFileRow
          key={r.id}
          fileName={r.fileName}
          fileSizeBytes={r.fileSizeBytes}
          deleteUrl={`/api/pathway-resources/${r.id}`}
        />
      ))}
      <FileDropzone onUploaded={handleUploaded} />
    </div>
  );
}

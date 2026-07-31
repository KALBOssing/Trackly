"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { FileDropzone, type UploadedFile } from "@/features/uploads/file-dropzone";
import { DeletableFileRow } from "@/features/uploads/deletable-file-row";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function AnnouncementMediaManager({
  announcementId,
  images,
  attachments,
}: {
  announcementId: string;
  images: { id: string; imageUrl: string }[];
  attachments: { id: string; fileName: string; fileSizeBytes: number }[];
}) {
  const router = useRouter();

  async function addImage(file: UploadedFile) {
    const res = await fetch(`/api/announcements/${announcementId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: file.url }),
    });
    if (!res.ok) {
      toast.error("Failed to attach image");
      return;
    }
    router.refresh();
  }

  async function addAttachment(file: UploadedFile) {
    const res = await fetch(`/api/announcements/${announcementId}/attachments`, {
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
      toast.error("Failed to attach file");
      return;
    }
    router.refresh();
  }

  async function removeImage(imageId: string) {
    const res = await fetch(`/api/announcement-images/${imageId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove image");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Images</p>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md border border-border">
                <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
                <ConfirmButton
                  onConfirm={() => removeImage(img.id)}
                  title="Remove this image?"
                  description="It will be permanently removed from the gallery."
                  confirmLabel="Remove"
                  triggerVariant="ghost"
                  triggerSize="icon"
                  className="absolute right-1 top-1 h-6 w-6 bg-black/50 text-white opacity-0 group-hover:opacity-100"
                  triggerIcon={<X className="h-3.5 w-3.5" />}
                />
              </div>
            ))}
          </div>
        )}
        <FileDropzone onUploaded={addImage} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Attachments</p>
        {attachments.map((f) => (
          <DeletableFileRow
            key={f.id}
            fileName={f.fileName}
            fileSizeBytes={f.fileSizeBytes}
            deleteUrl={`/api/announcement-attachments/${f.id}`}
          />
        ))}
        <FileDropzone onUploaded={addAttachment} />
      </div>
    </div>
  );
}

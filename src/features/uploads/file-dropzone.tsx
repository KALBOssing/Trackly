"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Loader2, FileIcon, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

export type UploadedFile = {
  url: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
};

const ACCEPTED = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.mp4";
const MAX_BYTES = 100 * 1024 * 1024;

export function FileDropzone({
  onUploaded,
  multiple = true,
}: {
  onUploaded: (file: UploadedFile) => void;
  multiple?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recent, setRecent] = useState<UploadedFile[]>([]);

  const upload = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} exceeds the 100MB limit`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? `Failed to upload ${file.name}`);
          continue;
        }
        setRecent((prev) => [...prev, json]);
        onUploaded(json);
      }
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) upload(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors",
          dragging && "border-primary bg-accent/50"
        )}
      >
        <input
          type="file"
          multiple={multiple}
          accept={ACCEPTED}
          className="hidden"
          disabled={uploading}
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">Drag & drop files, or click to browse</p>
        <p className="text-xs text-muted-foreground">
          PDF, DOC, PPT, XLS, ZIP, PNG, JPG, MP4 — up to 100MB each
        </p>
      </label>

      {recent.length > 0 && (
        <div className="space-y-1">
          {recent.map((f) => (
            <div key={f.url} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
              <FileIcon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 truncate">{f.fileName}</span>
              <span className="text-xs text-muted-foreground">{formatBytes(f.fileSizeBytes)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

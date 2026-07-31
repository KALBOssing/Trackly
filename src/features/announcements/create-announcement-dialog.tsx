"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { announcementSchema } from "@/lib/validations/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FileDropzone, type UploadedFile } from "@/features/uploads/file-dropzone";
import { z } from "zod";

type AnnouncementInput = z.infer<typeof announcementSchema>;

export function CreateAnnouncementDialog({ classes }: { classes: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingImages, setPendingImages] = useState<UploadedFile[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<UploadedFile[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { priority: "NORMAL", status: "PUBLISHED" },
  });

  async function onSubmit(data: AnnouncementInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images: pendingImages.map((f) => ({ imageUrl: f.url })),
          attachments: pendingAttachments.map((f) => ({
            fileName: f.fileName,
            fileUrl: f.url,
            fileType: f.fileType,
            fileSizeBytes: f.fileSizeBytes,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to post announcement");
        return;
      }
      toast.success(data.scheduledAt ? "Announcement scheduled" : "Announcement posted");
      reset();
      setPendingImages([]);
      setPendingAttachments([]);
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New Announcement
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">Post an announcement</Dialog.Title>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" rows={4} {...register("body")} />
              {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select onValueChange={(v) => setValue("classId", v === "all" ? undefined : v)} defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Entire school" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Entire school</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select onValueChange={(v) => setValue("priority", v as AnnouncementInput["priority"])} defaultValue="NORMAL">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="IMPORTANT">Important</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="scheduledAt">Schedule for later (optional)</Label>
                <Input id="scheduledAt" type="datetime-local" {...register("scheduledAt")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expiresAt">Expires (optional)</Label>
                <Input id="expiresAt" type="datetime-local" {...register("expiresAt")} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="rounded border-input" {...register("pinned")} />
              Pin to top
            </label>

            <div className="space-y-1.5">
              <Label>Images (optional)</Label>
              {pendingImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {pendingImages.map((img, i) => (
                    <div key={img.url} className="group relative aspect-square overflow-hidden rounded-md border border-border">
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPendingImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute right-1 top-1 rounded bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FileDropzone onUploaded={(f) => setPendingImages((prev) => [...prev, f])} />
            </div>

            <div className="space-y-1.5">
              <Label>Attachments (optional)</Label>
              {pendingAttachments.length > 0 && (
                <div className="space-y-1">
                  {pendingAttachments.map((f, i) => (
                    <div key={f.url} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                      <span className="flex-1 truncate">{f.fileName}</span>
                      <button
                        type="button"
                        onClick={() => setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FileDropzone onUploaded={(f) => setPendingAttachments((prev) => [...prev, f])} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {watch("scheduledAt") ? "Schedule" : "Post"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

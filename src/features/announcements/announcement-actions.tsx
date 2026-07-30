"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { Pencil, Loader2, Trash2 } from "lucide-react";
import { announcementSchema } from "@/lib/validations/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AnnouncementMediaManager } from "@/features/announcements/announcement-media-manager";
import { z } from "zod";

type AnnouncementInput = z.infer<typeof announcementSchema>;

export function AnnouncementActions({
  announcementId,
  title,
  body,
  pinned,
  priority,
  images,
  attachments,
}: {
  announcementId: string;
  title: string;
  body: string;
  pinned: boolean;
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  images: { id: string; imageUrl: string }[];
  attachments: { id: string; fileName: string; fileSizeBytes: number }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title, body, pinned, priority },
  });

  async function onSubmit(data: AnnouncementInput) {
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements/${announcementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to update announcement");
        return;
      }
      toast.success("Announcement updated");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    const res = await fetch(`/api/announcements/${announcementId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete announcement");
      return;
    }
    toast.success("Announcement deleted");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button size="sm" variant="ghost">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold">Edit announcement</Dialog.Title>

            <Tabs.Root defaultValue="details" className="mt-4">
              <Tabs.List className="flex gap-4 border-b border-border text-sm">
                <Tabs.Trigger value="details" className="pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Details
                </Tabs.Trigger>
                <Tabs.Trigger value="media" className="pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Images & Attachments
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="details" className="pt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input id="edit-title" {...register("title")} />
                    {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-body">Message</Label>
                    <Textarea id="edit-body" rows={4} {...register("body")} />
                    {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select onValueChange={(v) => setValue("priority", v as AnnouncementInput["priority"])} defaultValue={priority}>
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
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" className="rounded border-input" {...register("pinned")} />
                    Pin to top
                  </label>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Tabs.Content>

              <Tabs.Content value="media" className="pt-4">
                <AnnouncementMediaManager announcementId={announcementId} images={images} attachments={attachments} />
              </Tabs.Content>
            </Tabs.Root>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmButton
        onConfirm={remove}
        title="Delete this announcement?"
        description={`"${title}" will be permanently deleted for everyone who can see it.`}
        confirmLabel="Delete"
        triggerVariant="ghost"
        triggerLabel="Delete"
        triggerIcon={<Trash2 className="h-3.5 w-3.5" />}
        className="text-destructive"
      />
    </div>
  );
}

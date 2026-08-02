"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { lessonPathwayConfigSchema, type LessonPathwayConfigInput } from "@/lib/validations/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileDropzone, type UploadedFile } from "@/features/uploads/file-dropzone";

export function AddPathwayDialog({
  lessonId,
  pathwayCatalog,
}: {
  lessonId: string;
  pathwayCatalog: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingResources, setPendingResources] = useState<UploadedFile[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<LessonPathwayConfigInput>({
    defaultValues: { points: 100, required: true, allowResubmission: false },
  });

  async function onSubmit(data: LessonPathwayConfigInput) {
    const parsed = lessonPathwayConfigSchema.safeParse({
      ...data,
      resources: pendingResources.map((f) => ({
        fileName: f.fileName,
        fileUrl: f.url,
        fileType: f.fileType,
        fileSizeBytes: f.fileSizeBytes,
      })),
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/pathways`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to add pathway");
        return;
      }
      toast.success("Pathway added");
      reset();
      setPendingResources([]);
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-3.5 w-3.5" /> Add Pathway
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">Add a GLOW Pathway</Dialog.Title>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Pathway</Label>
              <Select onValueChange={(v) => setValue("pathwayId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a GLOW pathway" />
                </SelectTrigger>
                <SelectContent>
                  {pathwayCatalog.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-instructions">Instructions</Label>
              <Textarea id="ap-instructions" rows={3} {...register("instructions", { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ap-points">Points</Label>
                <Input id="ap-points" type="number" {...register("points", { required: true })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ap-due">Due Override (optional)</Label>
                <Input id="ap-due" type="datetime-local" {...register("dueDateOverride")} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={!!watch("required")} onCheckedChange={(v) => setValue("required", v)} />
                Required
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={!!watch("allowResubmission")} onCheckedChange={(v) => setValue("allowResubmission", v)} />
                Allow resubmission
              </label>
            </div>
            <div className="space-y-1.5">
              <Label>Pathway Files (optional)</Label>
              {pendingResources.length > 0 && (
                <div className="space-y-1">
                  {pendingResources.map((f, i) => (
                    <div key={f.url} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                      <span className="flex-1 truncate">{f.fileName}</span>
                      <button
                        type="button"
                        onClick={() => setPendingResources((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FileDropzone onUploaded={(f) => setPendingResources((prev) => [...prev, f])} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Pathway
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

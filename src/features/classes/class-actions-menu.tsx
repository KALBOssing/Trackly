"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Pencil, Archive, ArchiveRestore, Trash2, Loader2 } from "lucide-react";
import { classSchema, type ClassInput } from "@/lib/validations/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function ClassActionsMenu({
  classId,
  name,
  gradeLevel,
  section,
  status,
}: {
  classId: string;
  name: string;
  gradeLevel: string;
  section: string;
  status: "ACTIVE" | "ARCHIVED";
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassInput>({ resolver: zodResolver(classSchema), defaultValues: { name, gradeLevel, section } });

  async function onSubmit(data: ClassInput) {
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to update class");
        return;
      }
      toast.success("Class updated");
      setEditOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function toggleArchive() {
    const res = await fetch(`/api/classes/${classId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED" }),
    });
    if (!res.ok) {
      toast.error("Failed to update class");
      return;
    }
    toast.success(status === "ARCHIVED" ? "Class restored" : "Class archived");
    router.refresh();
  }

  async function remove() {
    const res = await fetch(`/api/classes/${classId}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error ?? "Failed to delete class");
      return;
    }
    toast.success("Class deleted");
    router.push("/classes");
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline" size="icon" aria-label="Class actions menu">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 min-w-[10rem] rounded-md border border-border bg-card p-1 shadow-md"
          >
            <DropdownMenu.Item
              onSelect={() => setEditOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={toggleArchive}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary"
            >
              {status === "ARCHIVED" ? (
                <>
                  <ArchiveRestore className="h-3.5 w-3.5" /> Restore
                </>
              ) : (
                <>
                  <Archive className="h-3.5 w-3.5" /> Archive
                </>
              )}
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()} className="p-0">
              <ConfirmButton
                onConfirm={remove}
                title="Delete this class?"
                description={`"${name}" can only be deleted if it has no students enrolled. If it does, archive it instead.`}
                confirmLabel="Delete Class"
                triggerVariant="ghost"
                triggerLabel="Delete"
                triggerIcon={<Trash2 className="h-3.5 w-3.5" />}
                className="w-full justify-start gap-2 px-2 py-1.5 text-sm font-normal text-destructive hover:bg-secondary"
              />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold">Edit class</Dialog.Title>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Class Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Input id="gradeLevel" {...register("gradeLevel")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="section">Section</Label>
                  <Input id="section" {...register("section")} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Pencil, Copy, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";

type LessonStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export function LessonActionsMenu({
  lessonId,
  title,
  status,
}: {
  lessonId: string;
  title: string;
  status: LessonStatus;
}) {
  const router = useRouter();

  async function duplicate() {
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Failed to duplicate");
      return;
    }
    toast.success("Duplicated as a new draft");
    router.push(`/lessons/${json.lesson.id}/edit`);
  }

  async function toggleArchive() {
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: status === "ARCHIVED" ? "unarchive" : "archive" }),
    });
    if (!res.ok) {
      toast.error("Failed to update lesson");
      return;
    }
    toast.success(status === "ARCHIVED" ? "Lesson restored to draft" : "Lesson archived");
    router.refresh();
  }

  async function remove() {
    const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete lesson");
      return;
    }
    toast.success("Lesson deleted");
    router.push("/lessons");
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" size="icon" aria-label="Lesson actions menu">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-[10rem] rounded-md border border-border bg-card p-1 shadow-md"
        >
          <DropdownMenu.Item asChild>
            <Link
              href={`/lessons/${lessonId}/edit`}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={duplicate}
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary"
          >
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={toggleArchive}
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary"
          >
            {status === "ARCHIVED" ? (
              <>
                <ArchiveRestore className="h-3.5 w-3.5" /> Restore to Draft
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
              title="Delete this lesson?"
              description={`"${title}" and every resource, pathway, submission, and grade attached to it will be permanently deleted. This can't be undone.`}
              confirmLabel="Delete Lesson"
              triggerVariant="ghost"
              triggerLabel="Delete"
              triggerIcon={<Trash2 className="h-3.5 w-3.5" />}
              className="w-full justify-start gap-2 px-2 py-1.5 text-sm font-normal text-destructive hover:bg-secondary"
            />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

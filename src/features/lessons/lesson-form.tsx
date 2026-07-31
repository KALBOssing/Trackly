"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { lessonSchema, lessonUpdateSchema, type LessonPathwayConfigInput } from "@/lib/validations/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { SUBJECTS } from "@/lib/constants/subjects";
import { FileDropzone, type UploadedFile } from "@/features/uploads/file-dropzone";

type Option = { id: string; name: string };
type StudentOption = { id: string; name: string; classId: string };

type ExistingLesson = {
  id: string;
  title: string;
  description: string;
  objectives: string | null;
  subject: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  availableAt: string | null;
  dueDate: string | null;
  publishAt: string | null;
  closeAt: string | null;
};

type FormValues = {
  title: string;
  description: string;
  objectives: string;
  subject: string;
  availableAt: string;
  dueDate: string;
  publishAt: string;
  closeAt: string;
  pathways: LessonPathwayConfigInput[];
};

const emptyPathway: LessonPathwayConfigInput = {
  pathwayId: "",
  title: "",
  instructions: "",
  requirements: "",
  rubric: "",
  points: 100,
  allowResubmission: false,
  required: true,
};

export function LessonForm({
  pathwayCatalog,
  classes,
  students,
  existing,
}: {
  pathwayCatalog: Option[];
  classes: Option[];
  students: StudentOption[];
  existing?: ExistingLesson;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [pendingResources, setPendingResources] = useState<UploadedFile[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: existing
      ? {
          title: existing.title,
          description: existing.description,
          objectives: existing.objectives ?? "",
          subject: existing.subject ?? "",
          availableAt: existing.availableAt ?? "",
          dueDate: existing.dueDate ?? "",
          publishAt: existing.publishAt ?? "",
          closeAt: existing.closeAt ?? "",
          pathways: [],
        }
      : { pathways: [{ ...emptyPathway }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "pathways" });

  function toggleClass(id: string) {
    setSelectedClassIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }
  function toggleStudent(id: string) {
    setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function submit(status: "DRAFT" | "SCHEDULED" | "PUBLISHED", data: FormValues) {
    if (existing) {
      const parsed = lessonUpdateSchema.safeParse({ ...data, status });
      if (!parsed.success) {
        toast.error(parsed.error.errors[0]?.message ?? "Please check the form for errors");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/lessons/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Failed to save lesson");
          return;
        }
        toast.success("Lesson updated");
        router.push(`/lessons/${json.lesson.id}`);
        router.refresh();
      } finally {
        setLoading(false);
      }
      return;
    }

    const parsed = lessonSchema.safeParse({
      ...data,
      classIds: selectedClassIds,
      studentIds: selectedStudentIds,
      status,
      resources: pendingResources.map((f) => ({
        fileName: f.fileName,
        fileUrl: f.url,
        fileType: f.fileType,
        fileSizeBytes: f.fileSizeBytes,
      })),
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Please check the form for errors");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to create lesson");
        return;
      }
      toast.success(
        status === "PUBLISHED" ? "Lesson published" : status === "SCHEDULED" ? "Lesson scheduled" : "Draft saved"
      );
      router.push(`/lessons/${json.lesson.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const availableStudents = selectedClassIds.length
    ? students.filter((s) => selectedClassIds.includes(s.classId))
    : students;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{existing ? "Edit Lesson" : "New Lesson"}</CardTitle>
          {!existing && <CardDescription>Build the lesson, attach GLOW Pathways, then schedule or publish it.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Lesson Title</Label>
            <Input id="title" {...register("title", { required: true })} />
            {errors.title && <p className="text-xs text-destructive">Title is required</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Select onValueChange={(v) => setValue("subject", v)} value={watch("subject")}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>
            <div />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description", { required: true })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="objectives">Learning Objectives</Label>
            <Textarea id="objectives" rows={2} {...register("objectives")} />
          </div>

          {!existing && (
            <>
              <div className="space-y-1.5">
                <Label>Class(es)</Label>
                <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-input p-3">
                  {classes.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                        checked={selectedClassIds.includes(c.id)}
                        onChange={() => toggleClass(c.id)}
                      />
                      {c.name}
                    </label>
                  ))}
                  {classes.length === 0 && (
                    <p className="col-span-2 text-sm text-muted-foreground">Create a class first.</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Individual Students (optional, in addition to selected classes)</Label>
                <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-input p-3">
                  {availableStudents.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                        checked={selectedStudentIds.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                      />
                      {s.name}
                    </label>
                  ))}
                  {availableStudents.length === 0 && (
                    <p className="col-span-2 text-sm text-muted-foreground">No students to show yet.</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="availableAt">Available From</Label>
              <Input id="availableAt" type="datetime-local" {...register("availableAt")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="datetime-local" {...register("dueDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="publishAt">Scheduled Publish (leave blank to publish immediately)</Label>
              <Input id="publishAt" type="datetime-local" {...register("publishAt")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="closeAt">Scheduled Close (optional)</Label>
              <Input id="closeAt" type="datetime-local" {...register("closeAt")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {!existing && (
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Upload any learning materials students should see with this lesson.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingResources.length > 0 && (
              <div className="space-y-1.5">
                {pendingResources.map((f, i) => (
                  <div key={f.url} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                    <span className="flex-1 truncate">{f.fileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setPendingResources((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <FileDropzone onUploaded={(f) => setPendingResources((prev) => [...prev, f])} />
          </CardContent>
        </Card>
      )}

      {!existing && (
        <Card>
          <CardHeader>
            <CardTitle>GLOW Pathways</CardTitle>
            <CardDescription>Add any combination of the five pathways as activities for this lesson.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-3 rounded-md border border-border p-4">
                <div className="flex items-center justify-between">
                  <Label>Pathway {index + 1}</Label>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <Select
                  onValueChange={(v) => setValue(`pathways.${index}.pathwayId`, v)}
                  value={watch(`pathways.${index}.pathwayId`)}
                >
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

                <Input placeholder="Pathway title" {...register(`pathways.${index}.title`, { required: true })} />

                <RichTextEditor
                  value={watch(`pathways.${index}.instructions`) ?? ""}
                  onChange={(html) => setValue(`pathways.${index}.instructions`, html)}
                  placeholder="Instructions for students…"
                />

                <Textarea
                  rows={2}
                  placeholder="Requirements (optional)"
                  {...register(`pathways.${index}.requirements`)}
                />
                <Textarea rows={2} placeholder="Rubric (optional)" {...register(`pathways.${index}.rubric`)} />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Points</Label>
                    <Input type="number" {...register(`pathways.${index}.points`, { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due Date Override (optional)</Label>
                    <Input type="datetime-local" {...register(`pathways.${index}.dueDateOverride`)} />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={watch(`pathways.${index}.required`)}
                      onCheckedChange={(v) => setValue(`pathways.${index}.required`, v)}
                    />
                    Required
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={watch(`pathways.${index}.allowResubmission`)}
                      onCheckedChange={(v) => setValue(`pathways.${index}.allowResubmission`, v)}
                    />
                    Allow resubmission
                  </label>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={() => append({ ...emptyPathway })}>
              <Plus className="h-4 w-4" /> Add Pathway
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        {existing ? (
          <Button disabled={loading} onClick={handleSubmit((data) => submit(existing.status === "SCHEDULED" ? "SCHEDULED" : "PUBLISHED", data))}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        ) : (
          <>
            <Button variant="outline" disabled={loading} onClick={handleSubmit((data) => submit("DRAFT", data))}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save as Draft
            </Button>
            <Button
              variant="outline"
              disabled={loading}
              onClick={handleSubmit((data) =>
                submit(data.publishAt ? "SCHEDULED" : "PUBLISHED", data)
              )}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {watch("publishAt") ? "Schedule" : "Publish Now"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

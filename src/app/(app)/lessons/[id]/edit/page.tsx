import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LessonForm } from "@/features/lessons/lesson-form";

function toLocalInput(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditLessonPage({ params }: { params: { id: string } }) {
  const user = await requireRole("TEACHER");

  const [lesson, pathwayCatalog, classes] = await Promise.all([
    prisma.lesson.findFirst({ where: { id: params.id, teacherId: user.teacherProfileId } }),
    prisma.pathway.findMany({ orderBy: { order: "asc" } }),
    prisma.class.findMany({ where: { teacherId: user.teacherProfileId }, orderBy: { name: "asc" } }),
  ]);
  if (!lesson) notFound();

  return (
    <>
      <Topbar title={`Edit: ${lesson.title}`} name={user.name ?? ""} />
      <Breadcrumbs
        items={[{ label: "Lessons", href: "/lessons" }, { label: lesson.title, href: `/lessons/${lesson.id}` }, { label: "Edit" }]}
      />
      <div className="p-6">
        <LessonForm
          pathwayCatalog={pathwayCatalog}
          classes={classes}
          students={[]}
          existing={{
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            objectives: lesson.objectives,
            subject: lesson.subject,
            status: lesson.status,
            availableAt: toLocalInput(lesson.availableAt) || null,
            dueDate: toLocalInput(lesson.dueDate) || null,
            publishAt: toLocalInput(lesson.publishAt) || null,
            closeAt: toLocalInput(lesson.closeAt) || null,
          }}
        />
      </div>
    </>
  );
}

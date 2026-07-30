import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LessonForm } from "@/features/lessons/lesson-form";

export default async function NewLessonPage() {
  const user = await requireRole("TEACHER");

  const [pathwayCatalog, classes] = await Promise.all([
    prisma.pathway.findMany({ orderBy: { order: "asc" } }),
    prisma.class.findMany({ where: { teacherId: user.teacherProfileId }, orderBy: { name: "asc" } }),
  ]);

  const students = await prisma.studentProfile.findMany({
    where: { class: { teacherId: user.teacherProfileId } },
    include: { user: true },
  });

  return (
    <>
      <Topbar title="New Lesson" name={user.name ?? ""} />
      <Breadcrumbs items={[{ label: "Lessons", href: "/lessons" }, { label: "New" }]} />
      <div className="p-6">
        <LessonForm
          pathwayCatalog={pathwayCatalog}
          classes={classes}
          students={students.map((s) => ({
            id: s.id,
            name: `${s.user.firstName} ${s.user.lastName}`,
            classId: s.classId ?? "",
          }))}
        />
      </div>
    </>
  );
}

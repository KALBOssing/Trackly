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

  const enrollments = await prisma.enrollment.findMany({
    where: { class: { teacherId: user.teacherProfileId } },
    include: { student: { include: { user: true } } },
  });
  const studentsMap = new Map<string, { id: string; name: string; classIds: string[] }>();
  for (const e of enrollments) {
    const existing = studentsMap.get(e.studentId);
    if (existing) {
      existing.classIds.push(e.classId);
    } else {
      studentsMap.set(e.studentId, {
        id: e.studentId,
        name: `${e.student.user.firstName} ${e.student.user.lastName}`,
        classIds: [e.classId],
      });
    }
  }
  const students = Array.from(studentsMap.values());

  return (
    <>
      <Topbar title="New Lesson" name={user.name ?? ""} />
      <Breadcrumbs items={[{ label: "Lessons", href: "/lessons" }, { label: "New" }]} />
      <div className="p-6">
        <LessonForm pathwayCatalog={pathwayCatalog} classes={classes} students={students} />
      </div>
    </>
  );
}

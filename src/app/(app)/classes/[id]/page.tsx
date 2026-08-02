import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkImportButton } from "@/features/classes/bulk-import-button";
import { ClassActionsMenu } from "@/features/classes/class-actions-menu";
import { RemoveStudentButton } from "@/features/classes/remove-student-button";
import { initials, formatDate } from "@/lib/utils";

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();

  const cls = await prisma.class.findUnique({
    where: { id: params.id },
    include: {
      enrollments: { include: { student: { include: { user: true } } }, orderBy: { student: { studentId: "asc" } } },
      teacher: { include: { user: true } },
    },
  });

  if (!cls) notFound();

  const isOwner = user.role === "TEACHER" && cls.teacherId === user.teacherProfileId;
  const isEnrolled = user.role === "STUDENT" && cls.enrollments.some((e) => e.studentId === user.studentProfileId);
  if (!isOwner && !isEnrolled) notFound();

  const roster = cls.enrollments.map((e) => e.student);

  const lessons = await prisma.lesson.findMany({
    where: { assignments: { some: { classId: cls.id } } },
    include: { pathways: { include: { pathway: true } } },
    orderBy: { dueDate: "asc" },
  });

  return (
    <>
      <Topbar title={cls.name} name={user.name ?? ""} />
      <Breadcrumbs items={[{ label: "Classes", href: "/classes" }, { label: cls.name }]} />
      <div className="space-y-6 p-6">
        {isOwner && (
          <div className="flex items-center justify-between">
            {cls.status === "ARCHIVED" && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Archived
              </span>
            )}
            <div className="ml-auto">
              <ClassActionsMenu
                classId={cls.id}
                name={cls.name}
                gradeLevel={cls.gradeLevel}
                section={cls.section}
                status={cls.status}
              />
            </div>
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Roster ({roster.length})</CardTitle>
              {isOwner && <BulkImportButton classId={cls.id} />}
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {roster.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                      {initials(s.user.firstName, s.user.lastName)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {s.user.firstName} {s.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.studentId}</p>
                    </div>
                    {isOwner && (
                      <RemoveStudentButton
                        classId={cls.id}
                        studentId={s.id}
                        studentName={`${s.user.firstName} ${s.user.lastName}`}
                      />
                    )}
                  </div>
                ))}
                {roster.length === 0 && (
                  <p className="py-3 text-sm text-muted-foreground">No students enrolled yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lessons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lessons.map((l) => (
                <Link
                  key={l.id}
                  href={`/lessons/${l.id}`}
                  className="block rounded-md border border-border p-3 text-sm hover:bg-secondary/50"
                >
                  <p className="font-medium">{l.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.pathways.length} pathway{l.pathways.length === 1 ? "" : "s"}
                    {l.dueDate && ` · Due ${formatDate(l.dueDate)}`}
                  </p>
                </Link>
              ))}
              {lessons.length === 0 && (
                <p className="text-sm text-muted-foreground">No lessons yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

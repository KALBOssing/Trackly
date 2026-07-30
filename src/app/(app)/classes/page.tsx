import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { CreateClassDialog } from "@/features/classes/create-class-dialog";
import { ClassesGrid } from "@/features/classes/classes-grid";

export default async function ClassesPage() {
  const user = await requireUser();

  const classes =
    user.role === "TEACHER"
      ? await prisma.class.findMany({
          where: { teacherId: user.teacherProfileId },
          include: { _count: { select: { students: true, lessonAssignments: true } } },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.class.findMany({
          where: { students: { some: { id: user.studentProfileId } } },
          include: { _count: { select: { students: true, lessonAssignments: true } }, teacher: { include: { user: true } } },
        });

  return (
    <>
      <Topbar title="Classes" name={user.name ?? ""} />
      <div className="space-y-6 p-6">
        {user.role === "TEACHER" && (
          <div className="flex justify-end">
            <CreateClassDialog />
          </div>
        )}

        {classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {user.role === "TEACHER" ? "You haven't created any classes yet." : "You aren't enrolled in a class yet."}
          </p>
        ) : (
          <ClassesGrid classes={classes} canFilterByStatus={user.role === "TEACHER"} />
        )}
      </div>
    </>
  );
}

import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { CreateClassDialog } from "@/features/classes/create-class-dialog";
import { ClassesGrid } from "@/features/classes/classes-grid";
import { JoinClassSection } from "@/features/classes/join-class-section";
import { PendingJoinRequests } from "@/features/classes/pending-join-requests";

export default async function ClassesPage() {
  const user = await requireUser();

  if (user.role === "TEACHER") {
    const [classes, pendingRequests] = await Promise.all([
      prisma.class.findMany({
        where: { teacherId: user.teacherProfileId },
        include: { _count: { select: { students: true, lessonAssignments: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.classJoinRequest.findMany({
        where: { status: "PENDING", class: { teacherId: user.teacherProfileId } },
        include: { student: { include: { user: true } }, class: true },
        orderBy: { requestedAt: "asc" },
      }),
    ]);

    return (
      <>
        <Topbar title="Classes" name={user.name ?? ""} />
        <div className="space-y-6 p-6">
          <div className="flex justify-end">
            <CreateClassDialog />
          </div>

          <PendingJoinRequests requests={pendingRequests} />

          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven&apos;t created any classes yet.</p>
          ) : (
            <ClassesGrid classes={classes} canFilterByStatus />
          )}
        </div>
      </>
    );
  }

  // Student view
  const studentProfile = await prisma.studentProfile.findUnique({ where: { id: user.studentProfileId! } });

  if (!studentProfile?.classId) {
    const [availableClasses, myRequests] = await Promise.all([
      prisma.class.findMany({
        where: { status: "ACTIVE" },
        include: { teacher: { include: { user: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.classJoinRequest.findMany({
        where: { studentId: user.studentProfileId },
        include: { class: true },
      }),
    ]);

    return (
      <>
        <Topbar title="Classes" name={user.name ?? ""} />
        <div className="space-y-6 p-6">
          <JoinClassSection availableClasses={availableClasses} myRequests={myRequests} />
        </div>
      </>
    );
  }

  const classes = await prisma.class.findMany({
    where: { students: { some: { id: user.studentProfileId } } },
    include: { _count: { select: { students: true, lessonAssignments: true } }, teacher: { include: { user: true } } },
  });

  return (
    <>
      <Topbar title="Classes" name={user.name ?? ""} />
      <div className="space-y-6 p-6">
        <ClassesGrid classes={classes} canFilterByStatus={false} />
      </div>
    </>
  );
}

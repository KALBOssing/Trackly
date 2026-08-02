import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lessonSchema } from "@/lib/validations/academic";
import { sendNewLessonEmail } from "@/lib/email";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  if (session.user.role === "TEACHER") {
    const lessons = await prisma.lesson.findMany({
      where: {
        teacherId: session.user.teacherProfileId,
        ...(status && { status: status as any }),
      },
      include: {
        pathways: { include: { pathway: true } },
        assignments: { include: { class: true } },
        _count: { select: { pathways: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ lessons });
  }

  // Students only ever see published lessons assigned to their class or to them individually.
  const lessons = await prisma.lesson.findMany({
    where: {
      status: "PUBLISHED",
      assignments: {
        some: {
          OR: [
            { class: { enrollments: { some: { studentId: session.user.studentProfileId } } } },
            { studentId: session.user.studentProfileId ?? undefined },
          ],
        },
      },
      ...(status && { status: status as any }),
    },
    include: { pathways: { include: { pathway: true } } },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json({ lessons });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = lessonSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Ownership check: every selected class must belong to this teacher.
  const ownedClasses = await prisma.class.findMany({
    where: { id: { in: data.classIds }, teacherId: session.user.teacherProfileId },
    select: { id: true },
  });
  if (ownedClasses.length !== data.classIds.length) {
    return NextResponse.json({ error: "One or more selected classes were not found" }, { status: 404 });
  }

  const status = data.status === "PUBLISHED" && data.publishAt ? "SCHEDULED" : data.status;

  const pathwayCatalog = await prisma.pathway.findMany({
    where: { id: { in: data.pathways.map((p) => p.pathwayId) } },
    select: { id: true, name: true },
  });
  const pathwayNameById = new Map(pathwayCatalog.map((p) => [p.id, p.name]));

  const lesson = await prisma.lesson.create({
    data: {
      title: data.title,
      description: data.description || null,
      objectives: data.objectives || null,
      subject: data.subject,
      teacherId: session.user.teacherProfileId!,
      status,
      availableAt: data.availableAt,
      dueDate: data.dueDate,
      publishAt: data.publishAt,
      closeAt: data.closeAt,
      timezone: data.timezone,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      assignments: {
        create: [
          ...data.classIds.map((classId) => ({ classId })),
          ...data.studentIds.map((studentId) => ({ studentId })),
        ],
      },
      pathways: {
        create: data.pathways.map((p, order) => ({
          pathwayId: p.pathwayId,
          title: p.title || pathwayNameById.get(p.pathwayId) || "Pathway",
          instructions: p.instructions,
          requirements: p.requirements || null,
          rubric: p.rubric || null,
          points: p.points,
          dueDateOverride: p.dueDateOverride,
          allowResubmission: p.allowResubmission,
          required: p.required,
          order,
          resources: {
            create: p.resources.map((r, rOrder) => ({
              fileName: r.fileName,
              fileUrl: r.fileUrl,
              fileType: r.fileType,
              fileSizeBytes: r.fileSizeBytes,
              order: rOrder,
            })),
          },
        })),
      },
      resources: {
        create: data.resources.map((r, order) => ({
          fileName: r.fileName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          fileSizeBytes: r.fileSizeBytes,
          order,
        })),
      },
    },
    include: { pathways: true },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "LESSON_CREATED",
      metadata: { lessonId: lesson.id, classCount: data.classIds.length },
    },
  });

  if (status === "PUBLISHED") {
    const recipients = await prisma.studentProfile.findMany({
      where: {
        OR: [{ enrollments: { some: { classId: { in: data.classIds } } } }, { id: { in: data.studentIds } }],
      },
      include: { user: true },
    });

    await prisma.notification.createMany({
      data: recipients.map((s) => ({
        userId: s.user.id,
        type: "NEW_LESSON" as const,
        title: "New lesson posted",
        body: `"${lesson.title}" has been posted to you.`,
        link: `/lessons/${lesson.id}`,
      })),
    });

    await Promise.all(
      recipients
        .filter((s) => s.user.notificationsOptIn)
        .map((s) => sendNewLessonEmail(s.user.email, lesson.title, lesson.id, lesson.dueDate))
    );
  }

  return NextResponse.json({ lesson }, { status: 201 });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ action: z.enum(["approve", "deny"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const request = await prisma.classJoinRequest.findUnique({
    where: { id: params.id },
    include: { class: true, student: { include: { user: true } } },
  });
  if (!request || request.class.teacherId !== session.user.teacherProfileId) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "This request has already been handled" }, { status: 409 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  if (parsed.data.action === "approve") {
    const alreadyInClass = await prisma.studentProfile.findUnique({ where: { id: request.studentId } });
    if (alreadyInClass?.classId) {
      return NextResponse.json({ error: "This student is already enrolled in a class" }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.studentProfile.update({ where: { id: request.studentId }, data: { classId: request.classId } }),
      prisma.classJoinRequest.update({
        where: { id: request.id },
        data: { status: "APPROVED", respondedAt: new Date() },
      }),
      // Any other pending requests from this student are no longer relevant once admitted.
      prisma.classJoinRequest.updateMany({
        where: { studentId: request.studentId, status: "PENDING", id: { not: request.id } },
        data: { status: "DENIED", respondedAt: new Date() },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: request.student.user.id,
        type: "CLASS_JOIN_APPROVED",
        title: "You've been admitted to a class",
        body: `You're now enrolled in "${request.class.name}".`,
        link: "/classes",
      },
    });
  } else {
    await prisma.classJoinRequest.update({
      where: { id: request.id },
      data: { status: "DENIED", respondedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: request.student.user.id,
        type: "CLASS_JOIN_DENIED",
        title: "Class join request declined",
        body: `Your request to join "${request.class.name}" was declined.`,
        link: "/classes",
      },
    });
  }

  return NextResponse.json({ success: true });
}

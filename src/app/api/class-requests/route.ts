import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "TEACHER") {
    const requests = await prisma.classJoinRequest.findMany({
      where: { status: "PENDING", class: { teacherId: session.user.teacherProfileId } },
      include: { student: { include: { user: true } }, class: true },
      orderBy: { requestedAt: "asc" },
    });
    return NextResponse.json({ requests });
  }

  const requests = await prisma.classJoinRequest.findMany({
    where: { studentId: session.user.studentProfileId },
    include: { class: { include: { teacher: { include: { user: true } } } } },
    orderBy: { requestedAt: "desc" },
  });
  return NextResponse.json({ requests });
}

const schema = z.object({ classId: z.string().min(1), message: z.string().max(300).optional() });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const student = await prisma.studentProfile.findUnique({ where: { id: session.user.studentProfileId! } });
  if (student?.classId) {
    return NextResponse.json({ error: "You're already enrolled in a class" }, { status: 409 });
  }

  const cls = await prisma.class.findUnique({ where: { id: parsed.data.classId } });
  if (!cls || cls.status !== "ACTIVE") {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const existing = await prisma.classJoinRequest.findUnique({
    where: { studentId_classId: { studentId: session.user.studentProfileId!, classId: cls.id } },
  });
  if (existing && existing.status === "PENDING") {
    return NextResponse.json({ error: "You already have a pending request for this class" }, { status: 409 });
  }

  const request = existing
    ? await prisma.classJoinRequest.update({
        where: { id: existing.id },
        data: { status: "PENDING", message: parsed.data.message || null, requestedAt: new Date(), respondedAt: null },
      })
    : await prisma.classJoinRequest.create({
        data: { studentId: session.user.studentProfileId!, classId: cls.id, message: parsed.data.message || null },
      });

  const teacherUser = await prisma.user.findFirst({ where: { teacherProfile: { id: cls.teacherId } } });
  if (teacherUser) {
    await prisma.notification.create({
      data: {
        userId: teacherUser.id,
        type: "CLASS_JOIN_REQUESTED",
        title: "New class join request",
        body: `A student has requested to join "${cls.name}".`,
        link: "/classes",
      },
    });
  }

  return NextResponse.json({ request }, { status: 201 });
}

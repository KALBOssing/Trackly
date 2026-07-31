import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations/academic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "TEACHER") {
    const announcements = await prisma.announcement.findMany({
      where: { teacherId: session.user.teacherProfileId },
      include: { class: true, images: { orderBy: { order: "asc" } }, attachments: true },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ announcements });
  }

  const now = new Date();
  const announcements = await prisma.announcement.findMany({
    where: {
      status: "PUBLISHED",
      AND: [
        {
          OR: [
            { classId: null },
            { class: { students: { some: { id: session.user.studentProfileId } } } },
            { studentId: session.user.studentProfileId },
          ],
        },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ],
    },
    include: { images: { orderBy: { order: "asc" } }, attachments: true },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ announcements });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = announcementSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.classId) {
    const owns = await prisma.class.findFirst({
      where: { id: parsed.data.classId, teacherId: session.user.teacherProfileId },
    });
    if (!owns) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const isScheduledForLater = !!parsed.data.scheduledAt && parsed.data.scheduledAt > new Date();
  const status = parsed.data.status === "DRAFT" ? "DRAFT" : isScheduledForLater ? "SCHEDULED" : "PUBLISHED";

  const created = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      classId: parsed.data.classId || null,
      studentId: parsed.data.studentId || null,
      pinned: parsed.data.pinned ?? false,
      priority: parsed.data.priority,
      status,
      scheduledAt: parsed.data.scheduledAt ?? null,
      expiresAt: parsed.data.expiresAt ?? null,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      teacherId: session.user.teacherProfileId!,
      images: {
        create: parsed.data.images.map((img, order) => ({ imageUrl: img.imageUrl, order })),
      },
      attachments: {
        create: parsed.data.attachments,
      },
    },
  });

  if (status === "PUBLISHED") {
    const recipients = await prisma.studentProfile.findMany({
      where: parsed.data.classId
        ? { classId: parsed.data.classId }
        : parsed.data.studentId
          ? { id: parsed.data.studentId }
          : { class: { teacherId: session.user.teacherProfileId } },
      include: { user: true },
    });
    await prisma.notification.createMany({
      data: recipients.map((s) => ({
        userId: s.user.id,
        type: "ANNOUNCEMENT" as const,
        title: created.priority === "URGENT" ? `Urgent: ${created.title}` : created.title,
        body: created.body.slice(0, 140),
        link: `/announcements`,
      })),
    });
  }

  return NextResponse.json({ announcement: created }, { status: 201 });
}

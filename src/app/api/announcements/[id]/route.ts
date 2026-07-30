import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations/academic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.announcement.findFirst({
    where: { id: params.id, teacherId: session.user.teacherProfileId },
  });
  if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

  const parsed = announcementSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.classId !== undefined) data.classId = parsed.data.classId || existing.classId;
  if (parsed.data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
    data.publishedAt = new Date();
  }

  const updated = await prisma.announcement.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json({ announcement: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.announcement.findFirst({
    where: { id: params.id, teacherId: session.user.teacherProfileId },
  });
  if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

  await prisma.announcement.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}

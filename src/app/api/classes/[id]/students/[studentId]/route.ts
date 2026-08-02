import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string; studentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cls = await prisma.class.findFirst({ where: { id: params.id, teacherId: session.user.teacherProfileId } });
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId: params.studentId, classId: params.id } },
  });
  if (!enrollment) return NextResponse.json({ error: "Student is not in this class" }, { status: 404 });

  await prisma.enrollment.delete({ where: { id: enrollment.id } });

  return NextResponse.json({ success: true });
}

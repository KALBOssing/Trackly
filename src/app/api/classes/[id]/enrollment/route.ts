import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId: session.user.studentProfileId!, classId: params.id } },
  });
  if (!enrollment) return NextResponse.json({ error: "You're not enrolled in this class" }, { status: 404 });

  await prisma.enrollment.delete({ where: { id: enrollment.id } });

  return NextResponse.json({ success: true });
}

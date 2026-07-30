import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/lib/validations/academic";
import { z } from "zod";

async function getOwnedClass(id: string, teacherProfileId: string) {
  return prisma.class.findFirst({ where: { id, teacherId: teacherProfileId } });
}

const patchSchema = classSchema.partial().extend({
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOwnedClass(params.id, session.user.teacherProfileId!);
  if (!existing) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.class.update({ where: { id: existing.id }, data: parsed.data });
  return NextResponse.json({ class: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOwnedClass(params.id, session.user.teacherProfileId!);
  if (!existing) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const studentCount = await prisma.studentProfile.count({ where: { classId: existing.id } });
  if (studentCount > 0) {
    return NextResponse.json(
      { error: "This class still has students enrolled. Archive it instead, or remove all students first." },
      { status: 400 }
    );
  }

  await prisma.class.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}

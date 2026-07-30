import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/lib/validations/academic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "TEACHER") {
    const classes = await prisma.class.findMany({
      where: { teacherId: session.user.teacherProfileId },
      include: { _count: { select: { students: true, lessonAssignments: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ classes });
  }

  // Students see only their own class.
  const profile = await prisma.studentProfile.findUnique({
    where: { id: session.user.studentProfileId },
    include: { class: true },
  });
  return NextResponse.json({ classes: profile?.class ? [profile.class] : [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = classSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.class.create({
    data: { ...parsed.data, teacherId: session.user.teacherProfileId! },
  });

  await prisma.activityLog.create({
    data: { userId: session.user.id, action: "CLASS_CREATED", metadata: { classId: created.id } },
  });

  return NextResponse.json({ class: created }, { status: 201 });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  lessonPathwayId: z.string().min(1),
  action: z.enum(["SAVE_DRAFT", "SUBMIT"]),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const lessonPathway = await prisma.lessonPathway.findUnique({
    where: { id: parsed.data.lessonPathwayId },
    include: { lesson: true },
  });
  if (!lessonPathway || lessonPathway.lesson.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Pathway not found" }, { status: 404 });
  }

  // Confirm the student is actually assigned this lesson (by class or individually).
  const enrolled = await prisma.lessonAssignment.findFirst({
    where: {
      lessonId: lessonPathway.lessonId,
      OR: [
        { class: { enrollments: { some: { studentId: session.user.studentProfileId } } } },
        { studentId: session.user.studentProfileId },
      ],
    },
  });
  if (!enrolled) return NextResponse.json({ error: "Not assigned this lesson" }, { status: 403 });

  const effectiveDueDate = lessonPathway.dueDateOverride ?? lessonPathway.lesson.dueDate;
  const isLate = parsed.data.action === "SUBMIT" && !!effectiveDueDate && new Date() > effectiveDueDate;

  const submission = await prisma.submission.upsert({
    where: {
      lessonPathwayId_studentId: {
        lessonPathwayId: lessonPathway.id,
        studentId: session.user.studentProfileId!,
      },
    },
    create: {
      lessonPathwayId: lessonPathway.id,
      studentId: session.user.studentProfileId!,
      status: parsed.data.action === "SUBMIT" ? (isLate ? "LATE" : "SUBMITTED") : "DRAFT",
      submittedAt: parsed.data.action === "SUBMIT" ? new Date() : null,
      isLate,
    },
    update: {
      status: parsed.data.action === "SUBMIT" ? (isLate ? "LATE" : "SUBMITTED") : "DRAFT",
      submittedAt: parsed.data.action === "SUBMIT" ? new Date() : undefined,
      isLate,
    },
  });

  if (parsed.data.action === "SUBMIT") {
    const teacherUser = await prisma.user.findFirst({
      where: { teacherProfile: { id: lessonPathway.lesson.teacherId } },
      select: { id: true },
    });
    if (teacherUser) {
      await prisma.notification.create({
        data: {
          userId: teacherUser.id,
          type: "SUBMISSION_RECEIVED",
          title: "New submission received",
          body: `A student submitted "${lessonPathway.title}" in "${lessonPathway.lesson.title}".`,
          link: `/lessons/${lessonPathway.lessonId}`,
        },
      });
    }
  }

  return NextResponse.json({ submission });
}

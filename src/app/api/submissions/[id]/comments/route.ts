import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submissionCommentSchema } from "@/lib/validations/academic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { lessonPathway: { include: { lesson: true } } },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const isOwner = session.user.role === "STUDENT" && submission.studentId === session.user.studentProfileId;
  const isTeacher = session.user.role === "TEACHER" && submission.lessonPathway.lesson.teacherId === session.user.teacherProfileId;
  if (!isOwner && !isTeacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = submissionCommentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });

  const comment = await prisma.submissionComment.create({
    data: {
      submissionId: submission.id,
      studentId: session.user.role === "STUDENT" ? session.user.studentProfileId : null,
      body: parsed.data.body,
    },
  });

  if (isOwner) {
    const teacherUser = await prisma.user.findFirst({
      where: { teacherProfile: { id: submission.lessonPathway.lesson.teacherId } },
      select: { id: true },
    });
    if (teacherUser) {
      await prisma.notification.create({
        data: {
          userId: teacherUser.id,
          type: "STUDENT_COMMENT",
          title: "New comment on a submission",
          body: `A student commented on "${submission.lessonPathway.title}" in "${submission.lessonPathway.lesson.title}".`,
          link: `/lessons/${submission.lessonPathway.lessonId}`,
        },
      });
    }
  }

  return NextResponse.json({ comment }, { status: 201 });
}

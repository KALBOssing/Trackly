import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradeSchema } from "@/lib/validations/academic";
import { recomputeProgressAndAchievements } from "@/lib/achievements";
import { sendGradeReleasedEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { lessonPathway: { include: { lesson: true } }, student: { include: { user: true } } },
  });
  if (!submission || submission.lessonPathway.lesson.teacherId !== session.user.teacherProfileId) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const parsed = gradeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.score > submission.lessonPathway.points) {
    return NextResponse.json({ error: `Score cannot exceed ${submission.lessonPathway.points}` }, { status: 400 });
  }

  const grade = await prisma.grade.upsert({
    where: { submissionId: submission.id },
    create: {
      submissionId: submission.id,
      score: parsed.data.score,
      feedback: parsed.data.feedback || null,
      feedbackFileUrl: parsed.data.feedbackFileUrl || null,
      gradedById: session.user.teacherProfileId!,
      released: true,
    },
    update: {
      score: parsed.data.score,
      feedback: parsed.data.feedback || null,
      feedbackFileUrl: parsed.data.feedbackFileUrl || null,
      released: true,
      gradedAt: new Date(),
    },
  });

  await prisma.submission.update({ where: { id: submission.id }, data: { status: "GRADED" } });

  await prisma.notification.create({
    data: {
      userId: submission.student.user.id,
      type: "GRADE_RELEASED",
      title: "Grade released",
      body: `Your submission for "${submission.lessonPathway.title}" in "${submission.lessonPathway.lesson.title}" has been graded.`,
      link: `/lessons/${submission.lessonPathway.lessonId}`,
    },
  });

  await recomputeProgressAndAchievements(submission.studentId, submission.lessonPathway.pathwayId, {
    score: parsed.data.score,
    maxScore: submission.lessonPathway.points,
  });

  if (submission.student.user.notificationsOptIn) {
    await sendGradeReleasedEmail(
      submission.student.user.email,
      submission.lessonPathway.title,
      submission.lessonPathway.lessonId,
      parsed.data.score,
      submission.lessonPathway.points
    );
  }

  return NextResponse.json({ grade });
}

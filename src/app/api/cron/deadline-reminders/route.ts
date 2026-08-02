import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDeadlineReminderEmail } from "@/lib/email";

// Protect this route with a shared secret so only your scheduler can trigger it.
// Configure CRON_SECRET in your environment and call this with:
//   Authorization: Bearer <CRON_SECRET>

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const dueSoon = await prisma.lesson.findMany({
    where: { status: "PUBLISHED", dueDate: { gte: now, lte: in24Hours } },
    include: {
      assignments: {
        include: {
          class: { include: { enrollments: { include: { student: { include: { user: true } } } } } },
          student: { include: { user: true } },
        },
      },
      pathways: true,
    },
  });

  let sent = 0;
  for (const lesson of dueSoon) {
    const pathwayIds = lesson.pathways.map((p) => p.id);

    // Skip students who already submitted every pathway — no need to remind them.
    const submittedRows = await prisma.submission.findMany({
      where: { lessonPathwayId: { in: pathwayIds }, status: { in: ["SUBMITTED", "LATE", "GRADED", "REVIEWED"] } },
      select: { studentId: true, lessonPathwayId: true },
    });
    const fullySubmittedIds = new Set(
      Object.entries(
        submittedRows.reduce<Record<string, Set<string>>>((acc, s) => {
          (acc[s.studentId] ??= new Set()).add(s.lessonPathwayId);
          return acc;
        }, {})
      )
        .filter(([, done]) => done.size >= pathwayIds.length)
        .map(([studentId]) => studentId)
    );

    const recipients = [
      ...lesson.assignments.flatMap((a) => a.class?.enrollments.map((e) => e.student) ?? []),
      ...lesson.assignments.flatMap((a) => (a.student ? [a.student] : [])),
    ];
    const seen = new Set<string>();

    for (const student of recipients) {
      if (seen.has(student.id) || fullySubmittedIds.has(student.id) || !student.user.notificationsOptIn) continue;
      seen.add(student.id);

      await sendDeadlineReminderEmail(student.user.email, lesson.title, lesson.id, lesson.dueDate!);
      await prisma.notification.create({
        data: {
          userId: student.user.id,
          type: "DEADLINE_REMINDER",
          title: "Deadline approaching",
          body: `"${lesson.title}" is due within 24 hours.`,
          link: `/lessons/${lesson.id}`,
        },
      });
      sent++;
    }
  }

  return NextResponse.json({ success: true, lessonsChecked: dueSoon.length, remindersSent: sent });
}

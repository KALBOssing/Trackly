import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewLessonEmail } from "@/lib/email";

// Combined into one route so it only counts as a single Vercel cron job —
// the free "Hobby" plan caps you at 2 cron jobs total, run at most once a
// day. Publishes any lessons/announcements whose scheduled time has
// passed, and closes/expires ones whose end time has passed.
// Run with: Authorization: Bearer <CRON_SECRET>

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // --- Lessons ---
  const lessonsToPublish = await prisma.lesson.findMany({
    where: { status: "SCHEDULED", publishAt: { lte: now } },
    include: {
      assignments: {
        include: {
          class: { include: { enrollments: { include: { student: { include: { user: true } } } } } },
          student: { include: { user: true } },
        },
      },
    },
  });

  for (const lesson of lessonsToPublish) {
    await prisma.lesson.update({ where: { id: lesson.id }, data: { status: "PUBLISHED", publishedAt: now } });

    const recipients = [
      ...lesson.assignments.flatMap((a) => a.class?.enrollments.map((e) => e.student) ?? []),
      ...lesson.assignments.flatMap((a) => (a.student ? [a.student] : [])),
    ];
    const seen = new Set<string>();
    const unique = recipients.filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));

    await prisma.notification.createMany({
      data: unique.map((s) => ({
        userId: s.user.id,
        type: "LESSON_PUBLISHED" as const,
        title: "New lesson posted",
        body: `"${lesson.title}" has been posted to you.`,
        link: `/lessons/${lesson.id}`,
      })),
    });

    await Promise.all(
      unique
        .filter((s) => s.user.notificationsOptIn)
        .map((s) => sendNewLessonEmail(s.user.email, lesson.title, lesson.id, lesson.dueDate ?? now))
    );
  }

  const { count: lessonsClosed } = await prisma.lesson.updateMany({
    where: { status: "PUBLISHED", closeAt: { lte: now } },
    data: { status: "CLOSED" },
  });

  // --- Announcements ---
  const announcementsToPublish = await prisma.announcement.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now } },
  });

  for (const a of announcementsToPublish) {
    await prisma.announcement.update({ where: { id: a.id }, data: { status: "PUBLISHED", publishedAt: now } });

    const recipients = await prisma.studentProfile.findMany({
      where: a.classId
        ? { enrollments: { some: { classId: a.classId } } }
        : a.studentId
          ? { id: a.studentId }
          : { enrollments: { some: { class: { teacherId: a.teacherId } } } },
      include: { user: true },
    });
    await prisma.notification.createMany({
      data: recipients.map((s) => ({
        userId: s.user.id,
        type: "ANNOUNCEMENT" as const,
        title: a.priority === "URGENT" ? `Urgent: ${a.title}` : a.title,
        body: a.body.slice(0, 140),
        link: "/announcements",
      })),
    });
  }

  const { count: announcementsExpired } = await prisma.announcement.updateMany({
    where: { status: "PUBLISHED", expiresAt: { lte: now } },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({
    success: true,
    lessonsPublished: lessonsToPublish.length,
    lessonsClosed,
    announcementsPublished: announcementsToPublish.length,
    announcementsExpired,
  });
}

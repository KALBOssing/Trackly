import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results: { type: string; id: string; title: string; subtitle?: string; href: string }[] = [];

  if (session.user.role === "TEACHER") {
    const teacherProfileId = session.user.teacherProfileId!;

    const [lessons, classes, students, announcements] = await Promise.all([
      prisma.lesson.findMany({
        where: { teacherId: teacherProfileId, title: { contains: q, mode: "insensitive" } },
        take: 5,
      }),
      prisma.class.findMany({
        where: { teacherId: teacherProfileId, name: { contains: q, mode: "insensitive" } },
        take: 5,
      }),
      prisma.studentProfile.findMany({
        where: {
          class: { teacherId: teacherProfileId },
          OR: [
            { user: { firstName: { contains: q, mode: "insensitive" } } },
            { user: { lastName: { contains: q, mode: "insensitive" } } },
            { studentId: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { user: true, class: true },
        take: 5,
      }),
      prisma.announcement.findMany({
        where: { teacherId: teacherProfileId, title: { contains: q, mode: "insensitive" } },
        take: 5,
      }),
    ]);

    results.push(
      ...lessons.map((l) => ({
        type: "Lesson",
        id: l.id,
        title: l.title,
        subtitle: l.subject ?? undefined,
        href: `/lessons/${l.id}`,
      })),
      ...classes.map((c) => ({ type: "Class", id: c.id, title: c.name, href: `/classes/${c.id}` })),
      ...students.map((s) => ({
        type: "Student",
        id: s.id,
        title: `${s.user.firstName} ${s.user.lastName}`,
        subtitle: s.studentId,
        href: `/classes/${s.classId}`,
      })),
      ...announcements.map((a) => ({ type: "Announcement", id: a.id, title: a.title, href: `/announcements` }))
    );
  } else {
    const studentProfileId = session.user.studentProfileId!;

    const [lessons, announcements] = await Promise.all([
      prisma.lesson.findMany({
        where: {
          status: "PUBLISHED",
          assignments: {
            some: {
              OR: [{ class: { students: { some: { id: studentProfileId } } } }, { studentId: studentProfileId }],
            },
          },
          title: { contains: q, mode: "insensitive" },
        },
        take: 8,
      }),
      prisma.announcement.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
          OR: [{ classId: null }, { class: { students: { some: { id: studentProfileId } } } }],
        },
        take: 5,
      }),
    ]);

    results.push(
      ...lessons.map((l) => ({
        type: "Lesson",
        id: l.id,
        title: l.title,
        subtitle: l.subject ?? undefined,
        href: `/lessons/${l.id}`,
      })),
      ...announcements.map((a) => ({ type: "Announcement", id: a.id, title: a.title, href: `/announcements` }))
    );
  }

  return NextResponse.json({ results });
}

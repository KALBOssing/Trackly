import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { cn } from "@/lib/utils";

export default async function CalendarPage() {
  const user = await requireUser();
  const now = new Date();

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const lessons =
    user.role === "TEACHER"
      ? await prisma.lesson.findMany({
          where: { teacherId: user.teacherProfileId, dueDate: { gte: gridStart, lte: gridEnd } },
        })
      : await prisma.lesson.findMany({
          where: {
            status: "PUBLISHED",
            assignments: {
              some: {
                OR: [
                  { class: { enrollments: { some: { studentId: user.studentProfileId } } } },
                  { studentId: user.studentProfileId },
                ],
              },
            },
            dueDate: { gte: gridStart, lte: gridEnd },
          },
        });

  const announcements = await prisma.announcement.findMany({
    where: {
      createdAt: { gte: gridStart, lte: gridEnd },
      ...(user.role === "TEACHER"
        ? { teacherId: user.teacherProfileId }
        : { OR: [{ classId: null }, { class: { enrollments: { some: { studentId: user.studentProfileId } } } }] }),
    },
  });

  return (
    <>
      <Topbar title="Calendar" name={user.name ?? ""} />
      <div className="p-6">
        <Card>
          <CardContent className="p-4">
            <p className="mb-4 text-center text-lg font-semibold">{format(now, "MMMM yyyy")}</p>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {days.map((day) => {
                const dayLessons = lessons.filter((l) => l.dueDate && isSameDay(l.dueDate, day));
                const dayAnnouncements = announcements.filter((a) => isSameDay(a.createdAt, day));
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[90px] rounded-md border border-border p-2 text-left",
                      !isSameMonth(day, now) && "opacity-40",
                      isSameDay(day, now) && "border-primary"
                    )}
                  >
                    <p className="text-xs font-medium">{format(day, "d")}</p>
                    <div className="mt-1 space-y-1">
                      {dayLessons.map((l) => (
                        <div key={l.id} className="truncate rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
                          {l.title}
                        </div>
                      ))}
                      {dayAnnouncements.map((a) => (
                        <div key={a.id} className="truncate rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
                          {a.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

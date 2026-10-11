import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CompletionBarChart } from "@/components/charts/completion-bar-chart";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { Users, BookOpenCheck, ClipboardList, Clock, FileEdit, CalendarClock, Megaphone } from "lucide-react";

export default async function TeacherDashboardPage() {
  const user = await requireRole("TEACHER");
  const teacherProfileId = user.teacherProfileId!;

  const [
    totalStudents,
    totalClasses,
    totalLessons,
    publishedLessons,
    scheduledLessons,
    draftLessons,
    totalAnnouncements,
    pendingReviews,
    lateSubmissions,
    pathways,
  ] = await Promise.all([
    prisma.studentProfile.count({ where: { enrollments: { some: { class: { teacherId: teacherProfileId } } } } }),
    prisma.class.count({ where: { teacherId: teacherProfileId } }),
    prisma.lesson.count({ where: { teacherId: teacherProfileId } }),
    prisma.lesson.count({ where: { teacherId: teacherProfileId, status: "PUBLISHED" } }),
    prisma.lesson.count({ where: { teacherId: teacherProfileId, status: "SCHEDULED" } }),
    prisma.lesson.count({ where: { teacherId: teacherProfileId, status: "DRAFT" } }),
    prisma.announcement.count({ where: { teacherId: teacherProfileId } }),
    prisma.submission.count({
      where: { lessonPathway: { lesson: { teacherId: teacherProfileId } }, status: "SUBMITTED" },
    }),
    prisma.submission.count({
      where: { lessonPathway: { lesson: { teacherId: teacherProfileId } }, isLate: true },
    }),
    prisma.pathway.findMany({
      include: {
        progress: {
          where: { student: { enrollments: { some: { class: { teacherId: teacherProfileId } } } } },
        },
      },
    }),
  ]);

  const chartData = pathways.map((pw) => ({
    name: pw.name,
    percentage:
      pw.progress.length > 0
        ? Math.round(pw.progress.reduce((s, p) => s + p.completionPercentage, 0) / pw.progress.length)
        : 0,
  }));

  const stats = [
    { label: "Total Students", value: totalStudents, icon: Users },
    { label: "Total Classes", value: totalClasses, icon: BookOpenCheck },
    { label: "Total Lessons", value: totalLessons, icon: ClipboardList },
    { label: "Published Lessons", value: publishedLessons, icon: BookOpenCheck },
    { label: "Scheduled Lessons", value: scheduledLessons, icon: CalendarClock },
    { label: "Draft Lessons", value: draftLessons, icon: FileEdit },
    { label: "Announcements", value: totalAnnouncements, icon: Megaphone },
    { label: "Pending Grading", value: pendingReviews, icon: Clock },
  ];

  return (
    <>
      <Topbar title="Teacher Dashboard" name={user.name ?? "Teacher"} />
      <div className="space-y-6 p-6">
        <Stagger onMount stagger={0.05} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
            <Card className="card-interactive h-full">
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold">
                    <CountUp value={s.value} />
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            </StaggerItem>
          ))}
        </Stagger>

        <Stagger onMount delay={0.3} className="grid gap-6 lg:grid-cols-3">
          <StaggerItem className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Pathway Completion</CardTitle>
              <CardDescription>Average completion across your students, by pathway</CardDescription>
            </CardHeader>
            <CardContent>
              <CompletionBarChart data={chartData} />
            </CardContent>
          </Card>
          </StaggerItem>

          <StaggerItem>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Late Submissions</CardTitle>
              <CardDescription>Across all your lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl font-bold text-destructive">
                <CountUp value={lateSubmissions} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Review the Lessons page to follow up with students.
              </p>
            </CardContent>
          </Card>
          </StaggerItem>
        </Stagger>
      </div>
    </>
  );
}

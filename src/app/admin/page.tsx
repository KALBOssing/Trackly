import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Topbar } from "@/components/layout/topbar";
import { requireAdmin } from "@/lib/session";
import { Users, GraduationCap, BookOpenCheck, ClipboardList, Megaphone, ShieldAlert } from "lucide-react";

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();

  const [totalTeachers, totalStudents, totalClasses, totalLessons, totalAnnouncements, suspendedCount] =
    await Promise.all([
      prisma.teacherProfile.count(),
      prisma.studentProfile.count(),
      prisma.class.count(),
      prisma.lesson.count(),
      prisma.announcement.count(),
      prisma.user.count({ where: { suspended: true } }),
    ]);

  const stats = [
    { label: "Teachers", value: totalTeachers, icon: GraduationCap },
    { label: "Students", value: totalStudents, icon: Users },
    { label: "Classes", value: totalClasses, icon: BookOpenCheck },
    { label: "Lessons", value: totalLessons, icon: ClipboardList },
    { label: "Announcements", value: totalAnnouncements, icon: Megaphone },
    { label: "Suspended Accounts", value: suspendedCount, icon: ShieldAlert },
  ];

  return (
    <>
      <Topbar title="Admin Overview" name={admin.name ?? ""} />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10">
                <s.icon className="h-5 w-5 text-destructive" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

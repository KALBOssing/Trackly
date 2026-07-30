import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { pathwayRequirementStatus } from "@/lib/pathway-status";
import { formatDate } from "@/lib/utils";
import { CalendarClock, Megaphone } from "lucide-react";

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT");
  const studentProfileId = user.studentProfileId!;

  const [pathways, progress, upcomingLessons, announcements] = await Promise.all([
    prisma.pathway.findMany({ orderBy: { order: "asc" } }),
    prisma.progress.findMany({ where: { studentId: studentProfileId } }),
    prisma.lesson.findMany({
      where: {
        status: "PUBLISHED",
        assignments: {
          some: {
            OR: [
              { class: { students: { some: { id: studentProfileId } } } },
              { studentId: studentProfileId },
            ],
          },
        },
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: {
        pathways: true,
        _count: { select: { pathways: true } },
      },
    }),
    prisma.announcement.findMany({
      where: {
        status: "PUBLISHED",
        AND: [
          { OR: [{ classId: null }, { class: { students: { some: { id: studentProfileId } } } }] },
          { OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
        ],
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
  ]);

  // Completion % per upcoming lesson, based on how many of its pathways this student has a graded/reviewed submission for.
  const lessonPathwayIds = upcomingLessons.flatMap((l) => l.pathways.map((p) => p.id));
  const doneSubmissions = lessonPathwayIds.length
    ? await prisma.submission.findMany({
        where: { studentId: studentProfileId, lessonPathwayId: { in: lessonPathwayIds }, status: { in: ["GRADED", "REVIEWED"] } },
        select: { lessonPathwayId: true },
      })
    : [];
  const doneSet = new Set(doneSubmissions.map((s) => s.lessonPathwayId));

  const progressByPathway = new Map(progress.map((p) => [p.pathwayId, p]));
  const pathwaysCompleted = progress.filter((p) => p.completionPercentage >= 100).length;
  const status = pathwayRequirementStatus(pathwaysCompleted);
  const overallPercentage =
    pathways.length > 0
      ? Math.round(
          pathways.reduce((sum, pw) => sum + (progressByPathway.get(pw.id)?.completionPercentage ?? 0), 0) /
            pathways.length
        )
      : 0;

  return (
    <>
      <Topbar title="Student Dashboard" name={user.name ?? "Student"} />
      <div className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>{status.label}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div
                className="relative flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${overallPercentage * 3.6}deg, hsl(var(--secondary)) 0deg)`,
                }}
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-card text-2xl font-bold">
                  {overallPercentage}%
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {pathwaysCompleted} of {pathways.length} pathways completed
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>GLOW Pathways</CardTitle>
              <CardDescription>Your progress across each pathway</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {pathways.map((pw) => {
                const pct = Math.round(progressByPathway.get(pw.id)?.completionPercentage ?? 0);
                return (
                  <div key={pw.id} className="rounded-md border border-border p-4">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{pw.name}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: pw.color }}
                      />
                    </div>
                  </div>
                );
              })}
              {pathways.length === 0 && (
                <p className="text-sm text-muted-foreground">No pathways configured yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4" /> Assigned Lessons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingLessons.map((l) => {
                const total = l.pathways.length;
                const completed = l.pathways.filter((p) => doneSet.has(p.id)).length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <Link
                    key={l.id}
                    href={`/lessons/${l.id}`}
                    className="block rounded-md border border-border p-3 text-sm hover:bg-secondary/50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{l.title}</p>
                      {l.dueDate && <span className="text-xs text-muted-foreground">Due {formatDate(l.dueDate)}</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {total} pathway{total === 1 ? "" : "s"} · {pct}% complete
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                );
              })}
              {upcomingLessons.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing due soon — you're all caught up.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4" /> Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{a.title}</p>
                    {a.priority !== "NORMAL" && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          a.priority === "URGENT" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"
                        }`}
                      >
                        {a.priority}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-sm text-muted-foreground">No announcements yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

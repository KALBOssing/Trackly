import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CompletionBarChart } from "@/components/charts/completion-bar-chart";
import { ExportButtons } from "@/features/analytics/export-buttons";
import { AnalyticsTable } from "@/features/analytics/analytics-table";

export default async function AnalyticsPage() {
  const user = await requireRole("TEACHER");
  const teacherProfileId = user.teacherProfileId!;

  const [pathways, students, submissions] = await Promise.all([
    prisma.pathway.findMany({
      include: { progress: { where: { student: { class: { teacherId: teacherProfileId } } } } },
      orderBy: { order: "asc" },
    }),
    prisma.studentProfile.findMany({
      where: { class: { teacherId: teacherProfileId } },
      include: {
        user: true,
        class: true,
        progress: true,
        submissions: { include: { grade: true } },
      },
    }),
    prisma.submission.findMany({
      where: { lessonPathway: { lesson: { teacherId: teacherProfileId } } },
      select: { isLate: true, status: true },
    }),
  ]);

  const chartData = pathways.map((pw) => ({
    name: pw.name,
    percentage:
      pw.progress.length > 0
        ? Math.round(pw.progress.reduce((s, p) => s + p.completionPercentage, 0) / pw.progress.length)
        : 0,
  }));

  const lateCount = submissions.filter((s) => s.isLate).length;
  const overallAvgCompletion =
    chartData.length > 0
      ? Math.round(chartData.reduce((s, p) => s + p.percentage, 0) / chartData.length)
      : 0;

  const studentRows = students.map((s) => {
    const grades = s.submissions.map((sub) => sub.grade?.score).filter((v): v is number => v != null);
    const avgScore = grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : 0;
    const avgCompletion =
      s.progress.length > 0
        ? Math.round(s.progress.reduce((sum, p) => sum + p.completionPercentage, 0) / s.progress.length)
        : 0;
    return {
      "Student ID": s.studentId,
      Name: `${s.user.firstName} ${s.user.lastName}`,
      Class: s.class?.name ?? "—",
      "Avg Completion %": avgCompletion,
      "Avg Score": avgScore,
    };
  });

  const topStudents = [...studentRows].sort((a, b) => b["Avg Score"] - a["Avg Score"]).slice(0, 5);
  const behindStudents = [...studentRows]
    .sort((a, b) => a["Avg Completion %"] - b["Avg Completion %"])
    .slice(0, 5);

  return (
    <>
      <Topbar title="Analytics" name={user.name ?? ""} />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Overall Completion</p>
              <p className="mt-1 text-2xl font-bold">{overallAvgCompletion}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="mt-1 text-2xl font-bold">{students.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Late Submissions</p>
              <p className="mt-1 text-2xl font-bold text-destructive">{lateCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pathway Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <CompletionBarChart data={chartData} />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Students</CardTitle>
              <CardDescription>By average score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topStudents.map((s) => (
                <div key={s["Student ID"]} className="flex items-center justify-between text-sm">
                  <span>{s.Name}</span>
                  <span className="text-muted-foreground">{s["Avg Score"]}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Students Behind Schedule</CardTitle>
              <CardDescription>By pathway completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {behindStudents.map((s) => (
                <div key={s["Student ID"]} className="flex items-center justify-between text-sm">
                  <span>{s.Name}</span>
                  <span className="text-muted-foreground">{s["Avg Completion %"]}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Full Report</CardTitle>
              <CardDescription>Every student across your classes</CardDescription>
            </div>
            <ExportButtons rows={studentRows} filename="trackly-analytics" title="Trackly Analytics Report" />
          </CardHeader>
          <CardContent>
            <AnalyticsTable rows={studentRows} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

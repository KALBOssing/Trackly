import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Pagination } from "@/components/layout/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-accent text-accent-foreground",
  CLOSED: "bg-secondary text-muted-foreground",
  ARCHIVED: "bg-destructive/10 text-destructive",
};

const TEACHER_FILTERS = ["ALL", "DRAFT", "SCHEDULED", "PUBLISHED", "CLOSED", "ARCHIVED"] as const;
const STUDENT_FILTERS = ["ALL", "PUBLISHED", "CLOSED"] as const;

const PAGE_SIZE = 15;

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const user = await requireUser();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const statusFilter = (searchParams.status ?? "ALL").toUpperCase();

  const where =
    user.role === "TEACHER"
      ? {
          teacherId: user.teacherProfileId,
          ...(statusFilter !== "ALL" && { status: statusFilter as any }),
        }
      : {
          status: (statusFilter !== "ALL" ? statusFilter : "PUBLISHED") as any,
          assignments: {
            some: {
              OR: [
                { class: { enrollments: { some: { studentId: user.studentProfileId } } } },
                { studentId: user.studentProfileId },
              ],
            },
          },
        };

  const [lessons, total] =
    user.role === "TEACHER"
      ? await Promise.all([
          prisma.lesson.findMany({
            where,
            include: { pathways: { include: { pathway: true } } },
            orderBy: { updatedAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
          }),
          prisma.lesson.count({ where }),
        ])
      : await Promise.all([
          prisma.lesson.findMany({
            where,
            include: { pathways: { include: { pathway: true } } },
            orderBy: { dueDate: "asc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
          }),
          prisma.lesson.count({ where }),
        ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filters = user.role === "TEACHER" ? TEACHER_FILTERS : STUDENT_FILTERS;

  return (
    <>
      <Topbar title="Lessons" name={user.name ?? ""} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <Link
                key={f}
                href={f === "ALL" ? "/lessons" : `/lessons?status=${f}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  statusFilter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
                )}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>
          {user.role === "TEACHER" && (
            <Button asChild>
              <Link href="/lessons/new">
                <Plus className="h-4 w-4" /> New Lesson
              </Link>
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {lessons.map((l) => (
            <Link key={l.id} href={`/lessons/${l.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.pathways.length} pathway{l.pathways.length === 1 ? "" : "s"}
                      {l.dueDate && ` · Due ${formatDate(l.dueDate)}`}
                      {l.subject && ` · ${l.subject}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[l.status]}`}>
                      {l.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {lessons.length === 0 && <p className="text-sm text-muted-foreground">No lessons to show yet.</p>}
        </div>

        <Pagination page={page} totalPages={totalPages} basePath="/lessons" />
      </div>
    </>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminClassesPage() {
  const admin = await requireAdmin();

  const classes = await prisma.class.findMany({
    include: {
      teacher: { include: { user: true } },
      _count: { select: { enrollments: true, lessonAssignments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <Topbar title="Classes" name={admin.name ?? ""} />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {classes.map((c) => (
                <Link
                  key={c.id}
                  href={`/classes/${c.id}`}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">
                      {c.name}
                      {c.status === "ARCHIVED" && (
                        <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          Archived
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.gradeLevel} · {c.section} · Taught by {c.teacher.user.firstName} {c.teacher.user.lastName} ·{" "}
                      {c._count.enrollments} students · {c._count.lessonAssignments} lessons
                    </p>
                  </div>
                </Link>
              ))}
              {classes.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No classes created yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

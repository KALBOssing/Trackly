import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string };
}) {
  const admin = await requireAdmin();
  const q = (searchParams.q ?? "").trim();
  const role = searchParams.role;

  const users = await prisma.user.findMany({
    where: {
      ...(role === "STUDENT" || role === "TEACHER" ? { role } : {}),
      ...(q && {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { studentProfile: { studentId: { contains: q, mode: "insensitive" } } },
        ],
      }),
    },
    include: { studentProfile: true, teacherProfile: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <Topbar title="Users" name={admin.name ?? ""} />
      <div className="space-y-4 p-6">
        <form className="flex flex-wrap gap-2" method="GET">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="Search name, email, student ID…" className="pl-9" />
          </div>
          <select
            name="role"
            defaultValue={role ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All roles</option>
            <option value="TEACHER">Teachers</option>
            <option value="STUDENT">Students</option>
          </select>
          <button type="submit" className="rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Search
          </button>
        </form>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {users.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">
                      {u.firstName} {u.lastName}
                      {u.suspended && (
                        <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Suspended
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {u.email} · {u.role}
                      {u.studentProfile && ` · ID ${u.studentProfile.studentId}`}
                    </p>
                  </div>
                </Link>
              ))}
              {users.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No users match your search.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">Showing up to 100 results. Narrow your search for more precise results.</p>
      </div>
    </>
  );
}

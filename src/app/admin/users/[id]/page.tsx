import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUserActions } from "@/features/admin/admin-user-actions";
import { formatDateTime } from "@/lib/utils";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      studentProfile: { include: { enrollments: { include: { class: true } } } },
      teacherProfile: { include: { classes: true } },
    },
  });
  if (!user) notFound();

  const fullName = `${user.firstName} ${user.lastName}`;
  const protectedAccount = isAdminEmail(user.email);

  return (
    <>
      <Topbar title={fullName} name={admin.name ?? ""} />
      <Breadcrumbs items={[{ label: "Users", href: "/admin/users" }, { label: fullName }]} />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span> {user.role}
            </p>
            <p>
              <span className="text-muted-foreground">Joined:</span> {formatDateTime(user.createdAt)}
            </p>
            {user.studentProfile && (
              <p>
                <span className="text-muted-foreground">Student ID:</span> {user.studentProfile.studentId}
              </p>
            )}
            {user.studentProfile && user.studentProfile.enrollments.length > 0 && (
              <p>
                <span className="text-muted-foreground">Classes:</span>{" "}
                {user.studentProfile.enrollments.map((e) => e.class.name).join(", ")}
              </p>
            )}
            {user.teacherProfile && user.teacherProfile.classes.length > 0 && (
              <p>
                <span className="text-muted-foreground">Teaches:</span>{" "}
                {user.teacherProfile.classes.map((c) => c.name).join(", ")}
              </p>
            )}
          </CardContent>
        </Card>

        {protectedAccount ? (
          <p className="text-sm text-muted-foreground">
            This is a designated admin account. It can&apos;t be suspended or deleted from here.
          </p>
        ) : (
          <AdminUserActions userId={user.id} userName={fullName} suspended={user.suspended} />
        )}
      </div>
    </>
  );
}

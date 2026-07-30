import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { ScrollText } from "lucide-react";

const actionLabels: Record<string, string> = {
  USER_REGISTERED: "Registered an account",
  CLASS_CREATED: "Created a class",
  LESSON_CREATED: "Created a lesson",
  LESSON_EDITED: "Edited a lesson",
  LESSON_DELETED: "Deleted a lesson",
  BULK_STUDENT_IMPORT: "Bulk-imported students",
  PASSWORD_RESET: "Reset password",
};

export default async function AuditLogPage() {
  const user = await requireRole("TEACHER");

  const logs = await prisma.activityLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <Topbar title="Audit Log" name={user.name ?? ""} />
      <div className="space-y-3 p-6">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="flex items-start gap-3 py-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                <ScrollText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{actionLabels[log.action] ?? log.action}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(log.createdAt)}
                  {log.ipAddress ? ` · ${log.ipAddress}` : ""}
                </p>
                {log.metadata != null && (
                  <p className="mt-1 text-xs text-muted-foreground">{JSON.stringify(log.metadata)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {logs.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
      </div>
    </>
  );
}

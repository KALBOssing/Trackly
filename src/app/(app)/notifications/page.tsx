import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { MarkNotificationReadButton } from "@/features/notifications/mark-read-button";
import { formatDateTime } from "@/lib/utils";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <Topbar title="Notifications" name={user.name ?? ""} />
      <div className="space-y-3 p-6">
        {notifications.map((n) => (
          <Card key={n.id} className={n.read ? "opacity-70" : ""}>
            <CardContent className="flex items-start justify-between gap-4 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
              {!n.read && <MarkNotificationReadButton notificationId={n.id} />}
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <p className="text-sm text-muted-foreground">You're all caught up — no notifications yet.</p>
        )}
      </div>
    </>
  );
}

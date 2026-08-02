import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateAnnouncementDialog } from "@/features/announcements/create-announcement-dialog";
import { MarkAnnouncementReadButton } from "@/features/announcements/mark-read-button";
import { AnnouncementActions } from "@/features/announcements/announcement-actions";
import { formatDateTime, cn } from "@/lib/utils";
import { Pin, Paperclip } from "lucide-react";
import Link from "next/link";

const priorityStyles: Record<string, string> = {
  NORMAL: "",
  IMPORTANT: "bg-accent text-accent-foreground",
  URGENT: "bg-destructive/10 text-destructive",
};

const TEACHER_FILTERS = ["ALL", "DRAFT", "SCHEDULED", "PUBLISHED", "EXPIRED"] as const;
const STUDENT_FILTERS = ["ALL", "PINNED", "UNREAD", "IMPORTANT"] as const;

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const user = await requireUser();
  const filter = (searchParams.filter ?? "ALL").toUpperCase();

  const [announcements, classes] = await Promise.all([
    user.role === "TEACHER"
      ? prisma.announcement.findMany({
          where: {
            teacherId: user.teacherProfileId,
            ...(["DRAFT", "SCHEDULED", "PUBLISHED", "EXPIRED"].includes(filter) && { status: filter as any }),
          },
          include: { class: true, images: { orderBy: { order: "asc" } }, attachments: true },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        })
      : prisma.announcement.findMany({
          where: {
            status: "PUBLISHED",
            AND: [
              {
                OR: [
                  { classId: null },
                  { class: { enrollments: { some: { studentId: user.studentProfileId } } } },
                  { studentId: user.studentProfileId },
                ],
              },
              { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
              ...(filter === "PINNED" ? [{ pinned: true }] : []),
              ...(filter === "IMPORTANT" ? [{ priority: { in: ["IMPORTANT", "URGENT"] } as any } as any] : []),
            ],
          },
          include: {
            reads: { where: { userId: user.id } },
            images: { orderBy: { order: "asc" } },
            attachments: true,
          },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        }),
    user.role === "TEACHER"
      ? prisma.class.findMany({ where: { teacherId: user.teacherProfileId }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ]);

  const visibleAnnouncements =
    user.role === "STUDENT" && filter === "UNREAD"
      ? announcements.filter((a) => "reads" in a && a.reads.length === 0)
      : announcements;

  const filters = user.role === "TEACHER" ? TEACHER_FILTERS : STUDENT_FILTERS;

  return (
    <>
      <Topbar title="Announcements" name={user.name ?? ""} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <Link
                key={f}
                href={f === "ALL" ? "/announcements" : `/announcements?filter=${f}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
                )}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>
          {user.role === "TEACHER" && <CreateAnnouncementDialog classes={classes} />}
        </div>

        <div className="space-y-3">
          {visibleAnnouncements.map((a) => {
            const isRead = user.role === "STUDENT" && "reads" in a && a.reads.length > 0;
            return (
              <Card key={a.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {a.pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                      {a.title}
                      {a.priority !== "NORMAL" && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[a.priority]}`}>
                          {a.priority}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{formatDateTime(a.createdAt)}</CardDescription>
                  </div>
                  {user.role === "STUDENT" && !isRead && (
                    <MarkAnnouncementReadButton announcementId={a.id} />
                  )}
                  {user.role === "TEACHER" && (
                    <AnnouncementActions
                      announcementId={a.id}
                      title={a.title}
                      body={a.body}
                      pinned={a.pinned}
                      priority={a.priority}
                      images={a.images}
                      attachments={a.attachments}
                    />
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{a.body}</p>
                  {a.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {a.images.map((img) => (
                        <a key={img.id} href={img.imageUrl} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-md border border-border">
                          <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  {a.attachments.length > 0 && (
                    <div className="space-y-1">
                      {a.attachments.map((f) => (
                        <a
                          key={f.id}
                          href={f.fileUrl}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Paperclip className="h-3.5 w-3.5" /> {f.fileName}
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {visibleAnnouncements.length === 0 && (
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubmitPathwayButton } from "@/features/lessons/submit-pathway-button";
import { GradeSubmissionDialog } from "@/features/lessons/grade-submission-dialog";
import { LessonResourcesUploader } from "@/features/lessons/resources-uploader";
import { SubmissionFileUploader } from "@/features/lessons/submission-file-uploader";
import { SubmissionComments } from "@/features/lessons/submission-comments";
import { DeletableFileRow } from "@/features/uploads/deletable-file-row";
import { LessonActionsMenu } from "@/features/lessons/lesson-actions-menu";
import { AddPathwayDialog } from "@/features/lessons/add-pathway-dialog";
import { formatDate, formatDateTime, initials } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  SUBMITTED: "bg-accent text-accent-foreground",
  LATE: "bg-destructive/10 text-destructive",
  REVIEWED: "bg-accent text-accent-foreground",
  GRADED: "bg-green-100 text-green-700",
  RETURNED: "bg-secondary text-muted-foreground",
};

const lessonStatusStyles: Record<string, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-accent text-accent-foreground",
  CLOSED: "bg-secondary text-muted-foreground",
  ARCHIVED: "bg-destructive/10 text-destructive",
};

export default async function LessonDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      resources: { orderBy: { order: "asc" } },
      pathways: { include: { pathway: true }, orderBy: { order: "asc" } },
    },
  });
  if (!lesson) notFound();
  if (user.role === "STUDENT" && lesson.status !== "PUBLISHED") notFound();

  if (user.role === "TEACHER") {
    if (lesson.teacherId !== user.teacherProfileId) notFound();

    const [submissions, pathwayCatalog] = await Promise.all([
      prisma.submission.findMany({
        where: { lessonPathway: { lessonId: lesson.id } },
        include: {
          student: { include: { user: true } },
          grade: true,
          comments: true,
          lessonPathway: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.pathway.findMany({ orderBy: { order: "asc" } }),
    ]);

    return (
      <>
        <Topbar title={lesson.title} name={user.name ?? ""} />
        <Breadcrumbs items={[{ label: "Lessons", href: "/lessons" }, { label: lesson.title }]} />
        <div className="flex justify-end px-6 pt-6">
          <LessonActionsMenu lessonId={lesson.id} title={lesson.title} status={lesson.status} />
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>{lesson.subject ?? "No subject set"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className={`rounded-full px-2 py-0.5 text-xs ${lessonStatusStyles[lesson.status]}`}>
                  {lesson.status}
                </span>
              </p>
              {lesson.dueDate && (
                <p>
                  <span className="text-muted-foreground">Due:</span> {formatDateTime(lesson.dueDate)}
                </p>
              )}
              {lesson.availableAt && (
                <p>
                  <span className="text-muted-foreground">Available from:</span> {formatDateTime(lesson.availableAt)}
                </p>
              )}
              <p className="pt-2 text-muted-foreground">{lesson.description}</p>
              {lesson.objectives && (
                <div className="pt-2">
                  <p className="font-medium">Learning Objectives</p>
                  <p className="text-muted-foreground">{lesson.objectives}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Files students can view before starting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lesson.resources.map((r) => (
                <DeletableFileRow
                  key={r.id}
                  fileName={r.fileName}
                  fileSizeBytes={r.fileSizeBytes}
                  deleteUrl={`/api/resources/${r.id}`}
                />
              ))}
              <LessonResourcesUploader lessonId={lesson.id} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Pathways ({lesson.pathways.length})</CardTitle>
              <AddPathwayDialog lessonId={lesson.id} pathwayCatalog={pathwayCatalog} />
            </CardHeader>
            <CardContent className="space-y-2">
              {lesson.pathways.map((p) => (
                <div key={p.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.pathway.name} · {p.points} pts · {p.required ? "Required" : "Optional"}
                    {p.allowResubmission && " · Resubmission allowed"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Submissions ({submissions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {submissions.map((s) => (
                <details key={s.id} className="rounded-md border border-border p-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                        {initials(s.student.user.firstName, s.student.user.lastName)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {s.student.user.firstName} {s.student.user.lastName} · {s.lessonPathway.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.submittedAt ? formatDateTime(s.submittedAt) : "Not submitted"}
                          {s.grade && ` · Score: ${s.grade.score}/${s.lessonPathway.points}`}
                          {s.comments.length > 0 && ` · ${s.comments.length} comment${s.comments.length > 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[s.status]}`}>
                        {s.status}
                      </span>
                      <GradeSubmissionDialog
                        submissionId={s.id}
                        studentName={s.student.user.firstName}
                        maxScore={s.lessonPathway.points}
                        existingScore={s.grade?.score}
                        existingFeedback={s.grade?.feedback}
                        existingFeedbackFileUrl={s.grade?.feedbackFileUrl}
                      />
                    </div>
                  </summary>
                  <div className="mt-3 border-t border-border pt-3">
                    <SubmissionComments submissionId={s.id} comments={s.comments} />
                  </div>
                </details>
              ))}
              {submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Student view
  const submissions = await prisma.submission.findMany({
    where: { lessonPathway: { lessonId: lesson.id }, studentId: user.studentProfileId! },
    include: { grade: true, files: true, comments: true },
  });
  const submissionByPathway = new Map(submissions.map((s) => [s.lessonPathwayId, s]));

  return (
    <>
      <Topbar title={lesson.title} name={user.name ?? ""} />
      <Breadcrumbs items={[{ label: "Lessons", href: "/lessons" }, { label: lesson.title }]} />
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>{lesson.title}</CardTitle>
            <CardDescription>
              {lesson.subject ? `${lesson.subject} · ` : ""}
              {lesson.dueDate ? `Due ${formatDate(lesson.dueDate)}` : "No due date"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{lesson.description}</p>
            {lesson.objectives && (
              <div>
                <p className="text-sm font-medium">Learning Objectives</p>
                <p className="text-sm text-muted-foreground">{lesson.objectives}</p>
              </div>
            )}
            {lesson.resources.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Resources</p>
                {lesson.resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.fileUrl}
                    className="block rounded-md border border-border p-2 text-sm text-primary hover:underline"
                  >
                    {r.fileName}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {lesson.pathways.map((p) => {
          const submission = submissionByPathway.get(p.id);
          return (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>
                  {p.pathway.name} · {p.points} pts · {p.required ? "Required" : "Optional"}
                  {p.dueDateOverride && ` · Due ${formatDate(p.dueDateOverride)}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: p.instructions }} />
                {p.requirements && <p className="text-sm text-muted-foreground">{p.requirements}</p>}

                {submission?.grade ? (
                  <div className="rounded-md border border-border p-4">
                    <p className="text-lg font-semibold">
                      {submission.grade.score} / {p.points}
                    </p>
                    {submission.grade.feedback && (
                      <p className="mt-2 text-sm text-muted-foreground">{submission.grade.feedback}</p>
                    )}
                    {submission.grade.feedbackFileUrl && (
                      <a
                        href={submission.grade.feedbackFileUrl}
                        className="mt-2 inline-block text-sm text-primary hover:underline"
                      >
                        Download feedback file
                      </a>
                    )}
                    {p.allowResubmission && (
                      <div className="mt-3">
                        <SubmitPathwayButton lessonPathwayId={p.id} currentStatus={submission.status} />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {submission?.files && submission.files.length > 0 && (
                      <div className="space-y-1">
                        {submission.files.map((f) => (
                          <DeletableFileRow
                            key={f.id}
                            fileName={f.fileName}
                            fileSizeBytes={f.fileSizeBytes}
                            deleteUrl={`/api/submission-files/${f.id}`}
                            canDelete={submission.status !== "GRADED"}
                          />
                        ))}
                      </div>
                    )}
                    <SubmissionFileUploader lessonPathwayId={p.id} />
                    <SubmitPathwayButton lessonPathwayId={p.id} currentStatus={submission?.status ?? null} />
                  </>
                )}
                {submission && (
                  <div className="border-t border-border pt-4">
                    <SubmissionComments submissionId={submission.id} comments={submission.comments} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

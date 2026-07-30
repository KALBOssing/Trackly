import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lessonUpdateSchema } from "@/lib/validations/academic";
import { z } from "zod";

async function getOwnedLesson(id: string, teacherProfileId: string) {
  return prisma.lesson.findFirst({ where: { id, teacherId: teacherProfileId } });
}

// Edit a lesson's own fields (schedule, metadata, status). Class/student
// targeting and the pathway list are managed by their own endpoints.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOwnedLesson(params.id, session.user.teacherProfileId!);
  if (!existing) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const parsed = lessonUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = { ...parsed.data } as Record<string, unknown>;
  if (data.status === "PUBLISHED" && !existing.publishedAt) {
    data.publishedAt = new Date();
  }
  if (data.status === "PUBLISHED" && data.publishAt) {
    // A publishAt in the future overrides an explicit PUBLISHED status —
    // the scheduler is what should flip it live.
    data.status = "SCHEDULED";
  }

  const updated = await prisma.lesson.update({
    where: { id: existing.id },
    data,
  });

  await prisma.activityLog.create({
    data: { userId: session.user.id, action: "LESSON_EDITED", metadata: { lessonId: updated.id } },
  });

  return NextResponse.json({ lesson: updated });
}

// Delete a lesson entirely (and its resources/pathways/submissions/materials via cascade).
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOwnedLesson(params.id, session.user.teacherProfileId!);
  if (!existing) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  await prisma.lesson.delete({ where: { id: existing.id } });

  await prisma.activityLog.create({
    data: { userId: session.user.id, action: "LESSON_DELETED", metadata: { lessonId: existing.id, title: existing.title } },
  });

  return NextResponse.json({ success: true });
}

const actionSchema = z.object({ action: z.enum(["duplicate", "archive", "unarchive"]) });

// Duplicate or archive/unarchive a lesson.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOwnedLesson(params.id, session.user.teacherProfileId!);
  if (!existing) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  if (parsed.data.action === "duplicate") {
    const [pathways, resources] = await Promise.all([
      prisma.lessonPathway.findMany({ where: { lessonId: existing.id } }),
      prisma.lessonResource.findMany({ where: { lessonId: existing.id } }),
    ]);

    const copy = await prisma.lesson.create({
      data: {
        title: `${existing.title} (Copy)`,
        description: existing.description,
        objectives: existing.objectives,
        subject: existing.subject,
        teacherId: existing.teacherId,
        dueDate: existing.dueDate,
        availableAt: existing.availableAt,
        timezone: existing.timezone,
        status: "DRAFT",
        duplicatedFromId: existing.id,
        pathways: {
          create: pathways.map((p) => ({
            pathwayId: p.pathwayId,
            title: p.title,
            instructions: p.instructions,
            requirements: p.requirements,
            rubric: p.rubric,
            points: p.points,
            allowResubmission: p.allowResubmission,
            required: p.required,
            order: p.order,
          })),
        },
        resources: {
          create: resources.map((r) => ({
            fileName: r.fileName,
            fileUrl: r.fileUrl,
            fileType: r.fileType,
            fileSizeBytes: r.fileSizeBytes,
            description: r.description,
            order: r.order,
          })),
        },
      },
    });
    return NextResponse.json({ lesson: copy }, { status: 201 });
  }

  const updated = await prisma.lesson.update({
    where: { id: existing.id },
    data: { status: parsed.data.action === "archive" ? "ARCHIVED" : "DRAFT" },
  });
  return NextResponse.json({ lesson: updated });
}

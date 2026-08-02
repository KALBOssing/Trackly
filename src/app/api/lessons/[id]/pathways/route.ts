import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lessonPathwayConfigSchema } from "@/lib/validations/academic";

// Add one more GLOW Pathway to a lesson that already exists (the "add
// pathway" affordance on the Lesson Details page — separate from the
// create-lesson form, which builds the initial set).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findFirst({
    where: { id: params.id, teacherId: session.user.teacherProfileId },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const parsed = lessonPathwayConfigSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const pathway = await prisma.pathway.findUnique({ where: { id: parsed.data.pathwayId } });
  if (!pathway) return NextResponse.json({ error: "Pathway not found" }, { status: 404 });

  const count = await prisma.lessonPathway.count({ where: { lessonId: lesson.id } });

  const lessonPathway = await prisma.lessonPathway.create({
    data: {
      lessonId: lesson.id,
      pathwayId: parsed.data.pathwayId,
      title: parsed.data.title || pathway.name,
      instructions: parsed.data.instructions,
      requirements: parsed.data.requirements || null,
      rubric: parsed.data.rubric || null,
      points: parsed.data.points,
      dueDateOverride: parsed.data.dueDateOverride,
      allowResubmission: parsed.data.allowResubmission,
      required: parsed.data.required,
      order: count,
      resources: {
        create: parsed.data.resources.map((r, rOrder) => ({
          fileName: r.fileName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          fileSizeBytes: r.fileSizeBytes,
          order: rOrder,
        })),
      },
    },
  });

  return NextResponse.json({ lessonPathway }, { status: 201 });
}

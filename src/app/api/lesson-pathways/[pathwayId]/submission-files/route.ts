import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
  fileSizeBytes: z.number().int().positive(),
});

export async function POST(req: Request, { params }: { params: { pathwayId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonPathway = await prisma.lessonPathway.findUnique({
    where: { id: params.pathwayId },
    include: { lesson: true },
  });
  if (!lessonPathway || lessonPathway.lesson.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Pathway not found" }, { status: 404 });
  }

  const enrolled = await prisma.lessonAssignment.findFirst({
    where: {
      lessonId: lessonPathway.lessonId,
      OR: [
        { class: { students: { some: { id: session.user.studentProfileId } } } },
        { studentId: session.user.studentProfileId },
      ],
    },
  });
  if (!enrolled) return NextResponse.json({ error: "Not assigned this lesson" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const submission = await prisma.submission.upsert({
    where: {
      lessonPathwayId_studentId: { lessonPathwayId: lessonPathway.id, studentId: session.user.studentProfileId! },
    },
    create: { lessonPathwayId: lessonPathway.id, studentId: session.user.studentProfileId!, status: "DRAFT" },
    update: {},
  });

  const file = await prisma.submissionFile.create({
    data: { submissionId: submission.id, ...parsed.data },
  });

  return NextResponse.json({ file, submissionId: submission.id }, { status: 201 });
}

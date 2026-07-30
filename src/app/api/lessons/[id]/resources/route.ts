import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lessonResourceSchema } from "@/lib/validations/academic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findFirst({
    where: { id: params.id, teacherId: session.user.teacherProfileId },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const parsed = lessonResourceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const count = await prisma.lessonResource.count({ where: { lessonId: lesson.id } });

  const resource = await prisma.lessonResource.create({
    data: {
      lessonId: lesson.id,
      fileName: parsed.data.fileName,
      fileUrl: parsed.data.fileUrl,
      fileType: parsed.data.fileType,
      fileSizeBytes: parsed.data.fileSizeBytes,
      description: parsed.data.description || null,
      order: count,
    },
  });

  return NextResponse.json({ resource }, { status: 201 });
}

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
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonPathway = await prisma.lessonPathway.findUnique({
    where: { id: params.pathwayId },
    include: { lesson: true },
  });
  if (!lessonPathway || lessonPathway.lesson.teacherId !== session.user.teacherProfileId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const count = await prisma.pathwayResource.count({ where: { lessonPathwayId: lessonPathway.id } });

  const resource = await prisma.pathwayResource.create({
    data: { lessonPathwayId: lessonPathway.id, ...parsed.data, order: count },
  });

  return NextResponse.json({ resource }, { status: 201 });
}

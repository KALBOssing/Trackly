import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";

export async function DELETE(_req: Request, { params }: { params: { resourceId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resource = await prisma.lessonResource.findUnique({
    where: { id: params.resourceId },
    include: { lesson: true },
  });
  if (!resource || resource.lesson.teacherId !== session.user.teacherProfileId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.lessonResource.delete({ where: { id: resource.id } });

  // Best-effort storage cleanup — the DB row is the source of truth either way.
  try {
    const path = new URL(resource.fileUrl).pathname.split("/trackly-uploads/")[1];
    if (path) await deleteFile(path);
  } catch {
    // Ignore storage cleanup failures; nothing user-facing depends on it.
  }

  return NextResponse.json({ success: true });
}

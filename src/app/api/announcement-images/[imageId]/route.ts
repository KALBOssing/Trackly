import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { imageId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const image = await prisma.announcementImage.findUnique({
    where: { id: params.imageId },
    include: { announcement: true },
  });
  if (!image || image.announcement.teacherId !== session.user.teacherProfileId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.announcementImage.delete({ where: { id: image.id } });
  return NextResponse.json({ success: true });
}

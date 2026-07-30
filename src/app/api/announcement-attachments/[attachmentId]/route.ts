import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { attachmentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attachment = await prisma.announcementAttachment.findUnique({
    where: { id: params.attachmentId },
    include: { announcement: true },
  });
  if (!attachment || attachment.announcement.teacherId !== session.user.teacherProfileId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.announcementAttachment.delete({ where: { id: attachment.id } });
  return NextResponse.json({ success: true });
}

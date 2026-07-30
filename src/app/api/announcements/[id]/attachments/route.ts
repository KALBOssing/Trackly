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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const announcement = await prisma.announcement.findFirst({
    where: { id: params.id, teacherId: session.user.teacherProfileId },
  });
  if (!announcement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const attachment = await prisma.announcementAttachment.create({
    data: { announcementId: announcement.id, ...parsed.data },
  });

  return NextResponse.json({ attachment }, { status: 201 });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ imageUrl: z.string().url() });

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

  const count = await prisma.announcementImage.count({ where: { announcementId: announcement.id } });
  const image = await prisma.announcementImage.create({
    data: { announcementId: announcement.id, imageUrl: parsed.data.imageUrl, order: count },
  });

  return NextResponse.json({ image }, { status: 201 });
}

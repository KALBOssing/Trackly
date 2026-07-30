import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";

export async function DELETE(_req: Request, { params }: { params: { fileId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = await prisma.submissionFile.findUnique({
    where: { id: params.fileId },
    include: { submission: true },
  });
  if (!file || file.submission.studentId !== session.user.studentProfileId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (file.submission.status === "GRADED") {
    return NextResponse.json({ error: "Can't remove files from a graded submission" }, { status: 400 });
  }

  await prisma.submissionFile.delete({ where: { id: file.id } });

  try {
    const path = new URL(file.fileUrl).pathname.split("/trackly-uploads/")[1];
    if (path) await deleteFile(path);
  } catch {
    // Ignore storage cleanup failures.
  }

  return NextResponse.json({ success: true });
}

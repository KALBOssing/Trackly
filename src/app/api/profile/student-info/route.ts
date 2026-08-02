import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GRADE_LEVELS } from "@/lib/constants/grades";
import { z } from "zod";

const schema = z.object({
  gradeLevel: z.enum(GRADE_LEVELS),
  section: z.string().min(1, "Section is required").max(40),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.studentProfile.update({
    where: { id: session.user.studentProfileId! },
    data: { gradeLevel: parsed.data.gradeLevel, section: parsed.data.section },
  });

  return NextResponse.json({ studentProfile: updated });
}

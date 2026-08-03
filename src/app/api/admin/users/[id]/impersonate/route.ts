import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setSessionForUser } from "@/lib/impersonation";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    include: { studentProfile: true, teacherProfile: true },
  });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.suspended) return NextResponse.json({ error: "This account is suspended" }, { status: 409 });

  await setSessionForUser(
    {
      id: target.id,
      email: target.email,
      name: `${target.firstName} ${target.lastName}`,
      role: target.role,
      studentProfileId: target.studentProfile?.id,
      teacherProfileId: target.teacherProfile?.id,
    },
    session.user.id
  );

  return NextResponse.json({ success: true, redirectTo: "/dashboard" });
}

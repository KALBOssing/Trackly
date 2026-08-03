import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setSessionForUser } from "@/lib/impersonation";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.impersonatedBy) {
    return NextResponse.json({ error: "Not currently impersonating anyone" }, { status: 400 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.impersonatedBy },
    include: { studentProfile: true, teacherProfile: true },
  });
  if (!admin) return NextResponse.json({ error: "Admin account not found" }, { status: 404 });

  await setSessionForUser({
    id: admin.id,
    email: admin.email,
    name: `${admin.firstName} ${admin.lastName}`,
    role: admin.role,
    studentProfileId: admin.studentProfile?.id,
    teacherProfileId: admin.teacherProfile?.id,
  });

  return NextResponse.json({ success: true, redirectTo: "/admin/users" });
}

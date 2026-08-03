import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (isAdminEmail(target.email)) {
    return NextResponse.json({ error: "Can't suspend an admin account" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { suspended: !target.suspended },
  });

  return NextResponse.json({ user: updated });
}

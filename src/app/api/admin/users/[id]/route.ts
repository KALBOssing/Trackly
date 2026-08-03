import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (isAdminEmail(target.email)) {
    return NextResponse.json({ error: "Can't delete an admin account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: target.id } });

  return NextResponse.json({ success: true });
}

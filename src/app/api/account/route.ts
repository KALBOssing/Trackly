import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { z } from "zod";

const schema = z.object({ password: z.string().min(1, "Password is required") });

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Password is required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ success: true });
}

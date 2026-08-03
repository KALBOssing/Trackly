import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.user.update({ where: { id: target.id }, data: { resetToken, resetTokenExpiresAt } });

  await sendPasswordResetEmail(target.email, resetToken);

  // Return the link directly too — email may not be configured, and an
  // admin needs a way to hand this to the user regardless.
  return NextResponse.json({ resetLink: `${APP_URL}/reset-password?token=${resetToken}` });
}

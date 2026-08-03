import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // JWT sessions aren't re-validated against the DB automatically, so a
  // suspension by an admin wouldn't take effect until the token expires
  // (up to 30 days) without this check on every protected page load.
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { suspended: true } });
  if (dbUser?.suspended) redirect("/login?suspended=1");

  return user;
}

export async function requireRole(role: "STUDENT" | "TEACHER") {
  const user = await requireUser();
  if (user.role !== role) redirect("/dashboard");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) redirect("/dashboard");
  return user;
}

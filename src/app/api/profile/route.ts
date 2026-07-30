import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const THEME_COLORS = ["blue", "purple", "green", "rose", "amber", "slate"] as const;

const profileSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  biography: z.string().max(500).optional().or(z.literal("")),
  darkMode: z.boolean().optional(),
  themeColor: z.enum(THEME_COLORS).optional(),
  notificationsOptIn: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      biography: parsed.data.biography || null,
      darkMode: parsed.data.darkMode,
      themeColor: parsed.data.themeColor,
      notificationsOptIn: parsed.data.notificationsOptIn,
    },
  });

  return NextResponse.json({
    user: {
      firstName: updated.firstName,
      lastName: updated.lastName,
      darkMode: updated.darkMode,
      themeColor: updated.themeColor,
    },
  });
}

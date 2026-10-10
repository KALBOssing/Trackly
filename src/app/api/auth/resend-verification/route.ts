import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { newVerificationExpiry } from "@/lib/email-verification";

const schema = z.object({ email: z.string().email() });

// Always answers with the same generic success so this can't be used to find
// out which email addresses have accounts.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: true });

  const email = parsed.data.email.toLowerCase();

  // Limit per address as well as per IP so one inbox can't be flooded.
  const byIp = rateLimit(`resend-verify:ip:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  const byEmail = rateLimit(`resend-verify:email:${email}`, { limit: 3, windowMs: 15 * 60 * 1000 });
  if (!byIp.success || !byEmail.success) return NextResponse.json({ success: true });

  const user = await prisma.user.findUnique({ where: { email } });
  // Only accounts created under the verification flow (expiry set) and not yet verified.
  if (user && !user.emailVerified && user.emailVerifyExpiresAt) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: token, emailVerifyExpiresAt: newVerificationExpiry() },
    });
    await sendVerificationEmail(email, token);
  }

  return NextResponse.json({ success: true });
}

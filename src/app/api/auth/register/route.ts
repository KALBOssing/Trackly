import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`register:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
  }

  if (data.role === "STUDENT" && data.studentId) {
    const existingStudentId = await prisma.studentProfile.findUnique({
      where: { studentId: data.studentId },
    });
    if (existingStudentId) {
      return NextResponse.json({ error: "Student ID is already in use" }, { status: 409 });
    }
  }

  const passwordHash = await hashPassword(data.password);
  const emailVerifyToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: data.role,
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      emailVerifyToken,
      ...(data.role === "STUDENT"
        ? {
            studentProfile: {
              create: {
                studentId: data.studentId!,
                gradeLevel: data.gradeLevel!,
                section: data.section!,
              },
            },
          }
        : {
            teacherProfile: { create: {} },
          }),
    },
    select: { id: true, email: true, role: true },
  });

  await prisma.activityLog.create({
    data: { userId: user.id, action: "USER_REGISTERED", ipAddress: ip },
  });

  await sendVerificationEmail(email, emailVerifyToken);

  return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
}

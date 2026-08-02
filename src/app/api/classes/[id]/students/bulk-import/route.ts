import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";

type CsvRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cls = await prisma.class.findFirst({
    where: { id: params.id, teacherId: session.user.teacherProfileId },
  });
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const rows: CsvRow[] = body?.rows ?? [];
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] };
  // Every imported student gets this temporary password and must reset it on first login.
  const tempPasswordHash = await hashPassword(crypto.randomBytes(9).toString("base64url") + "Aa1!");

  for (const row of rows) {
    if (!row.studentId || !row.firstName || !row.lastName || !row.email) {
      results.errors.push(`Skipped incomplete row: ${JSON.stringify(row)}`);
      results.skipped++;
      continue;
    }
    const email = row.email.toLowerCase();
    const [emailTaken, idTaken] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.studentProfile.findUnique({ where: { studentId: row.studentId } }),
    ]);
    if (emailTaken || idTaken) {
      results.errors.push(`Skipped duplicate: ${row.email} / ${row.studentId}`);
      results.skipped++;
      continue;
    }

    await prisma.user.create({
      data: {
        email,
        passwordHash: tempPasswordHash,
        role: "STUDENT",
        firstName: row.firstName,
        lastName: row.lastName,
        studentProfile: {
          create: {
            studentId: row.studentId,
            gradeLevel: cls.gradeLevel,
            section: cls.section,
            enrollments: { create: { classId: cls.id } },
          },
        },
      },
    });
    results.created++;
  }

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "BULK_STUDENT_IMPORT",
      metadata: { classId: cls.id, created: results.created, skipped: results.skipped },
    },
  });

  return NextResponse.json(results);
}

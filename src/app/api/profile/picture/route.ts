import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB — plenty for a profile photo

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`profile-pic:${session.user.id}`, { limit: 10, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many uploads. Please slow down." }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Please upload a PNG, JPEG, or WEBP image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `avatars/${session.user.id}/${crypto.randomUUID()}.${ext}`;

  try {
    const url = await uploadFile(path, buffer, file.type);
    await prisma.user.update({ where: { id: session.user.id }, data: { profilePictureUrl: url } });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Profile picture upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Check your Supabase Storage configuration." },
      { status: 502 }
    );
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({ where: { id: session.user.id }, data: { profilePictureUrl: null } });
  return NextResponse.json({ success: true });
}

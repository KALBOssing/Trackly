import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assertValidUpload, uploadFile } from "@/lib/storage";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`upload:${session.user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many uploads. Please slow down." }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    assertValidUpload({ type: file.type, size: file.size });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.split(".").pop();
  const path = `${session.user.id}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

  try {
    const url = await uploadFile(path, buffer, file.type);
    return NextResponse.json({
      url,
      fileName: file.name,
      fileType: file.type,
      fileSizeBytes: file.size,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Check your Supabase Storage configuration." },
      { status: 502 }
    );
  }
}

import { createClient } from "@supabase/supabase-js";
import { ALLOWED_FILE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/validations/academic";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export const BUCKET = "trackly-uploads";

export function assertValidUpload(file: { type: string; size: number }) {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File exceeds the 100MB upload limit");
  }
}

export async function uploadFile(path: string, file: Buffer, contentType: string) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(path: string) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

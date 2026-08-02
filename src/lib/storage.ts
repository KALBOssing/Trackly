import { createClient } from "@supabase/supabase-js";
import { ALLOWED_FILE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/validations/academic";

// Trailing slashes or stray whitespace in SUPABASE_URL (easy to introduce
// when copy-pasting from Supabase's dashboard) produce malformed request
// paths and surface as a cryptic "PGRST125: Invalid path specified in
// request URL" error. Strip both defensively so a copy-paste slip doesn't
// break every upload.
const supabaseUrl = (process.env.SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Supabase storage is not configured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing."
  );
}

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

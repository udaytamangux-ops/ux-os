import { getSupabaseClient } from "./client";

type BucketName = "wireframes" | "ui-screens" | "prompt-images";

// Upload file to Supabase Storage
// Path: {userId}/{projectId}/{fileId}.{ext}
export async function uploadFile(
  bucket: BucketName,
  userId: string,
  projectId: string,
  fileId: string,
  file: File
): Promise<string | null> {
  const supabase = getSupabaseClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${userId}/${projectId}/${fileId}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    console.error("[Storage] Upload failed:", error.message);
    return null;
  }

  // Get a signed URL (valid 24h — regenerate as needed)
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24); // 24 hours

  return data?.signedUrl ?? null;
}

// Delete file from Supabase Storage
export async function deleteStorageFile(
  bucket: BucketName,
  userId: string,
  projectId: string,
  fileId: string,
  fileName: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const ext = fileName.split(".").pop() ?? "bin";
  const path = `${userId}/${projectId}/${fileId}.${ext}`;
  await supabase.storage.from(bucket).remove([path]);
}

// Delete ALL files for a project from a bucket
export async function deleteAllProjectStorage(
  bucket: BucketName,
  userId: string,
  projectId: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const prefix = `${userId}/${projectId}/`;
  const { data } = await supabase.storage.from(bucket).list(prefix);
  if (!data?.length) return;
  const paths = data.map((f) => `${prefix}${f.name}`);
  await supabase.storage.from(bucket).remove(paths);
}

// Refresh a signed URL for a file (call if URL has expired)
export async function refreshSignedUrl(
  bucket: BucketName,
  userId: string,
  projectId: string,
  fileId: string,
  fileName: string
): Promise<string | null> {
  const supabase = getSupabaseClient();
  const ext = fileName.split(".").pop() ?? "bin";
  const path = `${userId}/${projectId}/${fileId}.${ext}`;
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl ?? null;
}

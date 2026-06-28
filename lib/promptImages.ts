import { v4 as uuid } from "uuid";
import { uploadFile } from "@/lib/supabase/storage";
import type { PromptImage } from "@/types";

// Uploads a prompt result image. With Supabase configured (signed-in user) it
// goes to the `prompt-images` bucket; otherwise we fall back to a session-only
// objectURL (the store is in-memory anyway when Supabase isn't configured).
// The returned id doubles as the storage fileId so deletes can reconstruct the path.
export async function uploadPromptImage(
  userId: string | null,
  entryId: string,
  file: File
): Promise<Omit<PromptImage, "uploadedAt">> {
  const id = uuid();
  let storageUrl: string | null = null;
  if (userId) {
    storageUrl = await uploadFile("prompt-images", userId, entryId, id, file);
  } else {
    storageUrl = URL.createObjectURL(file);
  }
  return { id, name: file.name, size: file.size, storageUrl };
}

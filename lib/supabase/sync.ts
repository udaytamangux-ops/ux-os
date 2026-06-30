import {
  syncProject,
  syncContact,
  syncQuickNote,
  deleteProjectFromDB,
  deleteContactFromDB,
  deleteQuickNoteFromDB,
  logActivity,
  syncPromptEntry,
  deletePromptEntryFromDB,
} from "./db";
import { deleteAllProjectStorage } from "./storage";
import type { Project, Contact, QuickNote, ActivityItem, PromptEntry } from "@/types";

// Get current user ID from the Supabase session
async function getUserId(): Promise<string | null> {
  const { getSupabaseClient } = await import("./client");
  const {
    data: { user },
  } = await getSupabaseClient().auth.getUser();
  return user?.id ?? null;
}

export async function bgSyncProject(project: Project): Promise<void> {
  const uid = await getUserId();
  if (!uid) return;
  await syncProject(project, uid);
}

export async function bgSyncContact(contact: Contact): Promise<void> {
  const uid = await getUserId();
  if (!uid) return;
  await syncContact(contact, uid);
}

export async function bgSyncNote(note: QuickNote): Promise<void> {
  const uid = await getUserId();
  if (!uid) return;
  await syncQuickNote(note, uid);
}

export async function bgDeleteProject(projectId: string): Promise<void> {
  const uid = await getUserId();
  if (!uid) return;
  await deleteAllProjectStorage("wireframes", uid, projectId);
  await deleteAllProjectStorage("ui-screens", uid, projectId);
  await deleteProjectFromDB(projectId);
}

export async function bgDeleteContact(contactId: string): Promise<void> {
  await deleteContactFromDB(contactId);
}

export async function bgDeleteNote(noteId: string): Promise<void> {
  await deleteQuickNoteFromDB(noteId);
}

export async function bgLogActivity(item: ActivityItem): Promise<void> {
  const uid = await getUserId();
  if (!uid) return;
  await logActivity(item, uid);
}

export async function bgSyncPrompt(entry: PromptEntry): Promise<void> {
  const uid = await getUserId();
  if (!uid) return;
  await syncPromptEntry(entry, uid);
}

export async function bgDeletePrompt(entryId: string): Promise<void> {
  const uid = await getUserId();
  await deletePromptEntryFromDB(entryId);
  if (!uid) return;
  try {
    await deleteAllProjectStorage("prompt-images", uid, entryId);
  } catch (error) {
    console.error("[Storage] Delete prompt images failed:", error);
  }
}

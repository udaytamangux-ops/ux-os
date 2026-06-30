import { getSupabaseClient } from "./client";
import type {
  Project,
  Contact,
  QuickNote,
  ActivityItem,
  NavigationMap,
  PromptEntry,
  PromptImage,
} from "@/types";

// Converts a DB row (snake_case) → Project (camelCase)
export function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    client: row.client as string,
    category: row.category as string,
    status: row.status as Project["status"],
    priority: row.priority as Project["priority"],
    currentPhase: row.current_phase as Project["currentPhase"],
    completedPhases: (row.completed_phases as Project["completedPhases"]) ?? [],
    brief: (row.brief as Project["brief"]) ?? {
      problem: "",
      goal: "",
      targetUsers: "",
      constraints: "",
      successMetrics: "",
      businessContext: "",
    },
    interviewQuestions: (row.interview_questions as Project["interviewQuestions"]) ?? [],
    personas: (row.personas as Project["personas"]) ?? [],
    phaseNotes: (row.phase_notes as Project["phaseNotes"]) ?? [],
    handoffNotes: (row.handoff_notes as string) ?? "",
    caseStudy: (row.case_study as string | null) ?? null,
    caseStudyGeneratedAt: (row.case_study_generated_at as string | null) ?? null,
    caseStudyTemplate: (row.case_study_template as Project["caseStudyTemplate"]) ?? "web",
    sitemap: (row.sitemap as Project["sitemap"]) ?? null,
    journeyStages: (row.journey_stages as Project["journeyStages"]) ?? [],
    testingFindings: (row.testing_findings as Project["testingFindings"]) ?? [],
    wireframeFiles: (row.wireframe_files as Project["wireframeFiles"]) ?? [],
    uiScreenFiles: (row.ui_screen_files as Project["uiScreenFiles"]) ?? [],
    navMap: (row.nav_map as NavigationMap) ?? { nodes: [], edges: [] },
    prototypeLink: (row.prototype_link as string) ?? "",
    prototypeNotes: (row.prototype_notes as string) ?? "",
    uiDesignNotes: (row.ui_design_notes as string) ?? "",
    iaNotes: (row.ia_notes as string) ?? "",
    isArchived: (row.is_archived as boolean) ?? false,
    isPortfolioPublic: (row.is_portfolio_public as boolean) ?? false,
    portfolioSlug: (row.portfolio_slug as string | null) ?? null,
    daysActive: (row.days_active as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Converts Project → DB row (camelCase → snake_case)
export function projectToRow(p: Project, userId: string): Record<string, unknown> {
  return {
    id: p.id,
    user_id: userId,
    name: p.name,
    client: p.client,
    category: p.category,
    status: p.status,
    priority: p.priority,
    current_phase: p.currentPhase,
    completed_phases: p.completedPhases,
    brief: p.brief,
    interview_questions: p.interviewQuestions,
    personas: p.personas,
    phase_notes: p.phaseNotes,
    handoff_notes: p.handoffNotes,
    case_study: p.caseStudy,
    case_study_generated_at: p.caseStudyGeneratedAt,
    case_study_template: p.caseStudyTemplate,
    sitemap: p.sitemap,
    journey_stages: p.journeyStages,
    testing_findings: p.testingFindings,
    wireframe_files: p.wireframeFiles,
    ui_screen_files: p.uiScreenFiles,
    nav_map: p.navMap,
    prototype_link: p.prototypeLink,
    prototype_notes: p.prototypeNotes,
    ui_design_notes: p.uiDesignNotes,
    ia_notes: p.iaNotes,
    is_archived: p.isArchived,
    is_portfolio_public: p.isPortfolioPublic,
    portfolio_slug: p.portfolioSlug,
    days_active: p.daysActive,
    updated_at: new Date().toISOString(),
  };
}

function rowToContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    company: (row.company as string) ?? "",
    role: (row.role as string) ?? "",
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    projectId: (row.project_id as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

function rowToNote(row: Record<string, unknown>): QuickNote {
  return {
    id: row.id as string,
    content: (row.content as string) ?? "",
    projectId: (row.project_id as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToActivity(row: Record<string, unknown>): ActivityItem {
  return {
    id: row.id as string,
    text: row.text as string,
    type: row.type as ActivityItem["type"],
    projectId: row.project_id as string,
    timestamp: row.timestamp as string,
  };
}

export function rowToPromptEntry(row: Record<string, unknown>): PromptEntry {
  return {
    id: row.id as string,
    title: (row.title as string) ?? "",
    prompt: (row.prompt as string) ?? "",
    negativePrompt: (row.negative_prompt as string) ?? "",
    tool: (row.tool as PromptEntry["tool"]) ?? "Midjourney",
    tags: (row.tags as string[]) ?? [],
    images: (row.images as PromptImage[]) ?? [],
    notes: (row.notes as string) ?? "",
    projectId: (row.project_id as string | null) ?? null,
    isFavorite: (row.is_favorite as boolean) ?? false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function promptEntryToRow(p: PromptEntry, userId: string): Record<string, unknown> {
  return {
    id: p.id,
    user_id: userId,
    title: p.title,
    prompt: p.prompt,
    negative_prompt: p.negativePrompt,
    tool: p.tool,
    tags: p.tags,
    images: p.images,
    notes: p.notes,
    project_id: p.projectId,
    is_favorite: p.isFavorite,
    updated_at: new Date().toISOString(),
  };
}

export async function syncPromptEntry(entry: PromptEntry, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("prompt_entries")
    .upsert(promptEntryToRow(entry, userId), { onConflict: "id" });
  if (error) console.error("[DB] Sync prompt failed:", error.message);
}

export async function deletePromptEntryFromDB(entryId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("prompt_entries").delete().eq("id", entryId);
  if (error) console.error("[DB] Delete prompt failed:", error.message);
}

// LOAD ALL DATA for the current user
export async function loadAllData(userId: string) {
  const supabase = getSupabaseClient();

  const [projectsRes, contactsRes, notesRes, activityRes, promptsRes] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("contacts").select("*").eq("user_id", userId),
    supabase.from("quick_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("activity").select("*").eq("user_id", userId).order("timestamp", { ascending: false }).limit(50),
    supabase.from("prompt_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  return {
    projects: (projectsRes.data ?? []).map(rowToProject),
    contacts: (contactsRes.data ?? []).map(rowToContact),
    quickNotes: (notesRes.data ?? []).map(rowToNote),
    activity: (activityRes.data ?? []).map(rowToActivity),
    promptEntries: (promptsRes.data ?? []).map(rowToPromptEntry),
  };
}

// SYNC a project to Supabase (upsert)
export async function syncProject(project: Project, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("projects")
    .upsert(projectToRow(project, userId), { onConflict: "id" });
  if (error) console.error("[DB] Sync project failed:", error.message);
}

// DELETE a project from Supabase
export async function deleteProjectFromDB(projectId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw new Error(`[DB] Delete project failed: ${error.message}`);
}

// SYNC contact
export async function syncContact(contact: Contact, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const row = {
    id: contact.id,
    user_id: userId,
    name: contact.name,
    company: contact.company,
    role: contact.role,
    email: contact.email,
    phone: contact.phone,
    project_id: contact.projectId ?? null,
    created_at: contact.createdAt,
  };
  const { error } = await supabase.from("contacts").upsert(row, { onConflict: "id" });
  if (error) console.error("[DB] Sync contact failed:", error.message);
}

// DELETE contact
export async function deleteContactFromDB(contactId: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("contacts").delete().eq("id", contactId);
}

// SYNC quick note
export async function syncQuickNote(note: QuickNote, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const row = {
    id: note.id,
    user_id: userId,
    content: note.content,
    project_id: note.projectId ?? null,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  };
  const { error } = await supabase.from("quick_notes").upsert(row, { onConflict: "id" });
  if (error) console.error("[DB] Sync note failed:", error.message);
}

// DELETE quick note
export async function deleteQuickNoteFromDB(noteId: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("quick_notes").delete().eq("id", noteId);
}

// LOG activity
export async function logActivity(item: ActivityItem, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const row = {
    id: item.id,
    user_id: userId,
    text: item.text,
    type: item.type,
    project_id: item.projectId,
    timestamp: item.timestamp,
  };
  await supabase.from("activity").insert(row);
}

// LOAD a single public portfolio project (no auth)
export async function loadPublicProject(slug: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("portfolio_slug", slug)
    .eq("is_portfolio_public", true)
    .single();
  if (error || !data) return null;
  return rowToProject(data);
}

// GENERATE a unique portfolio slug from project name
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "project"}-${suffix}`;
}

"use client";

import { useState } from "react";
import { CloudUpload, Loader2, X } from "lucide-react";
import { bgSyncContact, bgSyncNote, bgSyncProject } from "@/lib/supabase/sync";
import { useStore } from "@/store/useStore";
import type { Contact, Project, QuickNote } from "@/types";

const LEGACY_KEY = "ux-os-storage";
const MIGRATED_FLAG = "ux-os-migrated";

interface LegacyState {
  projects?: Project[];
  contacts?: Contact[];
  quickNotes?: QuickNote[];
}

function readLegacy(): LegacyState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: LegacyState } | LegacyState;
    const state = "state" in parsed ? parsed.state : (parsed as LegacyState);
    if (!state) return null;
    const count = (state.projects?.length ?? 0) + (state.contacts?.length ?? 0) + (state.quickNotes?.length ?? 0);
    return count > 0 ? state : null;
  } catch {
    return null;
  }
}

export function DataMigration() {
  const isHydrated = useStore((s) => s.isHydrated);
  const currentUser = useStore((s) => s.currentUser);
  // Lazy init reads localStorage once on the client; null if already migrated.
  const [legacy] = useState<LegacyState | null>(() => {
    if (typeof window === "undefined") return null;
    if (window.localStorage.getItem(MIGRATED_FLAG) === "true") return null;
    return readLegacy();
  });
  const [status, setStatus] = useState<"idle" | "running" | "done" | "dismissed">("idle");

  if (!isHydrated || !currentUser || !legacy || status === "dismissed" || status === "done") {
    return null;
  }

  const counts = {
    projects: legacy.projects?.length ?? 0,
    contacts: legacy.contacts?.length ?? 0,
    notes: legacy.quickNotes?.length ?? 0,
  };

  async function migrate() {
    if (!legacy) return;
    setStatus("running");

    const existing = useStore.getState();
    const projectIds = new Set(existing.projects.map((p) => p.id));
    const contactIds = new Set(existing.contacts.map((c) => c.id));
    const noteIds = new Set(existing.quickNotes.map((n) => n.id));

    const newProjects = (legacy.projects ?? []).filter((p) => !projectIds.has(p.id));
    const newContacts = (legacy.contacts ?? []).filter((c) => !contactIds.has(c.id));
    const newNotes = (legacy.quickNotes ?? []).filter((n) => !noteIds.has(n.id));

    // Append to the in-memory store (Phase 3 defaults filled in by getProject/withDefaults).
    useStore.setState((s) => ({
      projects: [...s.projects, ...newProjects],
      contacts: [...s.contacts, ...newContacts],
      quickNotes: [...s.quickNotes, ...newNotes],
    }));

    // Push everything to Supabase. getProject normalizes Phase 3 fields before syncing.
    for (const p of newProjects) {
      const normalized = useStore.getState().getProject(p.id);
      if (normalized) await bgSyncProject(normalized);
    }
    for (const c of newContacts) await bgSyncContact(c);
    for (const n of newNotes) await bgSyncNote(n);

    window.localStorage.setItem(MIGRATED_FLAG, "true");
    setStatus("done");
  }

  return (
    <div className="anime-card studio-panel mb-6 flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent-d p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-surface text-accent">
          <CloudUpload size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-t1">Local data found</p>
          <p className="mt-0.5 text-xs text-t2">
            Migrate {counts.projects} project{counts.projects === 1 ? "" : "s"}, {counts.contacts} contact
            {counts.contacts === 1 ? "" : "s"}, and {counts.notes} note{counts.notes === 1 ? "" : "s"} from this
            browser to your cloud account. Uploaded files must be re-added.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={migrate}
          disabled={status === "running"}
          className="interactive-lift focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60"
        >
          {status === "running" ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : null}
          {status === "running" ? "Migrating…" : "Migrate to cloud"}
        </button>
        <button
          type="button"
          onClick={() => setStatus("dismissed")}
          className="interactive-lift focus-ring inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-t2 hover:bg-surface hover:text-t1"
          aria-label="Dismiss"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

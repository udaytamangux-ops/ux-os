"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bot, FolderKanban, LayoutDashboard, LogOut, NotepadText, Plus, Trash2, Users, Wand2, X } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import { getOptionalSupabaseClient } from "@/lib/supabase/client";
import { useStore } from "@/store/useStore";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/prompt-vault", label: "Prompt Vault", icon: Wand2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/ai-studio", label: "AI Studio", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useStore((s) => s.currentUser);
  const [quickNotesOpen, setQuickNotesOpen] = useState(false);

  async function handleSignOut() {
    const supabase = getOptionalSupabaseClient();
    await supabase?.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar-play sticky top-0 hidden h-dvh w-[260px] shrink-0 border-r border-border bg-surface/90 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="anime-mark flex h-10 w-10 rotate-[-4deg] items-center justify-center rounded-lg border border-accent/30 bg-accent-d font-display text-sm font-bold text-accent shadow-[4px_4px_0_rgba(60,96,156,0.18)]">
          UX
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-t1">UX OS</p>
          <p className="text-xs text-t2">Design workspace</p>
        </div>
      </div>

      <nav className="space-y-1" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "anime-nav-link flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "anime-nav-link-active border border-accent/25 bg-accent-d text-accent"
                  : "interactive-lift text-t2 hover:bg-card hover:text-t1"
              )}
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setQuickNotesOpen(true)}
        className="anime-cta interactive-lift focus-ring mt-4 flex min-h-11 items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-sm font-semibold text-t1 hover:border-border-s hover:bg-card-h"
      >
        <NotepadText size={18} aria-hidden="true" />
        Quick Notes
      </button>

      <div className="graph-paper paper-note mt-auto rounded-lg border border-border bg-card/95 p-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Workspace</p>
        <p className="mt-2 text-xs leading-relaxed text-t2">
          UX phases, files, testing notes, prompts, and case studies in one flow.
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-d font-display text-xs font-bold text-accent">
          {(currentUser?.email ?? "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-t1">{currentUser?.email ?? "Signed out"}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="interactive-lift focus-ring inline-flex min-h-8 min-w-8 items-center justify-center rounded-md text-t2 hover:bg-pink-d hover:text-pink"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>

      {quickNotesOpen && <QuickNotesPanel onClose={() => setQuickNotesOpen(false)} />}
    </aside>
  );
}

function QuickNotesPanel({ onClose }: { onClose: () => void }) {
  const quickNotes = useStore((s) => s.quickNotes);
  const projects = useStore((s) => s.projects);
  const addQuickNote = useStore((s) => s.addQuickNote);
  const updateQuickNote = useStore((s) => s.updateQuickNote);
  const deleteQuickNote = useStore((s) => s.deleteQuickNote);
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function createNote() {
    const trimmed = content.trim();
    if (!trimmed) return;
    addQuickNote(trimmed, projectId || undefined);
    setContent("");
  }

  return (
    <div className="studio-panel panel-pop fixed left-[260px] top-0 z-40 flex h-dvh w-[390px] flex-col border-r border-border bg-surface">
      <div className="flex items-start justify-between border-b border-border p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-t2">Capture</p>
          <h2 className="mt-1 font-display text-base font-semibold text-t1">Quick Notes</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="interactive-lift focus-ring inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-t2 hover:bg-card hover:text-t1"
        >
          <X size={17} aria-hidden="true" />
          <span className="sr-only">Close quick notes</span>
        </button>
      </div>

      <div className="border-b border-border p-4">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          placeholder="Capture a design decision, blocker, or follow-up."
          className="focus-ring w-full resize-none rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-t1 outline-none transition-colors placeholder:text-t3 focus:border-accent"
        />
        <div className="mt-3 flex gap-2">
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="focus-ring min-h-10 flex-1 rounded-md border border-border bg-card px-3 text-xs text-t1 outline-none transition-colors focus:border-accent"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={createNote}
            disabled={!content.trim()}
            className="interactive-lift focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-accent px-3 text-xs font-semibold text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={14} aria-hidden="true" />
            Add
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {quickNotes.map((note) => {
          const project = projects.find((item) => item.id === note.projectId);
          return (
            <article key={note.id} className="anime-card rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-t1">{project?.name ?? "General note"}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-t2">{relativeTime(note.updatedAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteQuickNote(note.id)}
                  className="interactive-lift focus-ring inline-flex min-h-8 min-w-8 items-center justify-center rounded-md text-t2 hover:bg-pink-d hover:text-pink"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  <span className="sr-only">Delete note</span>
                </button>
              </div>
              <textarea
                defaultValue={note.content}
                onBlur={(event) => updateQuickNote(note.id, event.target.value)}
                rows={3}
                className="focus-ring w-full resize-none rounded-md border border-transparent bg-surface p-2 text-sm leading-relaxed text-t1 outline-none transition-colors focus:border-accent"
              />
            </article>
          );
        })}

        {!quickNotes.length && (
          <div className="rounded-lg border border-dashed border-border p-5 text-center">
            <NotepadText size={24} className="mx-auto mb-3 text-t2" aria-hidden="true" />
            <p className="text-sm font-medium text-t1">No quick notes yet</p>
            <p className="mt-1 text-xs leading-relaxed text-t2">Add short notes without leaving your current workflow.</p>
          </div>
        )}
      </div>
    </div>
  );
}

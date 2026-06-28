"use client";

import { useMemo, useState } from "react";
import { Archive, Plus, Search } from "lucide-react";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/useHydrated";
import { useStore } from "@/store/useStore";

export default function ProjectsPage() {
  const hydrated = useHydrated();
  const projects = useStore((s) => s.projects);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const archivedCount = useMemo(() => projects.filter((p) => p.isArchived).length, [projects]);
  const visibleProjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects
      .filter((project) => (showArchived ? project.isArchived : !project.isArchived))
      .filter((project) =>
        !term
          ? true
          : [project.name, project.client, project.category, project.status, project.priority].some((value) =>
              value.toLowerCase().includes(term)
            )
      );
  }, [projects, query, showArchived]);

  if (!hydrated) {
    return (
      <div className="px-5 py-6 lg:px-7">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-card" />
        <div className="grid gap-4 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-xl border border-border bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 lg:px-7">
      <div className="anime-hero studio-panel mb-6 rounded-xl border border-border bg-surface/95 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-t1">Projects</h1>
            <p className="mt-1 text-sm text-t2">Track every client workspace by status.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:w-72">
              <span className="sr-only">Search projects</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-t3" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search project, client, status"
                className="focus-ring min-h-11 w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-t1 outline-none placeholder:text-t3 focus:border-accent"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className={cn(
                "interactive-lift focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium",
                showArchived ? "border-accent/40 bg-accent-d text-accent" : "border-border bg-card text-t2 hover:text-t1"
              )}
            >
              <Archive size={15} aria-hidden="true" />
              {showArchived ? "Viewing Archived" : `Archived${archivedCount ? ` (${archivedCount})` : ""}`}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="interactive-lift focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
            >
              <Plus size={16} aria-hidden="true" />
              New Project
            </button>
          </div>
        </div>
      </div>

      <KanbanBoard projects={visibleProjects} onCreate={() => setModalOpen(true)} />
      <NewProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

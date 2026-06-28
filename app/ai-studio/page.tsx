"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CaseStudyGenerator } from "@/components/ai/CaseStudyGenerator";
import { Badge } from "@/components/ui/Badge";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export default function AIStudioPage() {
  return (
    <Suspense fallback={<div className="p-7 text-sm text-t2">Loading AI Studio...</div>}>
      <AIStudioContent />
    </Suspense>
  );
}

function AIStudioContent() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const projects = useStore((s) => s.projects);
  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const selectedId = manualSelectedId ?? searchParams.get("projectId");

  const selectedProject = projects.find((project) => project.id === selectedId) ?? null;

  if (!hydrated) {
    return <div className="p-7 text-sm text-t2">Loading saved workspace...</div>;
  }

  return (
    <div className="grid gap-5 px-5 py-6 lg:grid-cols-[280px_1fr] lg:px-7">
      <aside className="studio-panel h-fit rounded-xl border border-border bg-surface/95 p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-accent">Select project</p>
        <div className="space-y-2">
          {projects.map((project) => {
            const active = project.id === selectedId;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setManualSelectedId(project.id)}
                className={cn(
                  "interactive-lift focus-ring w-full rounded-lg border p-3 text-left",
                  active ? "border-accent/40 bg-accent-d" : "border-border bg-card hover:border-border-s"
                )}
              >
                <p className="truncate text-sm font-semibold text-t1">{project.name}</p>
                <p className="mt-1 truncate text-xs text-t2">{project.client}</p>
                <div className="mt-3">
                  <Badge text={project.status} />
                </div>
              </button>
            );
          })}
          {!projects.length && (
            <div className="rounded-lg border border-dashed border-border bg-card p-4">
              <p className="text-sm font-medium text-t1">No project selected</p>
              <p className="mt-1 text-xs leading-relaxed text-t2">Create a project first, then generate a case study from its notes.</p>
              <Link
                href="/projects"
                className="interactive-lift focus-ring mt-3 inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-3 text-xs font-semibold text-white hover:bg-accent/90"
              >
                Go to projects
              </Link>
            </div>
          )}
        </div>
      </aside>
      <section className="min-w-0">
        <div className="anime-hero studio-panel mb-6 rounded-xl border border-border bg-surface/95 p-5">
          <h1 className="font-display text-3xl font-semibold text-t1">AI Studio</h1>
          <p className="mt-1 text-sm text-t2">Generate a polished case study from your project notes.</p>
        </div>
        <CaseStudyGenerator project={selectedProject} />
      </section>
    </div>
  );
}

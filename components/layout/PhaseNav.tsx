"use client";

import { Check } from "lucide-react";
import { cn, padPhase, PHASES } from "@/lib/utils";
import type { PhaseId, Project } from "@/types";

export function PhaseNav({
  project,
  currentPhase,
  onPhaseSelect,
}: {
  project: Project;
  currentPhase: PhaseId;
  onPhaseSelect: (id: PhaseId) => void;
}) {
  return (
    <div className="flex overflow-x-auto border-b border-border bg-surface/95" role="tablist">
      {PHASES.map((phase) => {
        const completed = project.completedPhases.includes(phase.id);
        const active = currentPhase === phase.id;
        const isProjectCurrent = project.currentPhase === phase.id && !active;

        return (
          <button
            key={phase.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onPhaseSelect(phase.id)}
            className={cn(
              "interactive-lift flex min-h-11 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-[12px]",
              active ? "border-accent bg-accent-d/70 font-semibold text-accent" : "border-transparent text-t3 hover:bg-card hover:text-t1",
              completed && !active ? "text-mint" : ""
            )}
          >
            {completed ? <Check size={13} aria-hidden="true" /> : <span className="font-mono">{padPhase(phase.id)}</span>}
            {phase.short}
            {isProjectCurrent && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-label="Current project phase" />}
          </button>
        );
      })}
    </div>
  );
}

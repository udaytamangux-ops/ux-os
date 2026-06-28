"use client";

import { Clock, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PhaseTag } from "@/components/ui/PhaseTag";
import { PhaseDots } from "@/components/projects/PhaseDots";
import { getCompletionPercent, getDaysActive } from "@/lib/utils";
import type { Project } from "@/types";

export function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const days = getDaysActive(project.createdAt);
  const completion = getCompletionPercent(project.completedPhases);

  return (
    <button
      type="button"
      onClick={onClick}
      className="anime-card interactive-lift focus-ring mb-3 w-full rounded-lg border border-border bg-card p-4 text-left hover:border-border-s hover:bg-card-h"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-t1">{project.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-t2">
            <UserRound size={13} aria-hidden="true" />
            {project.client}
          </p>
        </div>
        <Badge text={project.priority} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge text={project.status} />
        <PhaseTag phaseId={project.currentPhase} />
      </div>

      <div className="mb-3 flex items-center justify-between text-xs text-t2">
        <span>
          {project.completedPhases.length} / 9 phases - {completion}%
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} aria-hidden="true" />
          {days === 0 ? "Started today" : `${days}d active`}
        </span>
      </div>
      <PhaseDots completedPhases={project.completedPhases} currentPhase={project.currentPhase} />
    </button>
  );
}

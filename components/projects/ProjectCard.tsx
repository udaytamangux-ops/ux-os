"use client";

import { useState } from "react";
import { Clock, Trash2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { useDeleteProjectWithToast } from "@/components/projects/useDeleteProjectWithToast";
import { PhaseTag } from "@/components/ui/PhaseTag";
import { PhaseDots } from "@/components/projects/PhaseDots";
import { getCompletionPercent, getDaysActive } from "@/lib/utils";
import type { Project } from "@/types";

export function ProjectCard({
  project,
  onClick,
  showDeleteAction = true,
}: {
  project: Project;
  onClick: () => void;
  showDeleteAction?: boolean;
}) {
  const deleteProject = useDeleteProjectWithToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const days = getDaysActive(project.createdAt);
  const completion = getCompletionPercent(project.completedPhases);

  return (
    <>
      <article className="anime-card interactive-lift relative mb-3 w-full rounded-lg border border-border bg-card hover:border-border-s hover:bg-card-h">
        <button type="button" onClick={onClick} className="focus-ring block w-full rounded-lg p-4 text-left">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className={showDeleteAction ? "min-w-0 pr-12" : "min-w-0"}>
              <h3 className="truncate text-sm font-semibold text-t1">{project.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-t2">
                <UserRound size={13} aria-hidden="true" />
                {project.client}
              </p>
            </div>
            <div className={showDeleteAction ? "pr-12" : ""}>
              <Badge text={project.priority} />
            </div>
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

        {showDeleteAction && (
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            aria-label={`Delete ${project.name}`}
            className="focus-ring absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-transparent text-t2 transition-colors hover:border-pink/20 hover:bg-pink-d hover:text-pink"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
      </article>

      <DeleteProjectDialog
        project={project}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteProject(project)}
      />
    </>
  );
}

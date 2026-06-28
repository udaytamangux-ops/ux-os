"use client";

import { Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types";

const columns: { status: ProjectStatus; dot: string }[] = [
  { status: "In Progress", dot: "bg-gold" },
  { status: "Review", dot: "bg-accent" },
  { status: "Complete", dot: "bg-mint" },
];

export function KanbanBoard({ projects, onCreate }: { projects: Project[]; onCreate: () => void }) {
  const router = useRouter();

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {columns.map((column) => {
        const items = projects.filter((project) => project.status === column.status);
        return (
          <section key={column.status} className="studio-panel anime-column min-h-[300px] rounded-xl border border-border bg-surface/95 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", column.dot)} />
                <h2 className="text-sm font-semibold text-t1">{column.status}</h2>
              </div>
              <span className="font-mono text-[11px] text-t2">{items.length}</span>
            </div>
            {items.length ? (
              items.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => router.push(`/projects/${project.id}`)}
                />
              ))
            ) : (
              <EmptyState
                icon={Inbox}
                title={`No ${column.status.toLowerCase()} projects`}
                message="Projects move here as their status changes."
                action={column.status === "In Progress" ? { label: "Create project", onClick: onCreate } : undefined}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}

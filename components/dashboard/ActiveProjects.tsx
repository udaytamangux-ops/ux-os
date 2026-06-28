"use client";

import { FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/types";

export function ActiveProjects({ projects, onCreate }: { projects: Project[]; onCreate: () => void }) {
  const router = useRouter();
  const active = projects.filter((project) => project.status !== "Complete");

  if (!active.length) {
    return (
      <EmptyState
        icon={FolderPlus}
        title="No active projects"
        message="Create a project to start moving through the UX workflow."
        action={{ label: "New Project", onClick: onCreate }}
      />
    );
  }

  return (
    <div>
      {active.map((project) => (
        <ProjectCard key={project.id} project={project} onClick={() => router.push(`/projects/${project.id}`)} />
      ))}
    </div>
  );
}

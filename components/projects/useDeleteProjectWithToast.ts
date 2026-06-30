"use client";

import { useCallback } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { useStore } from "@/store/useStore";
import type { Project } from "@/types";

export function useDeleteProjectWithToast() {
  const deleteProjectFull = useStore((s) => s.deleteProjectFull);
  const { addToast } = useToast();

  return useCallback(
    async (project: Project) => {
      try {
        await deleteProjectFull(project.id);
        addToast({
          variant: "success",
          title: "Project deleted",
          description: `${project.name} was removed from your workspace.`,
        });
      } catch (error) {
        console.error("Failed to delete project", error);
        addToast({
          variant: "error",
          title: "Delete failed",
          description: "The project was restored. Check your connection and try again.",
        });
        throw error;
      }
    },
    [addToast, deleteProjectFull]
  );
}

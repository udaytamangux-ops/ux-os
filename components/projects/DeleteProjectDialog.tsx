"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import type { Project } from "@/types";

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onConfirm,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isDeleting && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            This permanently removes the project, its activity history, and saved project files when storage is connected.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-pink/20 bg-pink-d p-3 text-sm text-pink" role="alert">
          <div className="flex gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-pink">This action cannot be undone.</p>
              <p className="mt-1 text-xs leading-relaxed text-pink">
                You are deleting <span className="font-semibold">{project.name}</span> for {project.client}.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="interactive-lift focus-ring min-h-11 rounded-md border border-border bg-card px-4 text-sm font-medium text-t2 hover:text-t1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={isDeleting}
            className="interactive-lift focus-ring min-h-11 rounded-md bg-pink px-4 text-sm font-semibold text-white hover:bg-pink/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete project"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { useStore } from "@/store/useStore";
import type { Priority, Project, ProjectStatus } from "@/types";

const PRIORITIES: Priority[] = ["High", "Medium", "Low"];
const STATUSES: ProjectStatus[] = ["In Progress", "Review", "Complete"];

export function EditProjectModal({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const editProject = useStore((s) => s.editProject);
  const [form, setForm] = useState({
    name: project.name,
    client: project.client,
    category: project.category,
    priority: project.priority,
    status: project.status,
  });

  const canSave = form.name.trim() && form.client.trim() && form.category.trim();

  function save() {
    if (!canSave) return;
    editProject(project.id, {
      name: form.name.trim(),
      client: form.client.trim(),
      category: form.category.trim(),
      priority: form.priority,
      status: form.status,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>Update the project details used across dashboards and phase screens.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-t2">Project name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="focus-ring min-h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-t1 outline-none transition-colors focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-t2">Client</span>
            <input
              value={form.client}
              onChange={(event) => setForm((current) => ({ ...current, client: event.target.value }))}
              className="focus-ring min-h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-t1 outline-none transition-colors focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-t2">Category</span>
            <input
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="focus-ring min-h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-t1 outline-none transition-colors focus:border-accent"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-t2">Priority</span>
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as Priority }))}
                className="focus-ring min-h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-t1 outline-none transition-colors focus:border-accent"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-t2">Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProjectStatus }))}
                className="focus-ring min-h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-t1 outline-none transition-colors focus:border-accent"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="interactive-lift focus-ring min-h-10 rounded-md border border-border bg-card px-4 text-sm font-medium text-t2 hover:text-t1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="interactive-lift focus-ring min-h-10 rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

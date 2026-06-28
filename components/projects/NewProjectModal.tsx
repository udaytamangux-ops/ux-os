"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { useStore } from "@/store/useStore";
import type { Priority } from "@/types";

const inputClass =
  "focus-ring min-h-11 w-full rounded-md border border-border-s bg-card px-3 py-2 text-sm text-t1 outline-none transition-colors placeholder:text-t3 focus:border-accent/60";
const labelClass = "mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-t2";

export function NewProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const addProject = useStore((s) => s.addProject);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    client: "",
    category: "",
    priority: "High" as Priority,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.client.trim()) {
      setError("Project name and client name are required.");
      return;
    }
    const project = addProject({
      name: form.name.trim(),
      client: form.client.trim(),
      category: form.category.trim() || "Product Design",
      priority: form.priority,
    });
    setForm({ name: "", client: "", category: "", priority: "High" });
    setError("");
    onOpenChange(false);
    router.push(`/projects/${project.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Create the workspace record before moving into phases.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="project-name">
              Project Name
            </label>
            <input
              id="project-name"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Medvet Pharma Website"
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="client-name">
              Client Name
            </label>
            <input
              id="client-name"
              className={inputClass}
              value={form.client}
              onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
              placeholder="Medvet Pharma Pvt. Ltd."
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="project-category">
              Category
            </label>
            <input
              id="project-category"
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Healthcare, Education, E-commerce..."
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="project-priority">
              Priority
            </label>
            <select
              id="project-priority"
              className={inputClass}
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          {error && <p className="rounded-md border border-pink/20 bg-pink-d px-3 py-2 text-xs text-pink">{error}</p>}
          <button
            type="submit"
            className="interactive-lift focus-ring min-h-11 w-full rounded-md bg-accent px-4 py-2 font-display text-sm font-semibold text-white hover:bg-accent/90"
          >
            Create Project
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

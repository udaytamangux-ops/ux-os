"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, Trash2, UserRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import { useStore } from "@/store/useStore";
import type { PersonaType } from "@/types";

const inputClass =
  "focus-ring min-h-11 w-full rounded-md border border-border-s bg-card px-3 py-2 text-sm text-t1 outline-none placeholder:text-t3 focus:border-accent/60";
const labelClass = "mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-t2";

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ResearchPhase({ projectId }: { projectId: string }) {
  const project = useStore((s) => s.getProject(projectId));
  const addPersona = useStore((s) => s.addPersona);
  const deletePersona = useStore((s) => s.deletePersona);
  const markPhaseComplete = useStore((s) => s.markPhaseComplete);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    role: "",
    type: "Primary" as PersonaType,
    bio: "",
    painPoints: "",
    needs: "",
    goals: "",
  });
  const autoInitials = useMemo(() => initials(form.name), [form.name]);

  if (!project) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    addPersona(projectId, {
      name: form.name.trim(),
      age: form.age.trim(),
      role: form.role.trim(),
      type: form.type,
      bio: form.bio.trim(),
      painPoints: lines(form.painPoints),
      needs: lines(form.needs),
      goals: lines(form.goals),
      initials: autoInitials || "UX",
    });
    setForm({ name: "", age: "", role: "", type: "Primary", bio: "", painPoints: "", needs: "", goals: "" });
    setOpen(false);
  }

  return (
    <section>
      <PhaseHeader phaseId={2} onComplete={() => markPhaseComplete(projectId, 2)} />
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="interactive-lift focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
        >
          <Plus size={15} aria-hidden="true" />
          Add Persona
        </button>
      </div>

      {project.personas.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {project.personas.map((persona) => (
            <article key={persona.id} className="interactive-lift rounded-xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 rotate-[-3deg] items-center justify-center rounded-xl border border-accent/20 bg-accent-d font-display text-sm font-semibold text-accent shadow-[4px_4px_0_rgba(60,96,156,0.14)]">
                    {persona.initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-semibold text-t1">{persona.name}</h3>
                    <p className="text-xs text-t2">
                      {persona.role}
                      {persona.age ? `, ${persona.age}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge text={persona.type} />
                  <button
                    type="button"
                    onClick={() => deletePersona(projectId, persona.id)}
                    className="interactive-lift focus-ring rounded-md p-2 text-t3 hover:bg-pink-d hover:text-pink"
                    aria-label={`Delete ${persona.name}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {persona.bio && <p className="mb-4 text-sm italic leading-relaxed text-t2">{persona.bio}</p>}
              <PersonaList title="Pain Points" color="bg-pink" items={persona.painPoints} />
              <PersonaList title="Needs" color="bg-mint" items={persona.needs} />
              <PersonaList title="Goals" color="bg-accent" items={persona.goals} />
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UserRound}
          title="No personas yet"
          message="Add research-backed personas before moving into IA."
          action={{ label: "Add Persona", onClick: () => setOpen(true) }}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Persona</DialogTitle>
            <DialogDescription>Use one item per line for pain points, needs, and goals.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </Field>
            <Field label="Age">
              <input className={inputClass} value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} />
            </Field>
            <Field label="Role">
              <input className={inputClass} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} required />
            </Field>
            <Field label="Type">
              <select className={inputClass} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PersonaType }))}>
                <option>Primary</option>
                <option>Secondary</option>
              </select>
            </Field>
            <Field label="Bio" full>
              <textarea className={`${inputClass} min-h-20`} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </Field>
            <Field label="Pain Points">
              <textarea className={`${inputClass} min-h-28`} value={form.painPoints} onChange={(e) => setForm((f) => ({ ...f, painPoints: e.target.value }))} />
            </Field>
            <Field label="Needs">
              <textarea className={`${inputClass} min-h-28`} value={form.needs} onChange={(e) => setForm((f) => ({ ...f, needs: e.target.value }))} />
            </Field>
            <Field label={`Initials: ${autoInitials || "Auto"}`} full>
              <button type="submit" className="interactive-lift focus-ring min-h-11 w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90">
                Save Persona
              </button>
            </Field>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function PersonaList({ title, color, items }: { title: string; color: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-t2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-t1">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

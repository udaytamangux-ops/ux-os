"use client";

import { FormEvent, useState } from "react";
import { Mail, Phone, Plus, UserRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHydrated } from "@/lib/useHydrated";
import { useStore } from "@/store/useStore";

const inputClass =
  "focus-ring min-h-11 w-full rounded-md border border-border-s bg-card px-3 py-2 text-sm text-t1 outline-none placeholder:text-t3 focus:border-accent/60";
const labelClass = "mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-t2";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ContactsPage() {
  const hydrated = useHydrated();
  const contacts = useStore((s) => s.contacts);
  const projects = useStore((s) => s.projects);
  const addContact = useStore((s) => s.addContact);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", role: "", email: "", phone: "", projectId: "" });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.company.trim() || !form.role.trim() || !form.email.trim() || !form.phone.trim()) return;
    addContact({
      name: form.name.trim(),
      company: form.company.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      projectId: form.projectId || undefined,
    });
    setForm({ name: "", company: "", role: "", email: "", phone: "", projectId: "" });
    setOpen(false);
  }

  if (!hydrated) return <div className="p-7 text-sm text-t2">Loading contacts...</div>;

  return (
    <div className="px-5 py-6 lg:px-7">
      <div className="anime-hero studio-panel mb-6 rounded-xl border border-border bg-surface/95 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-t1">Contacts</h1>
            <p className="mt-1 text-sm text-t2">Client and stakeholder details connected to projects.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="interactive-lift focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
          >
            <Plus size={16} aria-hidden="true" />
            Add Contact
          </button>
        </div>
      </div>

      {contacts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contacts.map((contact) => {
            const linkedProject = projects.find((project) => project.id === contact.projectId);
            return (
              <article key={contact.id} className="anime-card interactive-lift rounded-xl border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent-d text-sm font-semibold text-accent">
                    {initials(contact.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-sm font-semibold text-t1">{contact.name}</h2>
                    <p className="truncate text-xs text-t2">
                      {contact.role} - {contact.company}
                    </p>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <a href={`mailto:${contact.email}`} className="mb-2 flex items-center gap-2 text-sm text-t1 transition-colors hover:text-accent">
                    <Mail size={14} className="text-accent" aria-hidden="true" />
                    {contact.email}
                  </a>
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-t1 transition-colors hover:text-accent">
                    <Phone size={14} className="text-accent" aria-hidden="true" />
                    {contact.phone}
                  </a>
                </div>
                {linkedProject && (
                  <p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent-d px-2.5 py-1 text-[11px] text-accent">
                    {linkedProject.name}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={UserRound}
          title="No contacts yet"
          message="Add your first client or stakeholder so project details stay connected."
          action={{ label: "Add Contact", onClick: () => setOpen(true) }}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Keep client contact details close to project work.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            {(["name", "company", "role", "email", "phone"] as const).map((key) => (
              <div key={key}>
                <label className={labelClass} htmlFor={key}>
                  {key}
                </label>
                <input
                  id={key}
                  className={inputClass}
                  type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                  value={form[key]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  required
                />
              </div>
            ))}
            <div>
              <label className={labelClass} htmlFor="contact-project">
                Link to Project
              </label>
              <select
                id="contact-project"
                className={inputClass}
                value={form.projectId}
                onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="interactive-lift focus-ring min-h-11 w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90">
              Save Contact
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

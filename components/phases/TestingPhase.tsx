"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bug, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import { cn, SEVERITY_CONFIG } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { FindingSeverity, FindingStatus, TestingFinding } from "@/types";

const severities: FindingSeverity[] = ["critical", "major", "minor", "observation"];
const statuses: FindingStatus[] = ["open", "fixed", "wont-fix"];
const severityOrder: Record<FindingSeverity, number> = { critical: 0, major: 1, minor: 2, observation: 3 };
const statusStyles: Record<FindingStatus, string> = {
  open: "bg-gold-d text-gold",
  fixed: "bg-mint-d text-mint",
  "wont-fix": "bg-surface text-t2",
};
const inputClass =
  "focus-ring min-h-10 w-full rounded-md border border-border-s bg-card px-3 py-2 text-sm text-t1 outline-none placeholder:text-t3 focus:border-accent/60";

export function TestingPhase({ projectId }: { projectId: string }) {
  const project = useStore((state) => state.getProject(projectId));
  const addFinding = useStore((state) => state.addFinding);
  const updateFinding = useStore((state) => state.updateFinding);
  const deleteFinding = useStore((state) => state.deleteFinding);
  const markPhaseComplete = useStore((state) => state.markPhaseComplete);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    severity: "major" as FindingSeverity,
    description: "",
    recommendation: "",
  });

  const findings = useMemo(
    () => [...(project?.testingFindings ?? [])].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]),
    [project?.testingFindings]
  );

  if (!project) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;
    addFinding(projectId, {
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
      recommendation: form.recommendation.trim(),
      status: "open",
    });
    setForm({ title: "", severity: "major", description: "", recommendation: "" });
    setShowAddForm(false);
  }

  return (
    <section>
      <PhaseHeader phaseId={8} onComplete={() => markPhaseComplete(projectId, 8)} />
      <div className="mb-4 flex flex-wrap gap-2">
        {severities.map((severity) => {
          const config = SEVERITY_CONFIG[severity];
          const count = findings.filter((finding) => finding.severity === severity).length;
          return (
            <span key={severity} className={cn("rounded-full px-3 py-1 text-xs", config.bg, config.color)}>
              {config.label}: {count}
            </span>
          );
        })}
      </div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-t1">Findings Logger</h3>
          <p className="mt-1 text-sm text-t2">Capture usability issues and track fixes.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="interactive-lift focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
        >
          <Plus size={15} aria-hidden="true" />
          Add Finding
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={submit} className="studio-panel mb-5 grid gap-4 rounded-xl border border-border bg-surface p-4 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-t2">Title</label>
            <input className={inputClass} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-t2">Severity</label>
            <select className={inputClass} value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value as FindingSeverity }))}>
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {SEVERITY_CONFIG[severity].label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-t2">Description</label>
            <textarea className={`${inputClass} min-h-24`} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-t2">Recommendation</label>
            <textarea className={`${inputClass} min-h-20`} value={form.recommendation} onChange={(event) => setForm((current) => ({ ...current, recommendation: event.target.value }))} />
          </div>
          <div className="flex gap-2 lg:col-span-2">
            <button type="submit" className="interactive-lift focus-ring min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90">
              Save
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="interactive-lift focus-ring min-h-11 rounded-md border border-border bg-card px-4 py-2 text-sm text-t2 hover:text-t1">
              Cancel
            </button>
          </div>
        </form>
      )}

      {findings.length ? (
        <div className="space-y-3">
          {findings.map((finding) => (
            <FindingRow
              key={finding.id}
              finding={finding}
              expanded={expandedFindingId === finding.id}
              onToggle={() => setExpandedFindingId((current) => (current === finding.id ? null : finding.id))}
              onStatus={(status) => updateFinding(projectId, finding.id, { status })}
              onDelete={() => deleteFinding(projectId, finding.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bug}
          title="No findings logged yet"
          message="Start your usability test and log issues as you observe them."
          action={{ label: "Add Finding", onClick: () => setShowAddForm(true) }}
        />
      )}
    </section>
  );
}

function FindingRow({
  finding,
  expanded,
  onToggle,
  onStatus,
  onDelete,
}: {
  finding: TestingFinding;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (status: FindingStatus) => void;
  onDelete: () => void;
}) {
  const severity = SEVERITY_CONFIG[finding.severity];
  return (
    <article className="interactive-lift rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("rounded-full px-3 py-1 text-xs", severity.bg, severity.color)}>{severity.label}</span>
            <h4 className="font-display text-sm font-semibold text-t1">{finding.title}</h4>
          </div>
        </button>
        <select
          value={finding.status}
          onChange={(event) => onStatus(event.target.value as FindingStatus)}
          className={cn("min-h-9 rounded-md border border-border bg-surface px-3 text-xs outline-none", statusStyles[finding.status])}
          aria-label={`Status for ${finding.title}`}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button type="button" onClick={onDelete} className="interactive-lift focus-ring rounded-md p-2 text-pink hover:bg-pink-d" aria-label={`Delete ${finding.title}`}>
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>
      {expanded && (
        <div className="mt-4 rounded-lg bg-surface p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-t2">Description</p>
          <p className="mt-2 text-sm leading-relaxed text-t1">{finding.description || "No description added."}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-t2">Recommendation</p>
          <p className="mt-2 text-sm leading-relaxed text-mint">{finding.recommendation || "No recommendation added."}</p>
        </div>
      )}
    </article>
  );
}

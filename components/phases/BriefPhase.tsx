"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { ProjectBrief, QuestionCategory } from "@/types";

const briefFields: { key: keyof ProjectBrief; label: string; full?: boolean }[] = [
  { key: "problem", label: "Problem Statement", full: true },
  { key: "goal", label: "Project Goal", full: true },
  { key: "targetUsers", label: "Target Users" },
  { key: "constraints", label: "Constraints", full: true },
  { key: "successMetrics", label: "Success Metrics", full: true },
  { key: "businessContext", label: "Business Context", full: true },
];

const categories: QuestionCategory[] = ["Discovery", "Pain Points", "Behavior", "Goals"];

export function BriefPhase({ projectId }: { projectId: string }) {
  const project = useStore((s) => s.getProject(projectId));
  const updateBrief = useStore((s) => s.updateBrief);
  const addQuestion = useStore((s) => s.addQuestion);
  const deleteQuestion = useStore((s) => s.deleteQuestion);
  const markPhaseComplete = useStore((s) => s.markPhaseComplete);
  const [draft, setDraft] = useState<ProjectBrief | null>(project?.brief ?? null);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<QuestionCategory>("Discovery");
  const [showForm, setShowForm] = useState(false);

  if (!project || !draft) return null;

  function submitQuestion() {
    if (!question.trim()) return;
    addQuestion(projectId, question.trim(), category);
    setQuestion("");
    setCategory("Discovery");
    setShowForm(false);
  }

  return (
    <section>
      <PhaseHeader phaseId={1} onComplete={() => markPhaseComplete(projectId, 1)} />

      <div className="grid gap-4 lg:grid-cols-2">
        {briefFields.map((field) => (
          <div key={field.key} className={cn("rounded-lg border border-border bg-surface p-4 shadow-sm", field.full && "lg:col-span-2")}>
            <label className="mb-2 block font-mono text-[9px] uppercase tracking-wider text-t2" htmlFor={field.key}>
              {field.label}
            </label>
            <textarea
              id={field.key}
              rows={2}
              value={draft[field.key]}
              onChange={(event) => setDraft((current) => current && { ...current, [field.key]: event.target.value })}
              onBlur={() => updateBrief(projectId, { [field.key]: draft[field.key] })}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-t1 outline-none placeholder:text-t3"
              placeholder={`Write the ${field.label.toLowerCase()}...`}
            />
          </div>
        ))}
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-t2">Category</p>
          <p className="text-sm text-t1">{project.category}</p>
        </div>
      </div>

      <div className="studio-panel mt-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-[15px] font-semibold text-t1">User Interview Questions</h3>
            <p className="mt-0.5 text-xs text-t2">Create questions before moving into research.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="interactive-lift focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-accent/30 bg-accent-d px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-white"
          >
            <Plus size={14} aria-hidden="true" />
            Add Question
          </button>
        </div>

        {showForm && (
          <div className="mb-4 grid gap-3 rounded-lg border border-border bg-surface p-3 md:grid-cols-[1fr_160px_auto]">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="focus-ring min-h-11 rounded-md border border-border-s bg-card px-3 py-2 text-sm text-t1 outline-none placeholder:text-t3 focus:border-accent/60"
              placeholder="What problem are you trying to solve today?"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as QuestionCategory)}
              aria-label="Question category"
              className="focus-ring min-h-11 rounded-md border border-border-s bg-card px-3 py-2 text-sm text-t1 outline-none focus:border-accent/60"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button type="button" onClick={submitQuestion} className="interactive-lift focus-ring min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90">
              Save
            </button>
          </div>
        )}

        {project.interviewQuestions.length ? (
          <div className="divide-y divide-border">
            {project.interviewQuestions.map((item, index) => (
              <div key={item.id} className="group flex items-center gap-3 py-3">
                <span className="font-mono text-[11px] text-accent">{String(index + 1).padStart(2, "0")}</span>
                <p className="min-w-0 flex-1 text-sm text-t1">{item.question}</p>
                <Badge text={item.category} className="hidden sm:inline-flex" />
                <button
                  type="button"
                  onClick={() => deleteQuestion(projectId, item.id)}
                  className="rounded-md p-2 text-t3 opacity-100 transition-colors hover:bg-pink-d hover:text-pink sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Delete question ${index + 1}`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No interview questions yet"
            message="Add your first question to prepare for discovery interviews."
            action={{ label: "Add Question", onClick: () => setShowForm(true) }}
          />
        )}
      </div>
    </section>
  );
}

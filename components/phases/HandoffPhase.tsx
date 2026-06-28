"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import { formatDate } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export function HandoffPhase({ projectId }: { projectId: string }) {
  const project = useStore((s) => s.getProject(projectId));
  const updateHandoffNotes = useStore((s) => s.updateHandoffNotes);
  const markPhaseComplete = useStore((s) => s.markPhaseComplete);
  const [notes, setNotes] = useState(project?.handoffNotes ?? "");

  if (!project) return null;

  const complete = project.status === "Complete";
  const noteLength = notes.trim().length;
  const quality =
    noteLength < 100
      ? { label: "Thin", color: "bg-pink", text: "text-pink" }
      : noteLength <= 300
        ? { label: "Adequate", color: "bg-gold", text: "text-gold" }
        : { label: "Rich", color: "bg-mint", text: "text-mint" };
  const countClass = noteLength > 400 ? "text-mint" : noteLength < 200 ? "text-gold" : "text-t3";

  return (
    <section>
      <PhaseHeader phaseId={9} onComplete={() => markPhaseComplete(projectId, 9)} />

      <div className="studio-panel rounded-xl border border-border bg-card p-4">
        <label className="mb-1 block font-display text-sm font-semibold text-t1" htmlFor="handoff-notes">
          Project Notes for AI Case Study
        </label>
        <p className="mb-3 text-xs leading-relaxed text-t2">
          Write what you did, what worked, what did not, and what changed. The AI reads this to generate your case study.
        </p>
        <textarea
          id="handoff-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={() => updateHandoffNotes(projectId, notes)}
          className="focus-ring min-h-[220px] w-full resize-y rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-t1 outline-none placeholder:text-t3 focus:border-accent/60"
          placeholder={"- What design decisions did you make?\n- What was changed during the project?\n- What did not work and why?\n- What were the key challenges?\n- What was the outcome?"}
        />
        <div className="mt-3 flex flex-col gap-3">
          <div className="text-right">
            <p className={`font-mono text-[11px] ${countClass}`}>{noteLength} characters</p>
            <p className="mt-1 text-xs text-t2">The AI reads this directly. More detail = better case study.</p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider text-t2">Context Quality</p>
              <p className={`text-xs font-medium ${quality.text}`}>{quality.label}</p>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {["Thin", "Adequate", "Rich"].map((segment) => (
                <span
                  key={segment}
                  className={`h-1.5 rounded-full ${
                    quality.label === segment ? quality.color : "bg-surface"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        {complete ? (
          <Link
            href={`/ai-studio?projectId=${project.id}`}
            className="interactive-lift focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-display text-sm font-semibold text-white hover:bg-accent/90"
          >
            <Sparkles size={16} aria-hidden="true" />
            Generate Case Study in AI Studio
          </Link>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <button
              type="button"
              disabled
            className="min-h-12 w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3 font-display text-sm font-semibold text-t3"
            >
              Generate Case Study in AI Studio
            </button>
            <p className="mt-3 text-xs text-t2">Mark all phases complete to generate your case study.</p>
          </div>
        )}
      </div>

      {project.caseStudy && (
        <div className="mt-5 rounded-xl border border-mint/20 bg-mint-d p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-mint">AI Case Study Ready</p>
          <div className="mt-3 max-h-[360px] overflow-auto rounded-lg border border-mint/20 bg-bg/40 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-t1">{project.caseStudy}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Link href={`/ai-studio?projectId=${project.id}`} className="text-sm font-semibold text-mint transition-colors hover:text-mint/80">
              View Full Case Study
            </Link>
            {project.caseStudyGeneratedAt && (
              <span className="font-mono text-[10px] text-t2">Generated {formatDate(project.caseStudyGeneratedAt)}</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

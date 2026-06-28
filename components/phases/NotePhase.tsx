"use client";

import { useState } from "react";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import { useStore } from "@/store/useStore";
import type { PhaseId } from "@/types";

const textareaClass =
  "focus-ring min-h-[240px] w-full resize-y rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-t1 outline-none placeholder:text-t3 focus:border-accent/60";

const prompts: Record<PhaseId, string> = {
  1: "",
  2: "",
  3: "Capture sitemap decisions, navigation hierarchy, page grouping, labels, and what content belongs where.",
  4: "Map user flow steps, entry points, edge cases, decisions, and where users may drop off.",
  5: "",
  6: "Document screen decisions, visual hierarchy, component states, feedback from review, and UI changes.",
  7: "Track prototype link, interaction notes, transitions, missing states, and what needs to be validated.",
  8: "List test findings, participant notes, severity, what changed, and what still needs a design decision.",
  9: "",
};

export function NotePhase({ projectId, phaseId }: { projectId: string; phaseId: PhaseId }) {
  const project = useStore((s) => s.getProject(projectId));
  const updatePhaseNote = useStore((s) => s.updatePhaseNote);
  const markPhaseComplete = useStore((s) => s.markPhaseComplete);
  const existing = project?.phaseNotes.find((note) => note.phaseId === phaseId)?.content ?? "";
  const [content, setContent] = useState(existing);

  if (!project) return null;

  return (
    <section>
      <PhaseHeader phaseId={phaseId} onComplete={() => markPhaseComplete(projectId, phaseId)} />
      <div className="studio-panel rounded-xl border border-border bg-card p-4">
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-t2" htmlFor={`phase-${phaseId}`}>
          Working Notes
        </label>
        <textarea
          id={`phase-${phaseId}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onBlur={() => updatePhaseNote(projectId, phaseId, content)}
          placeholder={prompts[phaseId]}
          className={textareaClass}
        />
        <p className="mt-3 text-xs text-t2">Auto-saves on blur. Keep notes specific so AI Studio can write a better case study later.</p>
      </div>
    </section>
  );
}

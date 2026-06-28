"use client";

import { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import { useStore } from "@/store/useStore";

export function PrototypePhase({ projectId }: { projectId: string }) {
  const project = useStore((state) => state.getProject(projectId));
  const updatePrototype = useStore((state) => state.updatePrototype);
  const markPhaseComplete = useStore((state) => state.markPhaseComplete);
  const [link, setLink] = useState(project?.prototypeLink ?? "");
  const [notes, setNotes] = useState(project?.prototypeNotes ?? "");

  if (!project) return null;

  const hasLink = link.trim().length > 0;

  return (
    <section>
      <PhaseHeader phaseId={7} onComplete={() => markPhaseComplete(projectId, 7)} />
      <div className="space-y-5">
        <section className="studio-panel rounded-xl border border-border bg-card p-4">
          <label className="block font-display text-sm font-semibold text-t1" htmlFor="prototype-url">
            Prototype URL
          </label>
          <p className="mt-1 text-xs text-t2">Paste your Figma, InVision, Framer, or any prototype link here.</p>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border-s bg-surface px-4 py-3">
            <Globe size={18} className="shrink-0 text-accent" aria-hidden="true" />
            <input
              id="prototype-url"
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              onBlur={() => updatePrototype(projectId, { prototypeLink: link })}
              className="min-h-10 flex-1 bg-transparent text-sm text-t1 outline-none placeholder:text-t3"
              placeholder="https://www.figma.com/proto/..."
            />
            <a
              href={hasLink ? link : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!hasLink}
              className={`interactive-lift focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium ${
                hasLink ? "bg-accent text-white hover:bg-accent/90" : "cursor-not-allowed bg-card text-t3"
              }`}
            >
              Open
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
          {hasLink && (
            <div className="mt-4 rounded-xl border border-accent/30 bg-accent-d p-4">
              <p className="font-display text-sm font-semibold text-accent">Prototype linked</p>
              <p className="mt-1 truncate text-xs text-t2">{link}</p>
              <a href={link} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-accent transition-colors hover:text-accent/80">
                Open Prototype
              </a>
            </div>
          )}
        </section>

        <section className="studio-panel rounded-xl border border-border bg-card p-4">
          <label className="block font-display text-sm font-semibold text-t1" htmlFor="prototype-notes">
            Interaction Notes
          </label>
          <p className="mt-1 text-xs text-t2">Document hover states, transitions, micro-interactions, and animation specs.</p>
          <textarea
            id="prototype-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={() => updatePrototype(projectId, { prototypeNotes: notes })}
            className="focus-ring mt-3 min-h-[180px] w-full resize-y rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-t1 outline-none placeholder:text-t3 focus:border-accent/60"
            placeholder={"- Button states: hover, active, disabled\n- Page transitions: ...\n- Loading states: ...\n- Error states: ...\n- Micro-interactions: ..."}
          />
        </section>
      </div>
    </section>
  );
}

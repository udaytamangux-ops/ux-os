"use client";

import { Check } from "lucide-react";
import { getPhase, padPhase } from "@/lib/utils";
import type { PhaseId } from "@/types";

export function PhaseHeader({
  phaseId,
  onComplete,
}: {
  phaseId: PhaseId;
  onComplete: () => void;
}) {
  const phase = getPhase(phaseId);
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-t2">
          {padPhase(phaseId)} - {phase.short}
        </p>
        <h2 className="font-display text-xl font-semibold text-t1">{phase.name}</h2>
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="interactive-lift focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-accent/30 bg-accent-d px-4 py-2 font-display text-sm font-semibold text-accent hover:bg-accent hover:text-white"
      >
        <Check size={14} aria-hidden="true" />
        Mark Phase Complete
      </button>
    </div>
  );
}

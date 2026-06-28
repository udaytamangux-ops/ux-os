import type { PhaseId } from "@/types";
import { getPhase, padPhase } from "@/lib/utils";

export function PhaseTag({ phaseId }: { phaseId: PhaseId }) {
  const phase = getPhase(phaseId);

  return (
    <span className="rounded bg-accent-d px-2 py-0.5 font-mono text-[10px] text-accent">
      {padPhase(phaseId)} / {phase.short}
    </span>
  );
}

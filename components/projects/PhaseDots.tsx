import { cn } from "@/lib/utils";
import type { PhaseId } from "@/types";

const phases = [1, 2, 3, 4, 5, 6, 7, 8, 9] as PhaseId[];

export function PhaseDots({
  completedPhases,
  currentPhase,
}: {
  completedPhases: PhaseId[];
  currentPhase: PhaseId;
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${completedPhases.length} of 9 phases complete`}>
      {phases.map((phase) => (
        <span
          key={phase}
          className={cn(
            "h-1.5 flex-1 rounded-full bg-t3",
            completedPhases.includes(phase) && "bg-mint",
            currentPhase === phase && !completedPhases.includes(phase) && "bg-accent"
          )}
        />
      ))}
    </div>
  );
}

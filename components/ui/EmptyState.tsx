import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-play graph-paper flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/80 px-6 py-12 text-center">
      <div className="empty-play-icon mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 bg-accent-d">
        <Icon size={22} className="text-accent" />
      </div>
      <p className="mb-1 text-sm font-semibold text-t1">{title}</p>
      {message && <p className="mb-4 max-w-xs text-xs leading-relaxed text-t2">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="interactive-lift focus-ring rounded-md border border-accent/30 bg-accent-d px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-white"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

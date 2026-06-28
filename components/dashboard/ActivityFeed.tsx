import { Activity, Bot, CheckCircle2, FolderPlus, Upload } from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const icons = {
  phase: CheckCircle2,
  upload: Upload,
  ai: Bot,
  project: FolderPlus,
  complete: CheckCircle2,
};

const colors = {
  phase: "bg-accent",
  upload: "bg-gold",
  ai: "bg-pink",
  project: "bg-mint",
  complete: "bg-mint",
};

export function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  const items = activity.slice(0, 8);

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <Activity size={22} className="mx-auto mb-3 text-t2" aria-hidden="true" />
        <p className="font-display text-sm font-semibold text-t1">No activity yet</p>
        <p className="mt-1 text-xs text-t2">Project updates will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const Icon = icons[item.type];
        return (
          <div key={item.id} className="flex gap-3">
            <div className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-card">
              <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${colors[item.type]}`} />
              <Icon size={14} className="text-t2" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-snug text-t1">{item.text}</p>
              <p className="mt-1 font-mono text-[10px] text-t2">{relativeTime(item.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

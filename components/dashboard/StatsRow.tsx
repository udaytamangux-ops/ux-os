import { BadgeCheck, FileText, FolderKanban, Timer } from "lucide-react";
import type { Project } from "@/types";

const cardClass = "anime-card interactive-lift rounded-lg border border-border bg-card p-4";

export function StatsRow({ projects }: { projects: Project[] }) {
  const stats = [
    { label: "Total Projects", value: projects.length, sub: "All client workspaces", icon: FolderKanban, color: "text-t1" },
    {
      label: "In Progress",
      value: projects.filter((p) => p.status === "In Progress").length,
      sub: "Needs next action",
      icon: Timer,
      color: "text-gold",
    },
    {
      label: "Completed",
      value: projects.filter((p) => p.status === "Complete").length,
      sub: "Ready for archive",
      icon: BadgeCheck,
      color: "text-mint",
    },
    {
      label: "Case Studies",
      value: projects.filter((p) => p.caseStudy !== null).length,
      sub: "Generated stories",
      icon: FileText,
      color: "text-accent",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider text-t2">{stat.label}</p>
              <Icon size={16} className={stat.color} aria-hidden="true" />
            </div>
            <p className={`text-2xl font-semibold tabular-nums ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-[11px] text-t2">{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DataMigration } from "@/components/dashboard/DataMigration";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { hasSampleProjectSeeded, markSampleProjectSeeded } from "@/lib/sampleProjectSeed";
import { useHydrated } from "@/lib/useHydrated";
import { cn, formatDate } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export default function DashboardPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [completedOpen, setCompletedOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ux-os-completed-open") === "true";
  });
  const projects = useStore((s) => s.projects);
  const activity = useStore((s) => s.activity);
  const isHydrated = useStore((s) => s.isHydrated);
  const addProject = useStore((s) => s.addProject);
  const updateBrief = useStore((s) => s.updateBrief);
  const today = useMemo(() => formatDate(new Date().toISOString()), []);
  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((project) => project.category)))], [projects]);
  const filteredProjects = useMemo(
    () => (categoryFilter === "All" ? projects : projects.filter((project) => project.category === categoryFilter)),
    [categoryFilter, projects]
  );
  const completedProjects = filteredProjects.filter((project) => project.status === "Complete");

  useEffect(() => {
    if (!hydrated || !isHydrated || projects.length === 0) return;
    markSampleProjectSeeded();
  }, [hydrated, isHydrated, projects.length]);

  useEffect(() => {
    // Only seed after the cloud data has finished loading and is genuinely empty,
    // otherwise we'd create a sample project during the async DB load.
    if (!hydrated || !isHydrated || projects.length > 0) return;
    if (hasSampleProjectSeeded()) return;
    markSampleProjectSeeded();
    const exampleProject = addProject({
      name: "Medvet Pharma Website",
      client: "Medvet Pharma Pvt. Ltd.",
      category: "Healthcare",
      priority: "High",
    });
    updateBrief(exampleProject.id, {
      problem: "Medvet lacks a professional digital presence. Vets and farmers cannot find product info online.",
      goal: "Build a trustworthy, conversion-focused website for veterinary professionals and distributors.",
      targetUsers: "Veterinarians, livestock farmers, distributors",
      constraints: "Must work in low-bandwidth areas. Content in English and Nepali.",
      successMetrics: "Inquiry form submissions up 40%, bounce rate below 50%",
      businessContext: "Medvet is a growing veterinary pharmaceutical company in Nepal with no current web presence.",
    });
  }, [addProject, hydrated, isHydrated, projects.length, updateBrief]);

  if (!hydrated) {
    return (
      <div className="px-5 py-6 lg:px-7">
        <div className="h-8 w-56 animate-pulse rounded bg-card" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 lg:px-7">
      <div className="anime-hero studio-panel mb-6 rounded-xl border border-border bg-surface/95 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent">{today}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-t1">Good morning, SB</h1>
            <p className="mt-1 text-sm text-t2">Choose the project that needs the next design decision.</p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="interactive-lift focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
          >
            <Plus size={16} aria-hidden="true" />
            New Project
          </button>
        </div>
      </div>

      <DataMigration />

      <StatsRow projects={projects} />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <SectionHeader title="Active Projects" subtitle="Open work that still needs movement." />
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Filter projects by category">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={cn(
                    "min-h-9 whitespace-nowrap rounded-md border px-3 text-xs font-medium transition-colors",
                    categoryFilter === category
                      ? "border-accent/40 bg-accent-d text-accent"
                      : "interactive-lift border-border bg-card text-t2 hover:border-border-s hover:text-t1"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <ActiveProjects projects={filteredProjects} onCreate={() => setModalOpen(true)} />

          <div className="anime-card studio-panel mt-6 rounded-xl border border-border bg-surface/95">
            <button
              type="button"
              onClick={() =>
                setCompletedOpen((open) => {
                  window.localStorage.setItem("ux-os-completed-open", String(!open));
                  return !open;
                })
              }
              className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-t1">Completed Projects</p>
                <p className="mt-0.5 text-xs text-t2">{completedProjects.length} archived for case study work.</p>
              </div>
              <ChevronDown
                size={17}
                className={cn("shrink-0 text-t2 transition-transform", completedOpen ? "rotate-180" : "")}
                aria-hidden="true"
              />
            </button>
            {completedOpen && (
              <div className="border-t border-border p-4">
                {completedProjects.length ? (
                  completedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} onClick={() => router.push(`/projects/${project.id}`)} />
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-t2">
                    No completed projects match this filter.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
        <aside className="anime-card studio-panel rounded-xl border border-border bg-surface/95 p-4">
          <SectionHeader title="Recent Activity" subtitle="Last saved actions." />
          <ActivityFeed activity={activity} />
        </aside>
      </div>

      <NewProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Edit3,
  Globe,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { PhaseNav } from "@/components/layout/PhaseNav";
import { BriefPhase } from "@/components/phases/BriefPhase";
import { FlowPhase } from "@/components/phases/FlowPhase";
import { HandoffPhase } from "@/components/phases/HandoffPhase";
import { IAPhase } from "@/components/phases/IAPhase";
import { PrototypePhase } from "@/components/phases/PrototypePhase";
import { ResearchPhase } from "@/components/phases/ResearchPhase";
import { TestingPhase } from "@/components/phases/TestingPhase";
import { UIDesignPhase } from "@/components/phases/UIDesignPhase";
import { WireframePhase } from "@/components/phases/WireframePhase";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { EditProjectModal } from "@/components/projects/EditProjectModal";
import { useDeleteProjectWithToast } from "@/components/projects/useDeleteProjectWithToast";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { markSampleProjectSeeded } from "@/lib/sampleProjectSeed";
import { useHydrated } from "@/lib/useHydrated";
import { generateSlug } from "@/lib/supabase/db";
import { getCompletionPercent } from "@/lib/utils";
import type { PhaseId } from "@/types";
import { useStore } from "@/store/useStore";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const project = useStore((s) => s.getProject(params.id));
  const markPhaseComplete = useStore((s) => s.markPhaseComplete);
  const updateProject = useStore((s) => s.updateProject);
  const deleteProjectWithToast = useDeleteProjectWithToast();
  const archiveProject = useStore((s) => s.archiveProject);
  const unarchiveProject = useStore((s) => s.unarchiveProject);
  const setPortfolioPublic = useStore((s) => s.setPortfolioPublic);
  const [manualPhase, setManualPhase] = useState<PhaseId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const selectedPhase = manualPhase ?? project?.currentPhase ?? 1;

  useEffect(() => {
    if (!hydrated || !project) return;
    markSampleProjectSeeded();
  }, [hydrated, project]);

  if (!hydrated) {
    return (
      <div className="px-5 py-6 lg:px-7">
        <div className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
        <div className="mt-6 h-96 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5">
        <div className="studio-panel max-w-md rounded-xl border border-border bg-surface p-6 text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-pink" aria-hidden="true" />
          <h1 className="font-display text-xl font-semibold text-t1">Project not found</h1>
          <p className="mt-2 text-sm text-t2">This project may have been deleted or the URL is incorrect.</p>
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="interactive-lift focus-ring mt-5 min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const currentProject = project;
  const completion = getCompletionPercent(currentProject.completedPhases);

  function markComplete() {
    ([1, 2, 3, 4, 5, 6, 7, 8, 9] as PhaseId[]).forEach((phaseId) => {
      markPhaseComplete(currentProject.id, phaseId);
    });
    updateProject(currentProject.id, {
      status: "Complete",
      currentPhase: 9,
      completedPhases: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    });
    setMenuOpen(false);
  }

  async function deleteProject() {
    await deleteProjectWithToast(currentProject);
    router.push("/projects");
  }

  function toggleArchive() {
    if (currentProject.isArchived) {
      unarchiveProject(currentProject.id);
    } else {
      archiveProject(currentProject.id);
      router.push("/projects");
    }
    setMenuOpen(false);
  }

  function togglePortfolio() {
    if (currentProject.isPortfolioPublic) {
      setPortfolioPublic(currentProject.id, false, currentProject.portfolioSlug);
    } else {
      const slug = currentProject.portfolioSlug ?? generateSlug(currentProject.name);
      setPortfolioPublic(currentProject.id, true, slug);
      setPortfolioOpen(true);
    }
    setMenuOpen(false);
  }

  const portfolioUrl =
    currentProject.portfolioSlug && typeof window !== "undefined"
      ? `${window.location.origin}/portfolio/${currentProject.portfolioSlug}`
      : "";

  async function copyPortfolioUrl() {
    if (!portfolioUrl) return;
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy portfolio URL", error);
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur lg:px-7">
        <button
          type="button"
          onClick={() => router.push("/projects")}
          className="interactive-lift focus-ring mb-3 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs text-t2 hover:bg-card hover:text-t1"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Projects
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-semibold text-t1">{project.name}</h1>
            <p className="mt-1 text-sm text-t2">{project.client}</p>
            <div className="mt-3 flex max-w-md items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-card shadow-inner">
                <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${completion}%` }} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-t2">{completion}% complete</span>
            </div>
          </div>
          <div className="relative flex flex-wrap items-center gap-2">
            <Badge text={project.status} />
            <Badge text={project.priority} />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="interactive-lift focus-ring inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-border bg-card text-t2 hover:border-border-s hover:text-t1"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal size={17} aria-hidden="true" />
              <span className="sr-only">Project actions</span>
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="studio-panel absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-lg border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm text-t1 transition-colors hover:bg-surface"
                >
                  <Edit3 size={15} aria-hidden="true" />
                  Edit project
                </button>
                <button
                  type="button"
                  onClick={markComplete}
                  className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm text-t1 transition-colors hover:bg-surface"
                >
                  <CheckCircle2 size={15} aria-hidden="true" />
                  Mark complete
                </button>
                <button
                  type="button"
                  onClick={togglePortfolio}
                  className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm text-t1 transition-colors hover:bg-surface"
                >
                  <Globe size={15} aria-hidden="true" />
                  {project.isPortfolioPublic ? "Unpublish portfolio" : "Publish to portfolio"}
                </button>
                {project.isPortfolioPublic && (
                  <button
                    type="button"
                    onClick={() => {
                      setPortfolioOpen(true);
                      setMenuOpen(false);
                    }}
                    className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm text-t1 transition-colors hover:bg-surface"
                  >
                    <Copy size={15} aria-hidden="true" />
                    Copy public link
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleArchive}
                  className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm text-t1 transition-colors hover:bg-surface"
                >
                  {project.isArchived ? (
                    <ArchiveRestore size={15} aria-hidden="true" />
                  ) : (
                    <Archive size={15} aria-hidden="true" />
                  )}
                  {project.isArchived ? "Unarchive project" : "Archive project"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm font-medium text-pink transition-colors hover:bg-pink-d"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  Delete project
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <PhaseNav project={project} currentPhase={selectedPhase} onPhaseSelect={setManualPhase} />
      <div className="flex-1 overflow-auto px-5 py-6 lg:px-7">
        {selectedPhase === 1 && <BriefPhase projectId={project.id} />}
        {selectedPhase === 2 && <ResearchPhase projectId={project.id} />}
        {selectedPhase === 3 && <IAPhase projectId={project.id} />}
        {selectedPhase === 4 && <FlowPhase projectId={project.id} />}
        {selectedPhase === 5 && <WireframePhase projectId={project.id} />}
        {selectedPhase === 6 && <UIDesignPhase projectId={project.id} />}
        {selectedPhase === 7 && <PrototypePhase projectId={project.id} />}
        {selectedPhase === 8 && <TestingPhase projectId={project.id} />}
        {selectedPhase === 9 && <HandoffPhase projectId={project.id} />}
      </div>

      {editOpen && <EditProjectModal project={project} open={editOpen} onOpenChange={setEditOpen} />}

      <Dialog open={portfolioOpen} onOpenChange={setPortfolioOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Public portfolio link</DialogTitle>
            <DialogDescription>
              Anyone with this link can view the case study — no login required.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
            <input
              readOnly
              value={portfolioUrl}
              aria-label="Public portfolio URL"
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-t1 outline-none"
            />
            <button
              type="button"
              onClick={copyPortfolioUrl}
              className="interactive-lift focus-ring inline-flex min-h-9 items-center gap-2 rounded-md bg-accent px-3 text-xs font-semibold text-white hover:bg-accent/90"
            >
              <Copy size={13} aria-hidden="true" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <a
              href={portfolioUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-accent hover:text-accent/80"
            >
              Open in new tab →
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteProjectDialog project={project} open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={deleteProject} />
    </div>
  );
}

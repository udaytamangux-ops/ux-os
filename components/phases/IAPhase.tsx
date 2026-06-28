"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Plus, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import {
  addChildToNode,
  cn,
  createSitemapNode,
  NODE_TYPE_CONFIG,
  removeNodeFromTree,
  updateNodeInTree,
} from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { NodeType, SitemapNode } from "@/types";

// reactflow needs the browser — load the nav-map builder client-side only.
const NavMapBuilder = dynamic(() => import("@/components/phases/NavMapBuilder"), {
  ssr: false,
  loading: () => <div className="h-[520px] animate-pulse rounded-xl border border-border bg-card" />,
});

const nodeTypes: NodeType[] = ["page", "section", "modal", "external", "component"];

export function IAPhase({ projectId }: { projectId: string }) {
  const project = useStore((state) => state.getProject(projectId));
  const updateSitemap = useStore((state) => state.updateSitemap);
  const updateIANotes = useStore((state) => state.updateIANotes);
  const updateNavMap = useStore((state) => state.updateNavMap);
  const markPhaseComplete = useStore((state) => state.markPhaseComplete);
  const [activeTab, setActiveTab] = useState<"sitemap" | "navmap">("sitemap");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [notes, setNotes] = useState(project?.iaNotes ?? "");
  const [exporting, setExporting] = useState(false);
  const sitemapRef = useRef<HTMLDivElement>(null);

  async function exportPNG() {
    if (!sitemapRef.current || !project) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(sitemapRef.current, {
        backgroundColor: "#F3F6FB",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${project.name || "project"}-sitemap.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Sitemap PNG export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    if (project && !project.sitemap) {
      updateSitemap(projectId, { id: "root", name: "Home", type: "page", notes: "", children: [] });
    }
  }, [project, projectId, updateSitemap]);

  if (!project) return null;

  const sitemap = project.sitemap ?? { id: "root", name: "Home", type: "page" as const, notes: "", children: [] };

  function saveTree(nextTree: SitemapNode) {
    updateSitemap(projectId, nextTree);
  }

  function addChild(parentId: string) {
    saveTree(addChildToNode(sitemap, parentId, createSitemapNode("New page")));
  }

  function updateNode(nodeId: string, updater: (node: SitemapNode) => SitemapNode) {
    saveTree(updateNodeInTree(sitemap, nodeId, updater));
  }

  function deleteNode(nodeId: string) {
    if (nodeId === "root") return;
    saveTree(removeNodeFromTree(sitemap, nodeId));
  }

  return (
    <section>
      <PhaseHeader phaseId={3} onComplete={() => markPhaseComplete(projectId, 3)} />

      {/* Tab switcher */}
      <div className="mb-6 flex w-fit gap-1 rounded-lg border border-border bg-surface p-1">
        {(["sitemap", "navmap"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "focus-ring rounded-md px-4 py-2 text-[12px] font-medium transition-colors",
              activeTab === tab
                ? "bg-accent-d text-accent shadow-[3px_3px_0_rgba(60,96,156,0.12)]"
                : "text-t2 hover:bg-card hover:text-t1"
            )}
          >
            {tab === "sitemap" ? "Sitemap" : "Navigation Map"}
          </button>
        ))}
      </div>

      {activeTab === "sitemap" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="studio-panel overflow-x-auto rounded-xl border border-border bg-surface p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold text-t1">Visual Sitemap</h3>
                <p className="mt-1 text-sm text-t2">Map pages, sections, modals, external links, and reusable components.</p>
              </div>
              <button
                type="button"
                onClick={exportPNG}
                disabled={exporting}
                className="interactive-lift focus-ring inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-t1 hover:border-border-s disabled:opacity-60"
              >
                <Download size={13} aria-hidden="true" />
                {exporting ? "Exporting..." : "Export PNG"}
              </button>
            </div>
            <div ref={sitemapRef} className="rounded-xl bg-bg p-6">
              <SitemapNodeComponent
                node={sitemap}
                depth={0}
                isRoot
                editingId={editingId}
                draftName={draftName}
                setEditingId={setEditingId}
                setDraftName={setDraftName}
                onUpdate={updateNode}
                onDelete={deleteNode}
                onAddChild={addChild}
              />
            </div>
          </div>

          <aside className="studio-panel rounded-xl border border-border bg-card p-4">
            <label className="mb-2 block font-display text-sm font-semibold text-t1" htmlFor="ia-notes">
              IA Notes
            </label>
            <textarea
              id="ia-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onBlur={() => updateIANotes(projectId, notes)}
              className="focus-ring min-h-[320px] w-full resize-y rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-t1 outline-none placeholder:text-t3 focus:border-accent/60"
              placeholder="Capture navigation hierarchy, labels, page grouping, content priority, and edge cases."
            />
            <p className="mt-3 text-xs text-t2">Notes autosave on blur.</p>
          </aside>
        </div>
      )}

      {activeTab === "navmap" && (
        <div className="studio-panel rounded-xl border border-border bg-surface p-4">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-t1">Navigation Map</h3>
            <p className="mt-1 text-sm text-t2">Diagram how pages link together. Drag to arrange, connect handles to add flows.</p>
          </div>
          <NavMapBuilder
            value={project.navMap ?? { nodes: [], edges: [] }}
            onChange={(map) => updateNavMap(projectId, map)}
          />
        </div>
      )}
    </section>
  );
}

function SitemapNodeComponent({
  node,
  depth,
  isRoot,
  editingId,
  draftName,
  setEditingId,
  setDraftName,
  onUpdate,
  onDelete,
  onAddChild,
}: {
  node: SitemapNode;
  depth: number;
  isRoot?: boolean;
  editingId: string | null;
  draftName: string;
  setEditingId: (id: string | null) => void;
  setDraftName: (value: string) => void;
  onUpdate: (nodeId: string, updater: (node: SitemapNode) => SitemapNode) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (nodeId: string) => void;
}) {
  const config = NODE_TYPE_CONFIG[node.type];
  const isEditing = editingId === node.id;

  function beginEdit() {
    setDraftName(node.name);
    setEditingId(node.id);
  }

  function commitName() {
    const nextName = draftName.trim() || node.name;
    onUpdate(node.id, (current) => ({ ...current, name: nextName }));
    setEditingId(null);
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") commitName();
    if (event.key === "Escape") setEditingId(null);
  }

  return (
    <div className={cn("relative flex min-w-[260px] flex-col", depth > 0 && "ml-4 border-l border-border-s pl-5")}>
      <div className="relative">
        {depth > 0 && <span className="absolute -left-5 top-1/2 h-px w-4 bg-border-s" aria-hidden="true" />}
        <div className="interactive-lift flex max-w-[360px] items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-border-s">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", config.dot)} />
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onBlur={commitName}
                onKeyDown={keyDown}
                autoFocus
                className="focus-ring w-full rounded border border-border-s bg-surface px-2 py-1 text-sm text-t1 outline-none focus:border-accent/60"
              />
            ) : (
              <button type="button" onClick={beginEdit} className="focus-ring block truncate rounded text-left text-sm font-medium text-t1 hover:text-accent">
                {node.name}
              </button>
            )}
          </div>
          <select
            value={node.type}
            onChange={(event) => onUpdate(node.id, (current) => ({ ...current, type: event.target.value as NodeType }))}
            className="focus-ring rounded border border-border bg-surface px-1.5 py-1 text-[10px] text-t2 outline-none focus:border-accent/60"
            aria-label={`Type for ${node.name}`}
          >
            {nodeTypes.map((type) => (
              <option key={type} value={type}>
                {NODE_TYPE_CONFIG[type].label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onAddChild(node.id)}
            className="interactive-lift focus-ring rounded p-1.5 text-accent hover:bg-accent-d"
            aria-label={`Add child to ${node.name}`}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
          {!isRoot && (
            <button
              type="button"
              onClick={() => onDelete(node.id)}
              className="interactive-lift focus-ring rounded p-1.5 text-pink hover:bg-pink-d"
              aria-label={`Delete ${node.name}`}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <SitemapNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              editingId={editingId}
              draftName={draftName}
              setEditingId={setEditingId}
              setDraftName={setDraftName}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

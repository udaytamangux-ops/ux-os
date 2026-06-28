"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SearchX, Wand2 } from "lucide-react";
import { NewPromptModal } from "@/components/prompt-vault/NewPromptModal";
import { PromptCard } from "@/components/prompt-vault/PromptCard";
import { PromptDetail } from "@/components/prompt-vault/PromptDetail";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { AI_TOOLS } from "@/types";

export default function PromptVaultPage() {
  const hydrated = useHydrated();
  const promptEntries = useStore((s) => s.promptEntries);
  const deletePromptEntry = useStore((s) => s.deletePromptEntry);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const selected = promptEntries.find((e) => e.id === selectedId) ?? null;

  const toolsPresent = useMemo(
    () => AI_TOOLS.filter((tool) => promptEntries.some((e) => e.tool === tool)),
    [promptEntries]
  );

  const filtered = useMemo(() => {
    let result = promptEntries;
    if (filter === "Favorites") result = result.filter((e) => e.isFavorite);
    else if (filter !== "All") result = result.filter((e) => e.tool === filter);

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.prompt.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [promptEntries, filter, query]);

  if (!hydrated) {
    return (
      <div className="px-5 py-6 lg:px-7">
        <div className="h-8 w-48 animate-pulse rounded bg-card" />
        <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-border bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  // DETAIL VIEW
  if (selected) {
    return (
      <div className="px-5 py-6 lg:px-7">
        <PromptDetail
          entry={selected}
          onBack={() => setSelectedId(null)}
          onDelete={() => setDeleteId(selected.id)}
        />
        <DeleteDialog
          open={!!deleteId}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            if (deleteId) deletePromptEntry(deleteId);
            setDeleteId(null);
            setSelectedId(null);
          }}
        />
      </div>
    );
  }

  // GRID VIEW
  const pills = ["All", ...toolsPresent, "Favorites"];
  const totalEmpty = promptEntries.length === 0;

  return (
    <div className="px-5 py-6 lg:px-7">
      <div className="anime-hero studio-panel mb-6 rounded-xl border border-border bg-surface/95 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-t1">Prompt Vault</h1>
            <p className="mt-1 text-sm text-t2">
              {promptEntries.length} {promptEntries.length === 1 ? "prompt" : "prompts"} saved
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:w-72">
              <span className="sr-only">Search prompts</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-t3" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, prompt, tags"
                className="focus-ring min-h-11 w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-t1 outline-none placeholder:text-t3 focus:border-accent"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="interactive-lift focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
            >
              <Plus size={16} aria-hidden="true" />
              New Prompt
            </button>
          </div>
        </div>
      </div>

      {!totalEmpty && (
        <div className="mb-5 flex max-w-full flex-wrap gap-2" aria-label="Filter prompts">
          {pills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setFilter(pill)}
              className={cn(
                "min-h-9 whitespace-nowrap rounded-md border px-3 text-xs font-medium transition-colors",
                filter === pill
                  ? "border-accent/40 bg-accent-d text-accent"
                  : "interactive-lift border-border bg-card text-t2 hover:border-border-s hover:text-t1"
              )}
            >
              {pill}
            </button>
          ))}
        </div>
      )}

      {totalEmpty ? (
        <EmptyState
          icon={Wand2}
          title="Your prompt vault is empty"
          message="Save your first AI prompt to start building your library."
          action={{ label: "+ New Prompt", onClick: () => setShowNew(true) }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={query.trim() ? `No prompts match “${query.trim()}”` : `No prompts in ${filter}`}
          message="Try a different filter or search term."
        />
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
          {filtered.map((entry) => (
            <PromptCard key={entry.id} entry={entry} onClick={() => setSelectedId(entry.id)} />
          ))}
        </div>
      )}

      <NewPromptModal open={showNew} onOpenChange={setShowNew} onCreated={(id) => setSelectedId(id)} />
    </div>
  );
}

function DeleteDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete prompt?</DialogTitle>
          <DialogDescription>This removes the prompt and its result images. This cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="interactive-lift focus-ring min-h-10 rounded-md border border-border bg-card px-4 text-sm font-medium text-t2 hover:text-t1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="interactive-lift focus-ring min-h-10 rounded-md bg-pink px-4 text-sm font-semibold text-white hover:bg-pink/90"
          >
            Delete prompt
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

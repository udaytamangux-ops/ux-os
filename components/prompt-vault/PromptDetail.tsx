"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ImageOff, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { uploadPromptImage } from "@/lib/promptImages";
import { deleteStorageFile } from "@/lib/supabase/storage";
import { cn, formatDate, TOOL_COLORS } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { PromptEntry } from "@/types";

export function PromptDetail({
  entry,
  onBack,
  onDelete,
}: {
  entry: PromptEntry;
  onBack: () => void;
  onDelete: () => void;
}) {
  const { user } = useAuth();
  const updatePromptEntry = useStore((s) => s.updatePromptEntry);
  const togglePromptFavorite = useStore((s) => s.togglePromptFavorite);
  const addPromptImage = useStore((s) => s.addPromptImage);
  const deletePromptImage = useStore((s) => s.deletePromptImage);
  const projects = useStore((s) => s.projects);

  const colors = TOOL_COLORS[entry.tool];
  const linkedProject = projects.find((p) => p.id === entry.projectId) ?? null;
  const fileInput = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [uploading, setUploading] = useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(entry.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  function addTag() {
    const tag = tagDraft.trim();
    if (!tag || entry.tags.includes(tag)) {
      setTagDraft("");
      return;
    }
    updatePromptEntry(entry.id, { tags: [...entry.tags, tag] });
    setTagDraft("");
  }

  function removeTag(tag: string) {
    updatePromptEntry(entry.id, { tags: entry.tags.filter((t) => t !== tag) });
  }

  async function onAddImages(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    for (const file of Array.from(fileList)) {
      try {
        const image = await uploadPromptImage(user?.id ?? null, entry.id, file);
        addPromptImage(entry.id, image);
      } catch (err) {
        console.error("Prompt image upload failed", err);
      }
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function removeImage(imageId: string, name: string) {
    if (user) {
      try {
        await deleteStorageFile("prompt-images", user.id, entry.id, imageId, name);
      } catch (err) {
        console.error("Delete image failed", err);
      }
    }
    deletePromptImage(entry.id, imageId);
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="interactive-lift focus-ring inline-flex w-fit min-h-9 items-center gap-2 rounded-md px-2 text-xs text-t2 hover:bg-card hover:text-t1"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to vault
      </button>

      <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
        {/* LEFT */}
        <div className="space-y-5">
          <div>
            <h1 className="font-display text-2xl font-semibold text-t1">{entry.title || "Untitled prompt"}</h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-t3">
              Saved {formatDate(entry.createdAt)}
            </p>
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-t2">Prompt</h2>
              <button
                type="button"
                onClick={copyPrompt}
                className="interactive-lift focus-ring inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-t1 hover:border-border-s"
              >
                {copied ? <Check size={12} className="text-mint" aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 font-mono text-[12px] leading-relaxed text-t2">
              {entry.prompt}
            </pre>
          </section>

          {entry.negativePrompt && (
            <section>
              <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-t2">Negative Prompt</h2>
              <pre className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 font-mono text-[12px] leading-relaxed text-t3">
                {entry.negativePrompt}
              </pre>
            </section>
          )}

          <section>
            <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-t2">Notes</h2>
            <textarea
              defaultValue={entry.notes}
              onBlur={(e) => updatePromptEntry(entry.id, { notes: e.target.value })}
              rows={4}
              placeholder="What worked, what didn't, which version, model params..."
              className="focus-ring w-full resize-y rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-t1 outline-none placeholder:text-t3 focus:border-accent/60"
            />
          </section>

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={copyPrompt}
              className="interactive-lift focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90"
            >
              <Copy size={14} aria-hidden="true" />
              Copy Prompt
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => togglePromptFavorite(entry.id)}
                aria-pressed={entry.isFavorite}
                className={cn(
                  "interactive-lift focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium",
                  entry.isFavorite
                    ? "border-gold/40 bg-gold-d text-gold"
                    : "border-border bg-card text-t2 hover:border-border-s hover:text-t1"
                )}
              >
                <Star size={14} className={entry.isFavorite ? "fill-gold" : ""} aria-hidden="true" />
                {entry.isFavorite ? "Favorited" : "Favorite"}
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="interactive-lift focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-pink/30 bg-pink-d px-3 text-sm font-medium text-pink hover:bg-pink hover:text-white"
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="space-y-5">
          <div>
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-t2">Tool</span>
            <span className={cn("inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold", colors.badge, colors.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
              {entry.tool}
            </span>
          </div>

          <div>
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-t2">Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="interactive-lift focus-ring group inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 font-mono text-[10px] text-t2 hover:border-pink/40 hover:text-pink"
                  aria-label={`Remove tag ${tag}`}
                >
                  {tag}
                  <X size={10} className="opacity-50 group-hover:opacity-100" aria-hidden="true" />
                </button>
              ))}
            </div>
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder="+ Add tag"
              className="focus-ring mt-2 min-h-9 w-full rounded-md border border-border-s bg-card px-2.5 text-xs text-t1 outline-none placeholder:text-t3 focus:border-accent/60"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-t2">
                Images ({entry.images.length})
              </span>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="interactive-lift focus-ring inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium text-t1 hover:border-border-s disabled:opacity-60"
              >
                {uploading ? <Loader2 size={11} className="animate-spin" aria-hidden="true" /> : <Plus size={11} aria-hidden="true" />}
                Add
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onAddImages(e.target.files)}
              />
            </div>
            {entry.images.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-center text-[11px] text-t3">
                No result images yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {entry.images.map((img) => (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-card">
                    {img.storageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.storageUrl} alt={img.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1 text-t3">
                        <ImageOff size={16} aria-hidden="true" />
                        <span className="text-[9px]">Re-upload</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(img.id, img.name)}
                      className="focus-ring absolute right-1 top-1 rounded bg-t1/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label={`Delete ${img.name}`}
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-t2">Linked Project</span>
            {linkedProject ? (
              <Link
                href={`/projects/${linkedProject.id}`}
                className="interactive-lift focus-ring flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-t1 hover:border-border-s"
              >
                <span className="truncate">{linkedProject.name}</span>
              </Link>
            ) : (
              <select
                value=""
                onChange={(e) => e.target.value && updatePromptEntry(entry.id, { projectId: e.target.value })}
                aria-label="Link to project"
                className="focus-ring min-h-9 w-full rounded-md border border-border-s bg-card px-2.5 text-xs text-t1 outline-none focus:border-accent/60"
              >
                <option value="">Link to project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

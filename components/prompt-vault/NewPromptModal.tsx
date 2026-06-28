"use client";

import { FormEvent, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { uploadPromptImage } from "@/lib/promptImages";
import { useStore } from "@/store/useStore";
import { AI_TOOLS, type AITool } from "@/types";

const inputClass =
  "focus-ring min-h-11 w-full rounded-md border border-border-s bg-card px-3 py-2 text-sm text-t1 outline-none transition-colors placeholder:text-t3 focus:border-accent/60";
const labelClass = "mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-t2";

export function NewPromptModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (entryId: string) => void;
}) {
  const { user } = useAuth();
  const addPromptEntry = useStore((s) => s.addPromptEntry);
  const addPromptImage = useStore((s) => s.addPromptImage);
  const projects = useStore((s) => s.projects);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    tool: "Midjourney" as AITool,
    prompt: "",
    negativePrompt: "",
    tags: "",
    projectId: "",
    notes: "",
  });

  const { getRootProps, getInputProps, isDragActive, open: openPicker } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    noClick: true,
    onDrop: (accepted) =>
      setFiles((cur) => [...cur, ...accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }))]),
  });

  function removeFile(index: number) {
    setFiles((cur) => {
      URL.revokeObjectURL(cur[index].preview);
      return cur.filter((_, i) => i !== index);
    });
  }

  function reset() {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setForm({ title: "", tool: "Midjourney", prompt: "", negativePrompt: "", tags: "", projectId: "", notes: "" });
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.prompt.trim()) {
      setError("Title and prompt are required.");
      return;
    }
    setSaving(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const entry = addPromptEntry({
      title: form.title.trim(),
      prompt: form.prompt.trim(),
      negativePrompt: form.negativePrompt.trim(),
      tool: form.tool,
      tags,
      images: [],
      notes: form.notes.trim(),
      projectId: form.projectId || null,
      isFavorite: false,
    });

    for (const { file } of files) {
      try {
        const image = await uploadPromptImage(user?.id ?? null, entry.id, file);
        addPromptImage(entry.id, image);
      } catch (err) {
        console.error("Prompt image upload failed", err);
      }
    }

    setSaving(false);
    reset();
    onOpenChange(false);
    onCreated?.(entry.id);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Prompt</DialogTitle>
          <DialogDescription>Save a prompt with its results to your vault.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="pv-title">Title</label>
            <input
              id="pv-title"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Give this prompt a memorable name"
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="pv-tool">Tool</label>
            <select
              id="pv-tool"
              className={inputClass}
              value={form.tool}
              onChange={(e) => setForm((f) => ({ ...f, tool: e.target.value as AITool }))}
            >
              {AI_TOOLS.map((tool) => (
                <option key={tool}>{tool}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="pv-prompt">Prompt</label>
            <textarea
              id="pv-prompt"
              rows={4}
              className={`${inputClass} resize-y py-2 font-mono leading-relaxed`}
              value={form.prompt}
              onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
              placeholder="Paste your full prompt here..."
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="pv-neg">Negative Prompt (optional)</label>
            <textarea
              id="pv-neg"
              rows={2}
              className={`${inputClass} resize-y py-2 font-mono leading-relaxed`}
              value={form.negativePrompt}
              onChange={(e) => setForm((f) => ({ ...f, negativePrompt: e.target.value }))}
              placeholder="what to avoid..."
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="pv-tags">Tags</label>
            <input
              id="pv-tags"
              className={inputClass}
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="product, luxury, dark (comma separated)"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="pv-project">Link to Project (optional)</label>
            <select
              id="pv-project"
              className={inputClass}
              value={form.projectId}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span className={labelClass}>Result Images (optional)</span>
            <div
              {...getRootProps()}
              className={`graph-paper flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-s bg-surface/80 p-5 text-center transition-colors ${
                isDragActive ? "border-accent bg-accent-d" : ""
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={18} className="mb-2 text-t2" aria-hidden="true" />
              <p className="text-xs text-t2">Drop your AI outputs here. You can add more later.</p>
              <button
                type="button"
                onClick={openPicker}
                className="interactive-lift focus-ring mt-3 rounded-md border border-border-s bg-card px-3 py-1.5 text-xs font-medium text-t1 hover:bg-card-h"
              >
                Choose images
              </button>
            </div>

            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {files.map((f, i) => (
                  <div key={f.preview} className="group relative aspect-square overflow-hidden rounded-md border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.preview} alt={f.file.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="focus-ring absolute right-1 top-1 rounded bg-t1/70 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label={`Remove ${f.file.name}`}
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="pv-notes">Notes (optional)</label>
            <textarea
              id="pv-notes"
              rows={2}
              className={`${inputClass} resize-y py-2`}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="What worked? Model settings? Variations tried?"
            />
          </div>

          {error && <p className="rounded-md border border-pink/20 bg-pink-d px-3 py-2 text-xs text-pink">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="interactive-lift focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-display text-sm font-semibold text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {saving ? "Saving..." : "Save to Vault"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

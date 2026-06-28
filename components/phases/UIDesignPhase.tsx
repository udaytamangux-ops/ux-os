"use client";

import { useMemo, useState } from "react";
import { CloudOff, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { v4 as uuid } from "uuid";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { deleteStorageFile, uploadFile } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { FileMetadata } from "@/types";

const devices: NonNullable<FileMetadata["device"]>[] = ["desktop", "mobile", "tablet"];

export function UIDesignPhase({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const project = useStore((state) => state.getProject(projectId));
  const markPhaseComplete = useStore((state) => state.markPhaseComplete);
  const addUIScreenFile = useStore((state) => state.addUIScreenFile);
  const deleteUIScreenFile = useStore((state) => state.deleteUIScreenFile);
  const updateUIScreenFile = useStore((state) => state.updateUIScreenFile);
  const updateUIDesignNotes = useStore((state) => state.updateUIDesignNotes);
  const [uploadingIds, setUploadingIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [designNotes, setDesignNotes] = useState(project?.uiDesignNotes ?? "");
  const [warning, setWarning] = useState("");

  const files = useMemo(() => project?.uiScreenFiles ?? [], [project?.uiScreenFiles]);

  const accept = useMemo(
    () => ({
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      "application/pdf": [".pdf"],
    }),
    []
  );

  async function onDrop(acceptedFiles: File[]) {
    if (!project) return;
    if (!user) {
      setWarning("You must be signed in to upload files.");
      return;
    }
    if (files.length + acceptedFiles.length > 20) {
      setWarning("Maximum 20 UI screen files per project.");
      return;
    }
    setWarning("");
    for (const file of acceptedFiles) {
      const id = uuid();
      setUploadingIds((ids) => [...ids, id]);
      try {
        const storageUrl = await uploadFile("ui-screens", user.id, projectId, id, file);
        if (!storageUrl) {
          setWarning(`Could not upload ${file.name}.`);
          continue;
        }
        const metadata: Omit<FileMetadata, "uploadedAt"> = {
          id,
          name: file.name,
          type: file.type === "application/pdf" ? "pdf" : "image",
          size: file.size,
          device: "desktop",
          notes: "",
          storageUrl,
        };
        addUIScreenFile(projectId, metadata);
      } catch (error) {
        console.error("Failed to upload UI screen file", error);
        setWarning(`Could not upload ${file.name}.`);
      } finally {
        setUploadingIds((ids) => ids.filter((x) => x !== id));
      }
    }
  }

  async function removeFile(file: FileMetadata) {
    if (user) {
      try {
        await deleteStorageFile("ui-screens", user.id, projectId, file.id, file.name);
      } catch (error) {
        console.error("Failed to delete UI screen file", error);
      }
    }
    deleteUIScreenFile(projectId, file.id);
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ accept, onDrop, noClick: true, maxFiles: 20 });

  if (!project) return null;

  return (
    <section>
      <PhaseHeader phaseId={6} onComplete={() => markPhaseComplete(projectId, 6)} />
      <div
        {...getRootProps()}
        className={cn(
          "graph-paper interactive-lift flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-s bg-surface/90 p-8 text-center",
          isDragActive && "border-accent bg-accent-d"
        )}
      >
        <input {...getInputProps()} />
        <div className="mb-4 flex h-12 w-12 rotate-[-3deg] items-center justify-center rounded-xl border border-accent/20 bg-accent-d text-accent shadow-[4px_4px_0_rgba(60,96,156,0.16)]">
          <Upload size={22} aria-hidden="true" />
        </div>
        <h3 className="font-display text-base font-semibold text-t1">Upload UI Screens</h3>
        <p className="mt-1 text-sm text-t2">Upload UI screens, mockups, or design exports. Stored securely in the cloud.</p>
        <button type="button" onClick={open} className="interactive-lift focus-ring mt-5 min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90">
          Choose Files
        </button>
      </div>

      {warning && <p className="mt-4 rounded-lg border border-gold/20 bg-gold-d px-4 py-3 text-xs text-gold">{warning}</p>}

      {(files.length > 0 || uploadingIds.length > 0) && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <article key={file.id} className="interactive-lift overflow-hidden rounded-lg border border-border bg-card">
              <button
                type="button"
                onClick={() => setExpandedId((current) => (current === file.id ? null : file.id))}
                className="block w-full text-left"
              >
                <div className="flex h-[150px] items-center justify-center bg-surface">
                  {uploadingIds.includes(file.id) ? (
                    <Loader2 size={24} className="animate-spin text-t2" aria-hidden="true" />
                  ) : !file.storageUrl ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CloudOff size={20} className="text-t2" aria-hidden="true" />
                      <span className="text-[11px] text-t2">Re-upload needed</span>
                    </div>
                  ) : file.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.storageUrl} alt={file.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={38} className="text-pink" aria-hidden="true" />
                  )}
                </div>
              </button>
              <div className="border-t border-border p-3">
                <input
                  value={file.name}
                  onChange={(event) => updateUIScreenFile(projectId, file.id, { name: event.target.value })}
                  className="w-full bg-transparent text-sm font-medium text-t1 outline-none focus:text-accent"
                  aria-label="Screen name"
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex rounded-md border border-border bg-surface p-0.5">
                    {devices.map((device) => (
                      <button
                        key={device}
                        type="button"
                        onClick={() => updateUIScreenFile(projectId, file.id, { device })}
                        className={cn(
                          "interactive-lift focus-ring rounded px-2 py-1 font-mono text-[10px] uppercase",
                          file.device === device ? "bg-accent-d text-accent" : "text-t2 hover:text-t1"
                        )}
                      >
                        {device[0]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file)}
                    className="interactive-lift focus-ring rounded-md p-2 text-t3 hover:bg-pink-d hover:text-pink"
                    aria-label={`Delete ${file.name}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
                {expandedId === file.id && (
                  <textarea
                    value={file.notes}
                    onChange={(event) => updateUIScreenFile(projectId, file.id, { notes: event.target.value })}
                    className="focus-ring mt-3 min-h-24 w-full resize-y rounded-md border border-border bg-surface p-3 text-sm text-t1 outline-none placeholder:text-t3 focus:border-accent/60"
                    placeholder="Notes for this screen..."
                  />
                )}
              </div>
            </article>
          ))}
          {uploadingIds
            .filter((id) => !files.some((f) => f.id === id))
            .map((id) => (
              <div key={id} className="flex h-[200px] items-center justify-center rounded-lg border border-border bg-card">
                <Loader2 size={22} className="animate-spin text-t2" aria-hidden="true" />
              </div>
            ))}
        </div>
      )}

      <div className="studio-panel mt-5 rounded-xl border border-border bg-card p-4">
        <label className="mb-2 block font-display text-sm font-semibold text-t1" htmlFor="ui-design-notes">
          Design System Notes
        </label>
        <textarea
          id="ui-design-notes"
          value={designNotes}
          onChange={(event) => setDesignNotes(event.target.value)}
          onBlur={() => updateUIDesignNotes(projectId, designNotes)}
          className="focus-ring min-h-[180px] w-full resize-y rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-t1 outline-none placeholder:text-t3 focus:border-accent/60"
          placeholder="Document your color decisions, typography, component patterns, spacing rules, and any design constraints."
        />
      </div>
    </section>
  );
}

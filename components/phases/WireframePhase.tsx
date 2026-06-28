"use client";

import { useMemo, useState } from "react";
import { CloudOff, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { v4 as uuid } from "uuid";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { deleteStorageFile, uploadFile } from "@/lib/supabase/storage";
import { cn, formatDate } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { FileMetadata } from "@/types";

export function WireframePhase({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const project = useStore((state) => state.getProject(projectId));
  const markPhaseComplete = useStore((state) => state.markPhaseComplete);
  const addActivity = useStore((state) => state.addActivity);
  const addWireframeFile = useStore((state) => state.addWireframeFile);
  const deleteWireframeFile = useStore((state) => state.deleteWireframeFile);
  const [uploadingIds, setUploadingIds] = useState<string[]>([]);
  const [warning, setWarning] = useState("");

  const files = useMemo(() => project?.wireframeFiles ?? [], [project?.wireframeFiles]);

  const accept = useMemo(
    () => ({
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
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
      setWarning("Maximum 20 wireframe files per project.");
      return;
    }
    setWarning("");

    for (const file of acceptedFiles) {
      const id = uuid();
      setUploadingIds((ids) => [...ids, id]);
      try {
        const storageUrl = await uploadFile("wireframes", user.id, projectId, id, file);
        if (!storageUrl) {
          setWarning(`Could not upload ${file.name}.`);
          continue;
        }
        const metadata: Omit<FileMetadata, "uploadedAt"> = {
          id,
          name: file.name,
          type: file.type === "application/pdf" ? "pdf" : "image",
          size: file.size,
          notes: "",
          storageUrl,
        };
        addWireframeFile(projectId, metadata);
      } catch (error) {
        console.error("Failed to upload wireframe file", error);
        setWarning(`Could not upload ${file.name}.`);
      } finally {
        setUploadingIds((ids) => ids.filter((x) => x !== id));
      }
    }
    if (acceptedFiles.length) {
      addActivity({ projectId, type: "upload", text: `${acceptedFiles.length} wireframe file uploaded` });
    }
  }

  async function removeFile(file: FileMetadata) {
    if (user) {
      try {
        await deleteStorageFile("wireframes", user.id, projectId, file.id, file.name);
      } catch (error) {
        console.error("Failed to delete wireframe file", error);
      }
    }
    deleteWireframeFile(projectId, file.id);
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ accept, onDrop, noClick: true, maxFiles: 20 });

  if (!project) return null;

  return (
    <section>
      <PhaseHeader phaseId={5} onComplete={() => markPhaseComplete(projectId, 5)} />
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
        <h3 className="font-display text-base font-semibold text-t1">Upload Wireframes</h3>
        <p className="mt-1 text-sm text-t2">Files are stored securely in the cloud. PDF, PNG, JPG, JPEG, and WebP are supported.</p>
        <button
          type="button"
          onClick={open}
          className="interactive-lift focus-ring mt-5 min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Choose Files
        </button>
      </div>

      {warning && <p className="mt-4 rounded-lg border border-gold/20 bg-gold-d px-4 py-3 text-xs text-gold">{warning}</p>}

      {(files.length > 0 || uploadingIds.length > 0) && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <FileTile key={file.id} file={file} uploading={uploadingIds.includes(file.id)} onDelete={() => removeFile(file)} />
          ))}
          {uploadingIds
            .filter((id) => !files.some((f) => f.id === id))
            .map((id) => (
              <div key={id} className="flex h-[180px] items-center justify-center rounded-lg border border-border bg-card">
                <Loader2 size={22} className="animate-spin text-t2" aria-hidden="true" />
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

function FileTile({
  file,
  uploading,
  onDelete,
}: {
  file: FileMetadata;
  uploading: boolean;
  onDelete: () => void;
}) {
  const url = file.storageUrl;

  return (
    <article className="interactive-lift group overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex h-[120px] items-center justify-center bg-surface">
        {uploading ? (
          <Loader2 size={24} className="animate-spin text-t2" aria-hidden="true" />
        ) : !url ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <CloudOff size={20} className="text-t2" aria-hidden="true" />
            <span className="text-[11px] text-t2">Re-upload needed</span>
          </div>
        ) : file.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <FileText size={36} className="mx-auto mb-2 text-pink" aria-hidden="true" />
            <p className="max-w-[180px] truncate text-xs text-t2">{file.name}</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-t1">{file.name}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-t2">
            {file.type} - {formatDate(file.uploadedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="interactive-lift focus-ring rounded-md p-2 text-t3 hover:bg-pink-d hover:text-pink"
          aria-label={`Delete ${file.name}`}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

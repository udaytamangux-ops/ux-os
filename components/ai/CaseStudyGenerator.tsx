"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { Copy, Loader2, Lock, Printer, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { CaseStudyTemplate, Project } from "@/types";

const TEMPLATES: { id: CaseStudyTemplate; label: string; desc: string }[] = [
  { id: "web", label: "Web / Digital", desc: "UX research, IA, conversion" },
  { id: "mobile", label: "Mobile App", desc: "Flows, gestures, screen states" },
  { id: "branding", label: "Branding", desc: "Identity, type, color, voice" },
];

export function CaseStudyGenerator({ project }: { project: Project | null }) {
  const saveCaseStudy = useStore((s) => s.saveCaseStudy);
  const updateCaseStudy = useStore((s) => s.updateCaseStudy);
  const setCaseStudyTemplate = useStore((s) => s.setCaseStudyTemplate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");

  let content: ReactNode;

  if (!project) {
    content = (
      <div className="graph-paper flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border bg-card/80 p-6 text-center">
        <div>
          <Sparkles size={32} className="mx-auto mb-4 text-accent" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-t1">Select a project to get started</h2>
          <p className="mt-2 text-sm text-t2">Choose a completed project from the left panel.</p>
        </div>
      </div>
    );
  } else if (project.status !== "Complete") {
    content = (
      <div className="studio-panel flex min-h-[420px] items-center justify-center rounded-xl border border-border bg-surface/95 p-6 text-center">
        <div className="max-w-md">
          <Lock size={34} className="mx-auto mb-4 text-gold" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-t1">Project not yet complete</h2>
          <p className="mt-2 text-sm leading-relaxed text-t2">
            Mark the project as complete and fill in Handoff notes before generating a case study.
          </p>
          <Link
            href={`/projects/${project.id}`}
            className="interactive-lift focus-ring mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
          >
            Go to Handoff Notes
          </Link>
        </div>
      </div>
    );
  } else {
    content = (
      <>
        <div className="studio-panel rounded-xl border border-border bg-surface/95 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-t2">Notes Preview</p>
              <h2 className="mt-1 font-display text-base font-semibold text-t1">{project.name}</h2>
            </div>
          <Link href={`/projects/${project.id}`} className="text-xs font-semibold text-accent transition-colors hover:text-accent/80">
              Edit notes in Handoff phase
            </Link>
          </div>
          <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-relaxed text-t2">
            {project.handoffNotes || "No handoff notes yet. Add notes before generating for better output."}
          </p>
        </div>

        {/* Template selector */}
        <div className="studio-panel rounded-xl border border-border bg-surface/95 p-4">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-t2">Case Study Template</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TEMPLATES.map((t) => {
              const active = (project.caseStudyTemplate ?? "web") === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCaseStudyTemplate(project.id, t.id)}
                  className={cn(
                    "interactive-lift focus-ring rounded-lg border p-3 text-left transition-all",
                    active ? "border-accent/40 bg-accent-d" : "border-border bg-card hover:border-border-s"
                  )}
                >
                  <div className={cn("mb-1 font-display text-[12px] font-semibold", active ? "text-accent" : "text-t1")}>
                    {t.label}
                  </div>
                  <div className="text-[10px] text-t2">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="rounded-md border border-pink/20 bg-pink-d px-4 py-3 text-sm text-pink">{error}</p>}

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="interactive-lift focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-display text-sm font-semibold text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles size={16} aria-hidden="true" />
          )}
          {loading ? "Generating your case study..." : project.caseStudy ? "Regenerate Case Study" : "Generate Case Study"}
        </button>

        {loading && streamedContent && (
          <article className="studio-panel rounded-xl border border-border bg-card p-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-accent">Writing live…</p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-t1">{streamedContent}</div>
          </article>
        )}

        {project.caseStudy && (
          <article className="studio-panel rounded-xl border border-border bg-card p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-t1">AI Case Study</h2>
                {project.caseStudyGeneratedAt && (
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-t2">
                    Generated {formatDate(project.caseStudyGeneratedAt)}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge text="Generated" />
                <button
                  type="button"
                  onClick={copy}
                  className="interactive-lift focus-ring inline-flex min-h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-medium text-t1 hover:border-border-s"
                >
                  <Copy size={13} aria-hidden="true" />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="interactive-lift focus-ring inline-flex min-h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-medium text-t1 hover:border-border-s"
                >
                  <Printer size={13} aria-hidden="true" />
                  Print
                </button>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-t2">Editable case study</span>
              <textarea
                key={project.caseStudyGeneratedAt ?? project.id}
                defaultValue={project.caseStudy}
                onBlur={(event) => updateCaseStudy(project.id, event.target.value)}
                rows={12}
                className="focus-ring w-full resize-y rounded-lg border border-border bg-surface p-3 text-sm leading-relaxed text-t1 outline-none transition-colors focus:border-accent"
              />
            </label>

            <div className="mt-6 border-t border-border pt-5">
              <MarkdownText text={project.caseStudy} />
            </div>
          </article>
        )}
      </>
    );
  }

  async function generate() {
    if (!project) return;
    setLoading(true);
    setError("");
    setStreamedContent("");
    try {
      const response = await fetch("/api/generate-case-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });
      if (!response.ok || !response.body) {
        const fallback = await response.text().catch(() => "");
        throw new Error(fallback || "Failed to generate case study. Check your ANTHROPIC_API_KEY.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setStreamedContent(fullText);
      }

      if (!fullText.trim()) throw new Error("Empty response from the model.");
      saveCaseStudy(project.id, fullText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate case study.");
    } finally {
      setLoading(false);
      setStreamedContent("");
    }
  }

  async function copy() {
    const text = project?.caseStudy;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy case study", error);
    }
  }

  return (
    <div className="space-y-5">
      {content}
      {copied && (
        <div aria-live="polite" className="rounded-md border border-mint/20 bg-mint-d px-4 py-3 text-sm text-mint">
          Case study copied to clipboard.
        </div>
      )}
      <div id="print-area" className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden="true">
        <PrintableCaseStudy project={project} />
      </div>
    </div>
  );
}

function MarkdownText({ text }: { text: string }) {
  const sections = text.split("\n## ");

  return (
    <div className="prose-case max-w-prose">
      {sections.map((section, sectionIndex) => {
        const lines = section.split("\n").filter((line) => line.trim());
        const firstLine = lines[0] ?? "";
        const body = sectionIndex === 0 ? lines : lines.slice(1);
        return (
          <section key={`${sectionIndex}-${firstLine}`} className={sectionIndex > 0 ? "mt-6" : undefined}>
            {sectionIndex > 0 && <h2>{firstLine}</h2>}
            {body.map((line, lineIndex) => {
              if (line.startsWith("# ")) return <h2 key={lineIndex}>{line.replace("# ", "")}</h2>;
              if (line.startsWith("## ")) return <h2 key={lineIndex}>{line.replace("## ", "")}</h2>;
              return <p key={lineIndex}>{line}</p>;
            })}
          </section>
        );
      })}
    </div>
  );
}

function PrintableCaseStudy({ project }: { project: Project | null }) {
  if (!project?.caseStudy) return null;

  return (
    <article>
      <h1>{project.name}</h1>
      <p>{project.client}</p>
      <MarkdownText text={project.caseStudy} />
    </article>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy, Image as ImageIcon, Star } from "lucide-react";
import { cn, TOOL_COLORS } from "@/lib/utils";
import type { PromptEntry } from "@/types";

export function PromptCard({ entry, onClick }: { entry: PromptEntry; onClick: () => void }) {
  const [copied, setCopied] = useState(false);
  const colors = TOOL_COLORS[entry.tool];
  const cover = entry.images.find((i) => i.storageUrl)?.storageUrl ?? null;
  const extra = entry.images.length - 1;

  async function copyPrompt(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(entry.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="interactive-lift anime-card group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-border-s"
    >
      {/* Image / canvas area */}
      <div className={cn("relative flex h-[140px] items-center justify-center overflow-hidden", colors.tint)}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={entry.title} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={28} className="text-border-s" aria-hidden="true" />
        )}

        {entry.isFavorite && (
          <span className="absolute left-2 top-2 rounded-md bg-surface/85 p-1 shadow-sm backdrop-blur">
            <Star size={12} className="fill-gold text-gold" aria-hidden="true" />
            <span className="sr-only">Favorite</span>
          </span>
        )}

        <span
          className={cn(
            "absolute right-2 top-2 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-semibold",
            colors.badge,
            colors.text
          )}
        >
          {entry.tool}
        </span>

        {extra > 0 && (
          <span className="absolute bottom-2 right-2 rounded-md bg-t1/70 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white">
            +{extra}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="mb-1 truncate font-display text-[12px] font-semibold text-t1">
          {entry.title || "Untitled prompt"}
        </h3>
        <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-t2">{entry.prompt}</p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            {entry.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="truncate rounded bg-surface px-1.5 py-0.5 font-mono text-[9px] text-t2">
                {tag}
              </span>
            ))}
            {entry.tags.length > 2 && (
              <span className="font-mono text-[9px] text-t3">+{entry.tags.length - 2}</span>
            )}
          </div>
          <span
            role="button"
            tabIndex={0}
            onClick={copyPrompt}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") copyPrompt(e as unknown as React.MouseEvent);
            }}
            className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[9px] text-t2 transition-colors hover:border-border-s hover:text-t1"
            aria-label="Copy prompt"
          >
            {copied ? <Check size={11} className="text-mint" aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </span>
        </div>
      </div>
    </button>
  );
}

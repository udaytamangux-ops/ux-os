"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhaseHeader } from "@/components/phases/PhaseHeader";
import { cn, EMOTION_CONFIG } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { EmotionLevel, JourneyStage } from "@/types";

const emotions = Object.keys(EMOTION_CONFIG) as EmotionLevel[];
const inputClass =
  "focus-ring min-h-10 w-full rounded-md border border-border-s bg-card px-3 py-2 text-sm text-t1 outline-none placeholder:text-t3 focus:border-accent/60";
const labelClass = "mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-t2";

export function FlowPhase({ projectId }: { projectId: string }) {
  const project = useStore((state) => state.getProject(projectId));
  const addJourneyStage = useStore((state) => state.addJourneyStage);
  const updateJourneyStage = useStore((state) => state.updateJourneyStage);
  const deleteJourneyStage = useStore((state) => state.deleteJourneyStage);
  const moveJourneyStage = useStore((state) => state.moveJourneyStage);
  const markPhaseComplete = useStore((state) => state.markPhaseComplete);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    stageName: "",
    userAction: "",
    touchpoint: "",
    emotion: "neutral" as EmotionLevel,
    thoughts: "",
    painPoints: "",
    opportunities: "",
  });

  const stages = useMemo(() => [...(project?.journeyStages ?? [])].sort((a, b) => a.order - b.order), [project?.journeyStages]);

  if (!project) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.stageName.trim()) return;
    addJourneyStage(projectId, {
      stageName: form.stageName.trim(),
      userAction: form.userAction.trim(),
      touchpoint: form.touchpoint.trim(),
      emotion: form.emotion,
      thoughts: form.thoughts.trim(),
      painPoints: toLines(form.painPoints),
      opportunities: toLines(form.opportunities),
      order: stages.length,
    });
    setForm({ stageName: "", userAction: "", touchpoint: "", emotion: "neutral", thoughts: "", painPoints: "", opportunities: "" });
    setShowForm(false);
  }

  return (
    <section>
      <PhaseHeader phaseId={4} onComplete={() => markPhaseComplete(projectId, 4)} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-t1">Journey Map</h3>
          <p className="mt-1 text-sm text-t2">Track actions, touchpoints, emotions, pain points, and opportunities.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="interactive-lift focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
        >
          <Plus size={15} aria-hidden="true" />
          Add Stage
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="studio-panel mb-5 grid gap-4 rounded-xl border border-border bg-surface p-4 lg:grid-cols-2">
          <Field label="Stage Name">
            <input className={inputClass} value={form.stageName} onChange={(event) => setForm((current) => ({ ...current, stageName: event.target.value }))} required />
          </Field>
          <Field label="Emotion">
            <select className={inputClass} value={form.emotion} onChange={(event) => setForm((current) => ({ ...current, emotion: event.target.value as EmotionLevel }))}>
              {emotions.map((emotion) => (
                <option key={emotion} value={emotion}>
                  {EMOTION_CONFIG[emotion].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="User Action">
            <input className={inputClass} value={form.userAction} onChange={(event) => setForm((current) => ({ ...current, userAction: event.target.value }))} />
          </Field>
          <Field label="Touchpoint">
            <input className={inputClass} value={form.touchpoint} onChange={(event) => setForm((current) => ({ ...current, touchpoint: event.target.value }))} />
          </Field>
          <Field label="Thoughts" full>
            <textarea className={`${inputClass} min-h-20`} value={form.thoughts} onChange={(event) => setForm((current) => ({ ...current, thoughts: event.target.value }))} />
          </Field>
          <Field label="Pain Points">
            <textarea className={`${inputClass} min-h-24`} value={form.painPoints} onChange={(event) => setForm((current) => ({ ...current, painPoints: event.target.value }))} placeholder="One per line" />
          </Field>
          <Field label="Opportunities">
            <textarea className={`${inputClass} min-h-24`} value={form.opportunities} onChange={(event) => setForm((current) => ({ ...current, opportunities: event.target.value }))} placeholder="One per line" />
          </Field>
          <div className="flex gap-2 lg:col-span-2">
            <button type="submit" className="interactive-lift focus-ring min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90">
              Save Stage
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="interactive-lift focus-ring min-h-11 rounded-md border border-border bg-card px-4 py-2 text-sm text-t2 hover:text-t1">
              Cancel
            </button>
          </div>
        </form>
      )}

      {stages.length ? (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            {stages.map((stage) => (
              <JourneyStageCard
                key={stage.id}
                stage={stage}
                onUpdate={(updates) => updateJourneyStage(projectId, stage.id, updates)}
                onDelete={() => deleteJourneyStage(projectId, stage.id)}
                onMove={(direction) => moveJourneyStage(projectId, stage.id, direction)}
              />
            ))}
          </div>
          <EmotionCurve stages={stages} />
        </>
      ) : (
        <EmptyState
          icon={Plus}
          title="No journey stages yet"
          message="Start with the first user step and add emotions as you learn."
          action={{ label: "Add Stage", onClick: () => setShowForm(true) }}
        />
      )}
    </section>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: ReactNode }) {
  return (
    <div className={full ? "lg:col-span-2" : undefined}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function JourneyStageCard({
  stage,
  onUpdate,
  onDelete,
  onMove,
}: {
  stage: JourneyStage;
  onUpdate: (updates: Partial<JourneyStage>) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}) {
  const config = EMOTION_CONFIG[stage.emotion];
  const [draft, setDraft] = useState(stage);

  return (
    <article className="interactive-lift rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-t2">Stage {stage.order + 1}</p>
          <input
            className="mt-1 w-full bg-transparent font-display text-base font-semibold text-t1 outline-none"
            value={draft.stageName}
            onChange={(event) => setDraft((current) => ({ ...current, stageName: event.target.value }))}
            onBlur={() => onUpdate({ stageName: draft.stageName })}
          />
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove("up")} className="interactive-lift focus-ring rounded p-1.5 text-t2 hover:bg-surface hover:text-t1" aria-label="Move stage up">
            <ArrowUp size={14} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onMove("down")} className="interactive-lift focus-ring rounded p-1.5 text-t2 hover:bg-surface hover:text-t1" aria-label="Move stage down">
            <ArrowDown size={14} aria-hidden="true" />
          </button>
          <button type="button" onClick={onDelete} className="interactive-lift focus-ring rounded p-1.5 text-pink hover:bg-pink-d" aria-label="Delete stage">
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      <select
        className={cn("mb-3 min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none", config.color)}
        value={draft.emotion}
        onChange={(event) => {
          const emotion = event.target.value as EmotionLevel;
          setDraft((current) => ({ ...current, emotion }));
          onUpdate({ emotion });
        }}
      >
        {emotions.map((emotion) => (
          <option key={emotion} value={emotion}>
            {EMOTION_CONFIG[emotion].emoji} {EMOTION_CONFIG[emotion].label}
          </option>
        ))}
      </select>
      <AutoField label="User Action" value={draft.userAction} onChange={(value) => setDraft((current) => ({ ...current, userAction: value }))} onBlur={() => onUpdate({ userAction: draft.userAction })} />
      <AutoField label="Touchpoint" value={draft.touchpoint} onChange={(value) => setDraft((current) => ({ ...current, touchpoint: value }))} onBlur={() => onUpdate({ touchpoint: draft.touchpoint })} />
      <AutoField label="Thoughts" value={draft.thoughts} onChange={(value) => setDraft((current) => ({ ...current, thoughts: value }))} onBlur={() => onUpdate({ thoughts: draft.thoughts })} textarea />
      <ListEditor label="Pain Points" items={stage.painPoints} onSave={(items) => onUpdate({ painPoints: items })} color="bg-pink" />
      <ListEditor label="Opportunities" items={stage.opportunities} onSave={(items) => onUpdate({ opportunities: items })} color="bg-mint" />
    </article>
  );
}

function AutoField({
  label,
  value,
  onChange,
  onBlur,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  textarea?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className={labelClass}>{label}</label>
      {textarea ? (
        <textarea className={`${inputClass} min-h-20`} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} />
      ) : (
        <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} />
      )}
    </div>
  );
}

function ListEditor({
  label,
  items,
  onSave,
  color,
}: {
  label: string;
  items: string[];
  onSave: (items: string[]) => void;
  color: string;
}) {
  const [value, setValue] = useState(items.join("\n"));
  return (
    <div className="mb-3">
      <label className={labelClass}>{label}</label>
      <textarea
        className={`${inputClass} min-h-20`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => onSave(toLines(value))}
        placeholder="One per line"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-[11px] text-t2">
            <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmotionCurve({ stages }: { stages: JourneyStage[] }) {
  const values: Record<EmotionLevel, number> = {
    very_positive: 20,
    positive: 35,
    neutral: 55,
    negative: 75,
    very_negative: 92,
  };
  const width = Math.max(320, stages.length * 120);
  const points = stages.map((stage, index) => `${index * 120 + 40},${values[stage.emotion]}`).join(" ");

  return (
    <div className="studio-panel mt-5 rounded-xl border border-border bg-surface p-4">
      <p className="mb-3 font-display text-sm font-semibold text-t1">Emotion Curve</p>
      <svg viewBox={`0 0 ${width} 110`} className="h-[120px] w-full overflow-visible" role="img" aria-label="Journey emotion curve">
        <polyline fill="none" stroke="#244D7A" strokeWidth="2" points={points} />
        {stages.map((stage, index) => {
          const x = index * 120 + 40;
          const y = values[stage.emotion];
          return (
            <g key={stage.id}>
              <circle cx={x} cy={y} r="5" fill={EMOTION_CONFIG[stage.emotion].dotColor} />
              <text x={x} y="108" textAnchor="middle" fill="#596274" fontSize="10">
                {index + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

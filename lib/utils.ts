import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuid } from "uuid";
import type { AITool, EmotionLevel, FindingSeverity, NodeType, PhaseId, SitemapNode } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDaysActive(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function padPhase(id: PhaseId): string {
  return String(id).padStart(2, "0");
}

export const PHASES: { id: PhaseId; name: string; short: string }[] = [
  { id: 1, name: "Project Brief", short: "Brief" },
  { id: 2, name: "UX Research", short: "Research" },
  { id: 3, name: "Information Architecture", short: "IA" },
  { id: 4, name: "User Flow", short: "Flow" },
  { id: 5, name: "Wireframes", short: "Wireframe" },
  { id: 6, name: "UI Design", short: "UI Design" },
  { id: 7, name: "Prototype", short: "Prototype" },
  { id: 8, name: "Usability Testing", short: "Testing" },
  { id: 9, name: "Handoff + Notes", short: "Handoff" },
];

export function getPhase(id: PhaseId) {
  return PHASES.find((p) => p.id === id)!;
}

export const PHASE_ID_TO_ROUTE: Record<PhaseId, string> = {
  1: "brief",
  2: "research",
  3: "ia",
  4: "flow",
  5: "wireframe",
  6: "ui",
  7: "prototype",
  8: "testing",
  9: "handoff",
};

export const EMOTION_CONFIG: Record<
  EmotionLevel,
  { label: string; emoji: string; color: string; dotColor: string }
> = {
  very_positive: { label: "Very Positive", emoji: ":)", color: "text-mint", dotColor: "#3C609C" },
  positive: { label: "Positive", emoji: "+", color: "text-mint", dotColor: "#849CCC" },
  neutral: { label: "Neutral", emoji: "=", color: "text-gold", dotColor: "#74644F" },
  negative: { label: "Negative", emoji: "-", color: "text-pink", dotColor: "#8D3D50" },
  very_negative: { label: "Very Negative", emoji: "!", color: "text-pink", dotColor: "#64283A" },
};

export const SEVERITY_CONFIG: Record<FindingSeverity, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-pink", bg: "bg-pink-d" },
  major: { label: "Major", color: "text-gold", bg: "bg-gold-d" },
  minor: { label: "Minor", color: "text-accent", bg: "bg-accent-d" },
  observation: { label: "Observation", color: "text-t2", bg: "bg-surface" },
};

export const NODE_TYPE_CONFIG: Record<NodeType, { label: string; color: string; dot: string }> = {
  page: { label: "Page", color: "text-accent", dot: "bg-accent" },
  section: { label: "Section", color: "text-gold", dot: "bg-gold" },
  modal: { label: "Modal", color: "text-mint", dot: "bg-mint" },
  external: { label: "External", color: "text-t2", dot: "bg-t2" },
  component: { label: "Component", color: "text-pink", dot: "bg-pink" },
};

export function getCompletionPercent(completedPhases: number[]): number {
  return Math.round((completedPhases.length / 9) * 100);
}

// Prompt Vault — per-tool color coding using the app's light paper-blue tokens.
// `tint` doubles as the empty image-canvas background. The tool name label
// provides non-color-only disambiguation (tools share tints in this palette).
export const TOOL_COLORS: Record<AITool, { badge: string; text: string; tint: string; dot: string }> = {
  Midjourney: { badge: "bg-accent-d", text: "text-accent", tint: "bg-accent-d", dot: "bg-accent" },
  "DALL-E 3": { badge: "bg-accent-d", text: "text-accent", tint: "bg-accent-d", dot: "bg-accent" },
  "Stable Diffusion": { badge: "bg-gold-d", text: "text-gold", tint: "bg-gold-d", dot: "bg-gold" },
  "Adobe Firefly": { badge: "bg-pink-d", text: "text-pink", tint: "bg-pink-d", dot: "bg-pink" },
  "Veo 3": { badge: "bg-mint-d", text: "text-mint", tint: "bg-mint-d", dot: "bg-mint" },
  "Kling AI": { badge: "bg-mint-d", text: "text-mint", tint: "bg-mint-d", dot: "bg-mint" },
  "Runway ML": { badge: "bg-pink-d", text: "text-pink", tint: "bg-pink-d", dot: "bg-pink" },
  Sora: { badge: "bg-accent-d", text: "text-accent", tint: "bg-accent-d", dot: "bg-accent" },
  Claude: { badge: "bg-gold-d", text: "text-gold", tint: "bg-gold-d", dot: "bg-gold" },
  Other: { badge: "bg-card-h", text: "text-t2", tint: "bg-card-h", dot: "bg-t3" },
};

export function createSitemapNode(name: string, type: NodeType = "page"): SitemapNode {
  return { id: uuid(), name, type, notes: "", children: [] };
}

export function updateNodeInTree(
  node: SitemapNode,
  targetId: string,
  updater: (node: SitemapNode) => SitemapNode
): SitemapNode {
  if (node.id === targetId) return updater(node);
  return { ...node, children: node.children.map((child) => updateNodeInTree(child, targetId, updater)) };
}

export function removeNodeFromTree(node: SitemapNode, targetId: string): SitemapNode {
  return {
    ...node,
    children: node.children
      .filter((child) => child.id !== targetId)
      .map((child) => removeNodeFromTree(child, targetId)),
  };
}

export function addChildToNode(node: SitemapNode, parentId: string, child: SitemapNode): SitemapNode {
  if (node.id === parentId) return { ...node, children: [...node.children, child] };
  return { ...node, children: node.children.map((item) => addChildToNode(item, parentId, child)) };
}

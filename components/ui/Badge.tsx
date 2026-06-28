import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  "In Progress": "bg-gold-d text-gold border-gold/20",
  Review: "bg-accent-d text-accent border-accent/20",
  Complete: "bg-mint-d text-mint border-mint/20",
  Done: "bg-mint-d text-mint border-mint/20",
  High: "bg-pink-d text-pink border-pink/20",
  Medium: "bg-gold-d text-gold border-gold/20",
  Low: "bg-accent-d text-accent border-accent/20",
};

const DOT_COLOR: Record<string, string> = {
  "In Progress": "bg-gold",
  Review: "bg-accent",
  Complete: "bg-mint",
  Done: "bg-mint",
};

const STATUS_BADGES = ["In Progress", "Review", "Complete", "Done"];

export function Badge({ text, className }: { text: string; className?: string }) {
  const showDot = STATUS_BADGES.includes(text);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-semibold",
        STYLES[text] ?? "bg-card text-t2 border-border",
        className
      )}
    >
      {showDot && (
        <span className={cn("h-[5px] w-[5px] rounded-full", DOT_COLOR[text] ?? "bg-t2")} />
      )}
      {text}
    </span>
  );
}

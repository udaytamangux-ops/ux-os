import type { ReactNode } from "react";

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-[15px] font-semibold text-t1">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-t2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

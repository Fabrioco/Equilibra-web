import React from "react";

export function CardSummary({
  title,
  value,
  icon,
  color = "text-neutral-900",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div>
        <span className="text-neutral-400 text-xs font-medium uppercase tracking-wide">
          {title}
        </span>
        <p className={`text-lg font-semibold mt-1 ${color}`}>{value}</p>
      </div>

      <div className="text-neutral-400">{icon}</div>
    </div>
  );
}

import React from "react";

export function CardSummary({
  title,
  value,
  icon,
  color = "text-neutral-900",
  subtitle,
  progress,
}: {
  title: React.ReactNode;
  value: string;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
  progress?: number;
}) {
  const hasExtraContent = subtitle || progress !== undefined;

  return (
    <div
      className={`bg-white rounded-3xl p-6 flex flex-col shadow-sm border border-neutral-100 transition-all ${
        hasExtraContent ? "justify-between min-h-32" : "justify-center min-h-25"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1 min-w-0">
          {/* O title agora suporta os botões do carrossel */}
          <div className="text-neutral-400 text-[10px] font-black uppercase tracking-widest leading-tight">
            {title}
          </div>
          <p
            className={`text-xl font-black leading-none mt-1 truncate ${color}`}
          >
            {value}
          </p>
        </div>
        <div className="p-2 bg-neutral-50 rounded-xl text-neutral-500 shrink-0">
          {icon}
        </div>
      </div>

      {hasExtraContent && (
        <div className="mt-4 space-y-2">
          {progress !== undefined && (
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ease-out ${
                  progress >= 100 ? "bg-green-500" : "bg-neutral-900"
                }`}
                style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
              />
            </div>
          )}
          {subtitle && (
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight truncate">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

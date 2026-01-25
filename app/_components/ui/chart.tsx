export function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-sm font-medium text-neutral-700 mb-4">{title}</p>

      <div className="h-40 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 text-xs">
        Gráfico
      </div>
    </div>
  );
}
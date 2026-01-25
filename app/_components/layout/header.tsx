import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { CardUser } from "../ui/card-user";

export default function Header({
  isLoading,
  summaryValues,
  setOpenDrawer,
  setOpenSettings,
  formatCurrency,
}: {
  isLoading: boolean;
  summaryValues: { projection: number };
  setOpenDrawer: (open: boolean) => void;
  setOpenSettings: (open: boolean) => void;
  formatCurrency: (value: number) => string;
}) {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex-1 w-full bg-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100">
        <div className="space-y-1">
          <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Saldo disponível
          </span>
          {isLoading ? (
            <div className="h-10 w-48 bg-neutral-100 animate-pulse rounded-lg" />
          ) : (
            <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
              {formatCurrency(summaryValues.projection)}
            </h1>
          )}
        </div>

        <button
          className="bg-neutral-900 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
          onClick={() => setOpenDrawer(true)}
        >
          <div className="bg-white/20 rounded-lg p-1">
            <ArrowsClockwiseIcon
              size={16}
              weight="bold"
              className="rotate-45"
            />
          </div>
          Nova transação
        </button>
      </div>

      <CardUser onOpenSettings={() => setOpenSettings(true)} />
    </header>
  );
}

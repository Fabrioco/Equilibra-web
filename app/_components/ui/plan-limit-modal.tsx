"use client";

import {
  WarningIcon,
  CrownIcon,
  XIcon,
} from "@phosphor-icons/react";

export type PlanLimitType = "transactions" | "goals";

const MESSAGES: Record<PlanLimitType, string> = {
  transactions:
    "Você atingiu o limite de transações do seu plano neste mês. Faça upgrade para continuar registrando.",
  goals:
    "Você atingiu o limite de metas do seu plano. Faça upgrade para criar mais metas.",
};

export function PlanLimitModal({
  open,
  onClose,
  limitType = "transactions",
  onUpgrade,
}: {
  open: boolean;
  onClose: () => void;
  limitType?: PlanLimitType;
  onUpgrade: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Fechar"
        >
          <XIcon size={20} weight="bold" />
        </button>

        <div className="p-8 pt-10">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <WarningIcon size={28} weight="fill" className="text-amber-600" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 text-center mb-2">
            Limite do plano atingido
          </h2>
          <p className="text-neutral-600 text-center text-sm leading-relaxed mb-8">
            {MESSAGES[limitType]}
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onUpgrade();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <CrownIcon size={20} weight="fill" />
              Mudar de plano
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

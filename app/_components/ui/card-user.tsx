"use client";
import { useAuth } from "@/contexts/auth-context";
import { GearSixIcon } from "@phosphor-icons/react";

export function CardUser({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-3xl p-4 pr-6 flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white font-bold text-lg shadow-inner">
          {[
            user?.name.charAt(0)?.toUpperCase(),
            user?.name.split(" ").at(-1)?.charAt(0)?.toUpperCase(),
          ].join("") || "?"}
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
      </div>

      <div className="flex flex-col mr-2">
        <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-tighter">
          Conta Ativa
        </span>
        <p className="text-sm font-bold text-neutral-800">{user?.name}</p>
      </div>

      {/* Botão de Configurações */}
      <button
        onClick={onOpenSettings}
        className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-400 hover:text-neutral-900"
      >
        <GearSixIcon size={20} weight="fill" />
      </button>
    </div>
  );
}

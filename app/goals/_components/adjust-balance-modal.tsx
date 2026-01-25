"use client";

import { useState } from "react";
import {
  PlusCircleIcon,
  MinusCircleIcon,
  CurrencyDollarIcon,
  XIcon,
} from "@phosphor-icons/react";

interface AdjustBalanceModalProps {
  open: boolean;
  type: "ADD" | "REMOVE";
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export function AdjustBalanceModal({
  open,
  type,
  onClose,
  onConfirm,
}: AdjustBalanceModalProps) {
  const [value, setValue] = useState("");

  if (!open) return null;

  const isAdd = type === "ADD";

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 relative">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-neutral-400 hover:text-neutral-900 transition"
        >
          <XIcon size={20} weight="bold" />
        </button>

        <div className="flex flex-col items-center">
          <div
            className={`p-4 rounded-2xl mb-4 ${isAdd ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            {isAdd ? (
              <PlusCircleIcon size={32} weight="bold" />
            ) : (
              <MinusCircleIcon size={32} weight="bold" />
            )}
          </div>

          <h3 className="text-xl font-black text-neutral-900 mb-1">
            {isAdd ? "Depositar Valor" : "Resgatar Valor"}
          </h3>
          <p className="text-sm text-neutral-400 font-medium mb-8">
            Digite o valor para atualizar sua meta
          </p>

          <div className="w-full relative mb-8">
            <CurrencyDollarIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              size={24}
            />
            <input
              autoFocus
              type="number"
              placeholder="0,00"
              className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 text-lg font-bold"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <button
            disabled={!value || Number(value) <= 0}
            onClick={() => {
              onConfirm(Number(value));
              setValue("");
            }}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition shadow-lg disabled:opacity-50
              ${isAdd ? "bg-green-600 text-white shadow-green-100 hover:bg-green-700" : "bg-neutral-900 text-white shadow-neutral-100 hover:bg-neutral-800"}`}
          >
            Confirmar {isAdd ? "Depósito" : "Resgate"}
          </button>
        </div>
      </div>
    </div>
  );
}

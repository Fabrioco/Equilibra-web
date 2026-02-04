"use client";

import { TrashIcon } from "@phosphor-icons/react";

interface DeleteGoalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export function DeleteGoalModal({
  open,
  onClose,
  onConfirm,
  title,
}: DeleteGoalModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-4xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl mb-4">
            <TrashIcon size={32} weight="bold" />
          </div>
          <h3 className="text-xl font-black text-neutral-900 mb-2">
            Excluir Meta?
          </h3>
          <p className="text-sm text-neutral-500 mb-8 font-medium leading-relaxed">
            Você está prestes a excluir a meta{" "}
            <span className="font-bold text-neutral-900">“{title}”</span>. Esta
            ação não pode ser desfeita.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-2xl font-bold text-sm hover:bg-neutral-200 transition"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition shadow-lg shadow-red-200"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

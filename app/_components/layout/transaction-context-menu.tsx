"use client";

import {
  PencilSimpleIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import React, { useEffect, useRef } from "react";
import { Transaction } from "../../types/transaction.type";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  transaction: Transaction;
  handleOpenEdit: (transaction: Transaction) => void;
  handleDelete: (id: number, scope: "one" | "all") => Promise<void>;
}

export function TransactionContextMenu({
  x,
  y,
  onClose,
  transaction,
  handleOpenEdit,
  handleDelete,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleClickOutside = () => onClose();

    window.addEventListener("contextmenu", handleGlobalContextMenu);
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("contextmenu", handleGlobalContextMenu);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  const isSeries = transaction.recurrence !== "ONE_TIME";

  // --- LÓGICA DE POSICIONAMENTO SEM SETSTATE ---
  // Usamos as dimensões da janela para decidir a direção do menu
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 0;

  // Se o clique foi na metade direita, movemos o menu para a esquerda do mouse (100% de translação)
  const pivotX = x > screenWidth / 2 ? "-100%" : "0%";
  // Se o clique foi na metade de baixo, movemos o menu para cima do mouse
  const pivotY = y > screenHeight / 2 ? "-100%" : "0%";

  const getRealId = (id: string | number) => {
    if (typeof id === "string") {
      return parseInt(id.split("-")[0]); // Pega o "123" de "123-virtual"
    }
    return id;
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-120 bg-white border border-neutral-200 shadow-2xl rounded-2xl py-2 w-60 text-sm animate-in fade-in zoom-in duration-150 ease-out"
      style={{
        top: y,
        left: x,
        transform: `translate(${pivotX}, ${pivotY})`, // O CSS resolve o "pulo" instantaneamente
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="px-4 py-2 mb-1 border-b border-neutral-50">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
          Opções
        </p>
      </div>

      <button
        className="w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 text-neutral-700 transition-colors font-medium"
        onClick={() => {
          handleOpenEdit(transaction);
          onClose();
        }}
      >
        <PencilSimpleIcon
          size={20}
          weight="bold"
          className="text-neutral-400"
        />
        Editar transação
      </button>

      <div className="my-1 border-t border-neutral-100" />

      {!isSeries ? (
        <button
          className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors font-medium"
          onClick={() => {
            handleDelete(transaction.id, "one");
            onClose();
          }}
        >
          <TrashIcon size={20} weight="bold" />
          Excluir transação
        </button>
      ) : (
        <div className="space-y-0.5">
          <div className="px-4 py-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            Excluir recorrência
          </div>
          <button
            className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors font-medium"
            onClick={() => {
              handleDelete(getRealId(transaction.id), "one");
              onClose();
            }}
          >
            <TrashIcon size={20} weight="bold" /> Somente esta
          </button>
          <button
            className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors font-medium"
            onClick={() => {
              handleDelete(getRealId(transaction.id), "all");
              onClose();
            }}
          >
            <WarningCircleIcon size={20} weight="bold" /> Toda a série
          </button>
        </div>
      )}
    </div>
  );
}

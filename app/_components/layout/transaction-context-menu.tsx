import {
  PencilSimpleIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import React from "react";
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
  React.useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [onClose]);

  const isSeries = transaction.recurrence !== "ONE_TIME";

  return (
    <div
      className="fixed z-110 bg-white border border-neutral-200 shadow-xl rounded-xl py-1.5 w-56 text-sm animate-in fade-in zoom-in duration-100"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* EDITAR */}
      <button
        className="w-full px-3 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700 transition"
        onClick={() => {
          handleOpenEdit(transaction);
          onClose();
        }}
      >
        <PencilSimpleIcon size={18} /> Editar transação
      </button>

      <div className="h-px bg-neutral-100 my-1" />

      {/* EXCLUIR SIMPLES (Caso não seja série) */}
      {!isSeries ? (
        <button
          className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 transition"
          onClick={() => {
            handleDelete(transaction.id, "one");
            onClose();
          }}
        >
          <TrashIcon size={18} /> Excluir transação
        </button>
      ) : (
        /* EXCLUIR SÉRIE (Fixa ou Parcelada) */
        <>
          <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-tight">
            Opções de Exclusão
          </div>
          <button
            className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 transition"
            onClick={() => {
              handleDelete(transaction.id, "one");
              onClose();
            }}
          >
            <TrashIcon size={18} /> Somente esta
          </button>
          <button
            className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 transition"
            onClick={() => {
              handleDelete(transaction.id, "all");
              onClose();
            }}
          >
            <WarningCircleIcon size={18} /> Toda a série
          </button>
        </>
      )}
    </div>
  );
}

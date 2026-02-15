import {
  PencilSimpleIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { MobileMenuProps } from "../../types/mobile-menu.type";

export function MobileTransactionMenu({
  transaction,
  onClose,
  onDelete,
  onEdit,
}: MobileMenuProps) {
  if (!transaction) return null;

  // Handler interno para fechar o menu após a ação
  const handleAction = async (action: () => void) => {
    await action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-6" />

        <div className="mb-6">
          <h3 className="font-bold text-lg text-neutral-900">
            {transaction.title}
          </h3>
          <p className="text-sm text-neutral-500">
            {transaction.recurrence === "INSTALLMENT"
              ? `Parcela ${transaction.installmentIndex}/${transaction.totalInstallment}`
              : "O que você deseja fazer?"}
          </p>
        </div>

        <div className="space-y-3">
          {/* EDITAR */}
          <button
            onClick={() => onEdit(transaction)}
            className="w-full py-4 px-4 bg-neutral-50 rounded-2xl flex items-center gap-3 font-medium text-neutral-700 active:scale-95 transition"
          >
            <PencilSimpleIcon size={20} /> Editar transação
          </button>

          <div className="h-px bg-neutral-100 my-2" />

          {/* DELETAR APENAS UMA */}
          <button
            onClick={() => handleAction(() => onDelete(transaction.id, "one"))}
            className="w-full py-4 px-4 bg-red-50 rounded-2xl flex items-center gap-3 font-medium text-red-600 active:scale-95 transition"
          >
            <TrashIcon size={20} />
            {transaction.recurrence === "ONE_TIME"
              ? "Excluir transação"
              : "Excluir somente esta"}
          </button>

          {/* DELETAR SÉRIE (Se não for ONE_TIME) */}
          {transaction.recurrence !== "ONE_TIME" && (
            <button
              onClick={() =>
                handleAction(() => onDelete(transaction.id, "all"))
              }
              className="w-full py-4 px-4 bg-red-100/50 rounded-2xl flex items-center gap-3 font-medium text-red-700 active:scale-95 transition"
            >
              <WarningCircleIcon size={20} />
              {transaction.recurrence === "FIXED"
                ? "Excluir todas as fixas"
                : "Excluir toda a série"}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 text-center text-sm font-bold text-neutral-400 mt-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

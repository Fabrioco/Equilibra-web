import { XIcon } from "@phosphor-icons/react";
import { NewTransactionForm } from "../layout/new-transaction-form";
import React, { useEffect } from "react";
import { Transaction } from "../../types/transaction.type";

export function TransactionDrawer({
  open,
  onClose,
  onSuccess,
  transactionToEdit,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-100 min-h-screen ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full sm:w-105 bg-white z-101 shadow-xl transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header Dinâmico */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            {transactionToEdit ? "Editar transação" : "Nova transação"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 transition"
          >
            <XIcon size={18} className="text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-68px)]">
          <NewTransactionForm
            // A key muda se o ID da transação mudar ou se mudar de 'Edição' para 'Novo'
            key={transactionToEdit?.id || "new-transaction"}
            onClose={onClose}
            onSuccess={onSuccess}
            initialData={transactionToEdit}
          />
        </div>
      </aside>
    </>
  );
}

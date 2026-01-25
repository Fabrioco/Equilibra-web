import {
  ArrowsClockwiseIcon,
  DivideIcon,
  DotsThreeVerticalIcon,
} from "@phosphor-icons/react";
import { Transaction } from "../../../types/transaction.type";
import { SkeletonRow } from "../../../_components/ui/skeleton-states";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (t: Transaction) => void;
  onContextMenu: (e: React.MouseEvent, t: Transaction) => void;
  onMobileMenu: (t: Transaction) => void;
  formatCurrency: (v: number) => string;
  monthName: string;
}

export function TransactionList({
  transactions,
  isLoading,
  onContextMenu,
  onMobileMenu,
  formatCurrency,
  monthName,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-neutral-500">
        Nenhuma transação em {monthName}.
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {transactions.map((item) => (
        <div
          key={item.id}
          onContextMenu={(e) => onContextMenu(e, item)}
          className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition group"
        >
          <div>
            <p className="font-medium text-neutral-900">{item.title}</p>
            <span className="text-xs text-neutral-400">
              {new Date(item.date).getUTCDate().toString().padStart(2, "0")}/
              {(new Date(item.date).getUTCMonth() + 1)
                .toString()
                .padStart(2, "0")}
              /{new Date(item.date).getUTCFullYear()} • {item.category}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p
              className={`font-medium ${item.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
            >
              {item.type === "INCOME" ? "+" : "-"}{" "}
              {formatCurrency(item.amount / 100)}
            </p>
            <div className="flex gap-1">
              {item.recurrence === "FIXED" && (
                <ArrowsClockwiseIcon size={18} className="text-blue-500" />
              )}
              {item.recurrence === "INSTALLMENT" && (
                <DivideIcon size={18} className="text-purple-500" />
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMobileMenu(item);
              }}
              className="p-2 hover:bg-neutral-100 rounded-full transition text-neutral-400 hover:text-neutral-900 md:hidden"
            >
              <DotsThreeVerticalIcon weight="bold" size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

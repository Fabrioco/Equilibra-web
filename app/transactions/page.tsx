"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  DownloadSimpleIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";

// Tipos, Features e UI
import { Transaction } from "../types/transaction.type";
import { TransactionList } from "../_features/transactions/components/transaction-list";
import { TransactionDrawer } from "../_components/ui/new-transaction-drawer";
import { MobileTransactionMenu } from "../_components/layout/mobile-transaction-menu";
import { TransactionContextMenu } from "../_components/layout/transaction-context-menu";
import { API_URL } from "@/config/env";

export default function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Estados de UI
  const [openDrawer, setOpenDrawer] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [filterType, setFilterType] = useState("ALL"); // ALL, INCOME, EXPENSE
  const [currentDate, setCurrentDate] = useState(new Date());

  // Estados de Menu
  const [mobileMenu, setMobileMenu] = useState<Transaction | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    transaction: Transaction;
  } | null>(null);

  const router = useRouter();

  // --- API ---
  const fetchTransactions = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return router.push("/auth/login");
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_URL}/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.status === 401) {
        localStorage.removeItem("token");
        return router.push("/auth/login");
      }
      const data = await res.json();
      setTransactions(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [router]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // --- Handlers ---
  const nextMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  const prevMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );

  const handleOpenEdit = (t: Transaction) => {
    setTransactionToEdit(t);
    setOpenDrawer(true);
  };

  const handleDeleteTransaction = async (
    id: number,
    scope: "one" | "all" = "one",
  ) => {
    if (scope === "all" && !confirm("Excluir série?")) return;
    const res = await fetch(
      `${API_URL}/transactions/${id}?scope=${scope}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    if (res.ok) {
      toast.success("Excluído!");
      fetchTransactions();
      setMobileMenu(null);
      setContextMenu(null);
    }
  };

  // --- Lógica de Filtro e Ordenação ---
  const filteredTransactions = useMemo(() => {
    let res = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getUTCMonth() === currentDate.getMonth() &&
        d.getUTCFullYear() === currentDate.getFullYear()
      );
    });

    if (filterType !== "ALL") res = res.filter((t) => t.type === filterType);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      res = res.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term),
      );
    }

    res.sort((a, b) => {
      switch (sortOrder) {
        case "recent":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest":
          return b.amount - a.amount;
        case "lowest":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return res;
  }, [transactions, searchTerm, sortOrder, filterType, currentDate]);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const monthName = currentDate.toLocaleString("pt-BR", { month: "long" });

  return (
    <div className="min-h-screen w-full pb-20">
      {/* Header Sticky com Design de Histórico */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                Histórico de Transações
              </h1>
              <p className="text-sm text-neutral-400 font-medium">
                Gerencie e filtre todos os seus lançamentos
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-sm font-bold transition">
                <DownloadSimpleIcon size={20} weight="bold" /> Exportar
              </button>
              <button
                onClick={() => setOpenDrawer(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-sm font-bold transition shadow-lg"
              >
                <PlusIcon size={20} weight="bold" /> Nova Transação
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8">
        {/* Barra de Filtros Robusta */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Pesquisar descrição ou categoria..."
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-neutral-900 transition"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Navegador de Mês */}
            <div className="flex items-center bg-neutral-50 rounded-2xl border border-neutral-100 p-1">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white rounded-xl transition"
              >
                <ArrowLeftIcon size={16} weight="bold" />
              </button>
              <span className="text-xs font-black px-3 capitalize min-w-25 text-center">
                {monthName}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white rounded-xl transition"
              >
                <ArrowRightIcon size={16} weight="bold" />
              </button>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3 text-xs font-black text-neutral-600 outline-none focus:ring-2 focus:ring-neutral-900 appearance-none cursor-pointer"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="INCOME">Entradas</option>
              <option value="EXPENSE">Saídas</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3 text-xs font-black text-neutral-600 outline-none focus:ring-2 focus:ring-neutral-900 appearance-none cursor-pointer"
            >
              <option value="recent">Recentes</option>
              <option value="oldest">Antigas</option>
              <option value="highest">Maior Valor</option>
              <option value="lowest">Menor Valor</option>
            </select>
          </div>
        </div>

        {/* Listagem Estilo Tabela */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/30">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              Lançamentos
            </h3>
            <span className="text-xs font-bold text-neutral-500 bg-white px-3 py-1 rounded-full border border-neutral-100 shadow-sm">
              {filteredTransactions.length} registros
            </span>
          </div>

          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoading}
            onEdit={handleOpenEdit}
            onContextMenu={(e, t) =>
              setContextMenu({ x: e.clientX, y: e.clientY, transaction: t })
            }
            onMobileMenu={setMobileMenu}
            formatCurrency={formatCurrency}
            monthName={monthName}
          />
        </div>
      </main>

      {/* Componentes de Suporte */}
      <TransactionDrawer
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
          setTransactionToEdit(null);
        }}
        transactionToEdit={transactionToEdit}
        onSuccess={fetchTransactions}
      />

      {mobileMenu && (
        <MobileTransactionMenu
          transaction={mobileMenu}
          onClose={() => setMobileMenu(null)}
          onDelete={handleDeleteTransaction}
          onEdit={handleOpenEdit}
        />
      )}

      {contextMenu && (
        <TransactionContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
          handleDelete={handleDeleteTransaction}
          handleOpenEdit={handleOpenEdit}
        />
      )}
    </div>
  );
}

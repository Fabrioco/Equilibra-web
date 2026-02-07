"use client";

import { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  DownloadSimpleIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";

import { useTransactions } from "@/contexts/transaction-context";
import { useAuth } from "@/contexts/auth-context";

import { Transaction } from "@/app/types/transaction.type";
import { TransactionContextMenu } from "@/app/_components/ui/transaction-context-menu";
import { MobileTransactionMenu } from "@/app/_components/ui/mobile-transaction-menu";
import { TransactionDrawer } from "@/app/_components/ui/new-transaction-drawer";
import { TransactionList } from "./_components/transaction-list";

export default function TransactionsPage() {
  const { user } = useAuth();

  const {
    transactionsOfMonth,
    isLoading,
    currentDate,
    nextMonth,
    prevMonth,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    deleteTransaction,
    fetchTransactions,
  } = useTransactions();

  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL",
  );
  const [openDrawer, setOpenDrawer] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [mobileMenu, setMobileMenu] = useState<Transaction | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    transaction: Transaction;
  } | null>(null);

  const filteredTransactions = useMemo(() => {
    let res = [...transactionsOfMonth];

    if (filterType !== "ALL") {
      res = res.filter((t) => t.type === filterType);
    }

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
  }, [transactionsOfMonth, filterType, sortOrder, searchTerm]);

  const formatCurrency = (value: number) => {
    if (user?.privacyMode) return "*******";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const monthName = currentDate.toLocaleString("pt-BR", { month: "long" });

  const handleOpenEdit = (t: Transaction) => {
    setTransactionToEdit(t);
    setOpenDrawer(true);
  };

  return (
    <div className="min-h-screen w-full pb-20 bg-neutral-50/40">
      {/* HEADER */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                Histórico de Transações
              </h1>
              <p className="text-sm text-neutral-400 font-medium">
                Gerencie e filtre seus lançamentos
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

      {/* CONTEÚDO */}
      <main className="container mx-auto px-4 md:px-8 py-8">
        {/* BARRA DE FILTROS */}
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-neutral-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar descrição ou categoria..."
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-neutral-900 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-neutral-50 rounded-2xl border border-neutral-100 p-1">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white rounded-xl transition"
              >
                <ArrowLeftIcon size={16} weight="bold" />
              </button>
              <span className="text-xs font-black px-3 capitalize min-w-24 text-center">
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
              onChange={(e) =>
                setFilterType(e.target.value as typeof filterType)
              }
              className="bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3 text-xs font-black text-neutral-600 outline-none cursor-pointer"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="INCOME">Entradas</option>
              <option value="EXPENSE">Saídas</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3 text-xs font-black text-neutral-600 outline-none cursor-pointer"
            >
              <option value="recent">Recentes</option>
              <option value="oldest">Antigas</option>
              <option value="highest">Maior Valor</option>
              <option value="lowest">Menor Valor</option>
            </select>
          </div>
        </div>

        {/* LISTAGEM */}
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

      {/* DRAWER */}
      <TransactionDrawer
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
          setTransactionToEdit(null);
        }}
        transactionToEdit={transactionToEdit}
        onSuccess={fetchTransactions}
      />

      {/* MENUS */}
      {mobileMenu && (
        <MobileTransactionMenu
          transaction={mobileMenu}
          onClose={() => setMobileMenu(null)}
          onDelete={(id) => deleteTransaction(id, "one")}
          onEdit={handleOpenEdit}
        />
      )}

      {contextMenu && (
        <TransactionContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
          handleDelete={(id) => deleteTransaction(id, "one")}
          handleOpenEdit={handleOpenEdit}
        />
      )}
    </div>
  );
}

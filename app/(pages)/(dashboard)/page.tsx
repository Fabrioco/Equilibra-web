"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendUpIcon,
  TargetIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";

// Contextos e Hooks
import { useAuth } from "@/contexts/auth-context";
import { useTransactions } from "@/contexts/transaction-context";
import { useGoals } from "@/contexts/goal-context";

// Componentes de UI
import Header from "@/app/_components/layout/header";
import { SkeletonCard } from "@/app/_components/layout/skeleton-states";
import { CardSummary } from "@/app/(pages)/(dashboard)/_components/card-summary";
import {
  CategoryPieChart,
  DailyAreaChart,
} from "@/app/(pages)/(dashboard)/_components/dashboard-charts";
import { TransactionList } from "@/app/(pages)/transactions/_components/transaction-list";
import { TransactionDrawer } from "@/app/_components/ui/new-transaction-drawer";
import { MobileTransactionMenu } from "@/app/_components/ui/mobile-transaction-menu";
import { TransactionContextMenu } from "@/app/_components/ui/transaction-context-menu";
import { UserSettingsDrawer } from "@/app/(pages)/(dashboard)/_components/user-settings-drawer";

// Tipos
import { Transaction } from "@/app/types/transaction.type";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // --- Consumo do TransactionContext ---
  const {
    transactionsOfMonth,
    isLoading: isLoadingTransactions,
    currentDate,
    nextMonth,
    prevMonth,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    displayLimit,
    setDisplayLimit,
    deleteTransaction,
    fetchTransactions,
  } = useTransactions();

  // --- Consumo do GoalContext ---
  const {
    goals,
    goalStatus,
    currentGoalIndex,
    nextGoal,
    prevGoal,
    isLoadingGoals,
  } = useGoals();

  // --- Estados Locais (Apenas UI/Modais) ---
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [mobileMenu, setMobileMenu] = useState<Transaction | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    transaction: Transaction;
  } | null>(null);

  const isLoading = isLoadingTransactions || isLoadingGoals;

  // --- Helpers ---
  const monthName = currentDate.toLocaleString("pt-BR", { month: "long" });
  const yearName = currentDate.getFullYear();

  const formatCurrency = (v: number) => {
    if (user?.privacyMode) return "*******";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // --- Memos de Dashboard (Cálculos de exibição) ---
  const summaryValues = useMemo(() => {
    const income = transactionsOfMonth
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = transactionsOfMonth
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const commitmentValue =
      income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;

    return {
      income: income / 100,
      expense: expense / 100,
      projection: (income - expense) / 100,
      commitment: commitmentValue,
    };
  }, [transactionsOfMonth]);

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      entradas: 0,
      saidas: 0,
    }));

    transactionsOfMonth.forEach((t) => {
      const day = new Date(t.date).getUTCDate();
      if (t.type === "INCOME") days[day - 1].entradas += Number(t.amount) / 100;
      else days[day - 1].saidas += Number(t.amount) / 100;
    });
    return days;
  }, [transactionsOfMonth, currentDate]);

  const chartData = useMemo(() => {
    const totals = transactionsOfMonth
      .filter((t) => t.type === "EXPENSE")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount) / 100;
          return acc;
        },
        {} as Record<string, number>,
      );
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [transactionsOfMonth]);

  const filteredTransactions = useMemo(() => {
    let res = [...transactionsOfMonth];
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
    return res.slice(0, displayLimit);
  }, [transactionsOfMonth, searchTerm, sortOrder, displayLimit]);

  // --- Handlers de UI ---
  const handleOpenEdit = (t: Transaction) => {
    setTransactionToEdit(t);
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setTransactionToEdit(null);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-4">
        <div className="w-12 h-12 border-4 border-neutral-100 border-t-neutral-900 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
          Equilibrando...
        </p>
      </div>
    );
  }

  if (!user) {
    localStorage.removeItem("token");
    toast.success("Desculpa, é necessário que faça o login");
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50/50">
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <Header
          isLoading={isLoading}
          summaryValues={summaryValues}
          setOpenDrawer={setOpenDrawer}
          setOpenSettings={setOpenSettings}
          formatCurrency={formatCurrency}
        />

        {/* --- CARDS DE RESUMO --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <CardSummary
                title="Entradas"
                value={formatCurrency(summaryValues.income)}
                icon={<ArrowUpIcon className="text-green-500" />}
                color="text-green-600"
              />
              <CardSummary
                title="Saídas"
                value={formatCurrency(summaryValues.expense)}
                icon={<ArrowDownIcon className="text-red-500" />}
                color="text-red-600"
              />
              <CardSummary
                title="Projeção"
                value={formatCurrency(summaryValues.projection)}
                icon={<TrendUpIcon />}
                color={
                  summaryValues.projection >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              />
              <CardSummary
                key={`goal-${currentGoalIndex}`}
                title={
                  <div className="flex items-center justify-between w-full group">
                    <span className="text-neutral-400 text-[10px] font-black uppercase tracking-widest leading-none">
                      Meta: {goalStatus?.title || "S/ Meta"}
                    </span>
                    {goals.length > 1 && (
                      <div className="flex items-center gap-1 bg-neutral-50 rounded-lg p-0.5 border border-neutral-100">
                        <button
                          onClick={prevGoal}
                          className="p-1 hover:bg-white rounded-md transition-all text-neutral-400 hover:text-neutral-900 active:scale-90"
                        >
                          <ArrowLeftIcon size={12} weight="bold" />
                        </button>
                        <span className="text-[9px] font-bold text-neutral-400 px-1">
                          {currentGoalIndex + 1}/{goals.length}
                        </span>
                        <button
                          onClick={nextGoal}
                          className="p-1 hover:bg-white rounded-md transition-all text-neutral-400 hover:text-neutral-900 active:scale-90"
                        >
                          <ArrowRightIcon size={12} weight="bold" />
                        </button>
                      </div>
                    )}
                  </div>
                }
                value={formatCurrency(goalStatus?.total || 0)}
                icon={
                  <TargetIcon
                    size={22}
                    weight="bold"
                    className={
                      goalStatus?.isOver ? "text-green-500" : "text-blue-500"
                    }
                  />
                }
                color="text-blue-600"
                subtitle={
                  goalStatus
                    ? `${goalStatus.percent.toFixed(0)}% poupado (${formatCurrency(goalStatus.current)})`
                    : "Defina seus objetivos"
                }
                progress={goalStatus?.percent}
              />
            </>
          )}
        </div>

        {/* --- INSIGHTS E GRÁFICOS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">
                Comprometimento
              </span>
              <p className="text-3xl font-black text-neutral-900 mt-1">
                {user?.privacyMode
                  ? "**%"
                  : summaryValues.expense === 0
                    ? "0%"
                    : `${summaryValues.commitment}%`}
              </p>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden mt-4">
                <div
                  className={`h-full transition-all duration-1000 ${summaryValues.commitment > 80 ? "bg-red-500" : "bg-neutral-900"} ${user?.privacyMode || summaryValues.expense === 0 ? "opacity-0" : "opacity-100"}`}
                  style={{ width: `${summaryValues.commitment}%` }}
                />
              </div>
            </div>

            <div className="bg-neutral-900 rounded-3xl p-6 shadow-xl text-white">
              <p className="text-xs font-bold opacity-50 uppercase tracking-widest text-neutral-400">
                Foco no Objetivo
              </p>
              <p className="text-sm mt-2 leading-relaxed font-medium">
                {isLoading ? (
                  "Analisando..."
                ) : goalStatus?.isOver ? (
                  <span className="text-green-400">
                    Incrível! Meta mensal atingida. 🚀
                  </span>
                ) : summaryValues.projection <= 0 ? (
                  <span className="text-red-400">
                    Você precisa de {formatCurrency(goalStatus?.remaining || 0)}{" "}
                    para começar a poupar.
                  </span>
                ) : (
                  <>
                    Faltam apenas {formatCurrency(goalStatus?.remaining || 0)}{" "}
                    de economia para seu objetivo.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 h-80">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
              Gastos por Categoria
            </h3>
            <CategoryPieChart
              data={chartData}
              formatCurrency={formatCurrency}
            />
          </div>

          <div
            className={`bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 h-80 transition-all ${user?.privacyMode ? "blur-md select-none pointer-events-none" : ""}`}
          >
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
              Fluxo Diário
            </h3>
            <DailyAreaChart data={dailyData} formatCurrency={formatCurrency} />
          </div>
        </div>

        {/* --- LISTAGEM DE TRANSAÇÕES --- */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-neutral-100">
          <div className="p-6 border-b border-neutral-100 space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <input
                type="text"
                placeholder="Buscar por título ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900 w-full md:max-w-xs"
              />

              <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                <div className="flex items-center gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-white rounded-lg transition text-neutral-600"
                  >
                    <ArrowLeftIcon size={16} weight="bold" />
                  </button>
                  <span className="text-sm font-bold px-4 capitalize min-w-30 text-center">
                    {monthName} {yearName}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-white rounded-lg transition text-neutral-600"
                  >
                    <ArrowRightIcon size={16} weight="bold" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mr-2">
                Refinar:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-xl px-3 py-2 outline-none"
              >
                <option value="recent">Mais Recentes</option>
                <option value="oldest">Mais Antigas</option>
                <option value="highest">Maior Valor</option>
                <option value="lowest">Menor Valor</option>
              </select>

              <select
                value={displayLimit}
                onChange={(e) => setDisplayLimit(Number(e.target.value))}
                className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-xl px-3 py-2 outline-none"
              >
                <option value={3}>Ver 3</option>
                <option value={6}>Ver 6</option>
                <option value={20}>Ver 20</option>
              </select>
            </div>
          </div>

          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoadingTransactions}
            onEdit={handleOpenEdit}
            onContextMenu={(e, t) =>
              setContextMenu({ x: e.clientX, y: e.clientY, transaction: t })
            }
            onMobileMenu={setMobileMenu}
            formatCurrency={formatCurrency}
            monthName={monthName}
          />
        </div>

        {/* --- MODAIS E CONTROLES --- */}
        <TransactionDrawer
          key={transactionToEdit?.id || "new"}
          open={openDrawer}
          onClose={handleCloseDrawer}
          onSuccess={fetchTransactions}
          transactionToEdit={transactionToEdit}
        />
        {mobileMenu && (
          <MobileTransactionMenu
            transaction={mobileMenu}
            onClose={() => setMobileMenu(null)}
            onDelete={deleteTransaction}
            onEdit={handleOpenEdit}
          />
        )}
        {contextMenu && (
          <TransactionContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            transaction={contextMenu.transaction}
            onClose={() => setContextMenu(null)}
            handleDelete={deleteTransaction}
            handleOpenEdit={(t) => {
              handleOpenEdit(t);
              setContextMenu(null);
            }}
          />
        )}
        <UserSettingsDrawer
          open={openSettings}
          onClose={() => setOpenSettings(false)}
        />
      </div>
    </div>
  );
}

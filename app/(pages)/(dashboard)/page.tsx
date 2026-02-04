"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendUpIcon,
  TargetIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";

// Tipos e Constantes
import { API_URL } from "@/config/env";
import { useAuth } from "@/contexts/auth-context";
import { Transaction } from "@/app/types/transaction.type";
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

export type Goal = {
  id: number;
  title: string;
  amountGoal: string; // Vem como string da API ("500000")
  amountCurrent: string; // Vem como string da API ("30000")
  date: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
};

export type GoalResponse = {
  items: Goal[];
};

export default function Home() {
  // --- Estados ---
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [displayLimit, setDisplayLimit] = useState(3);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [mobileMenu, setMobileMenu] = useState<Transaction | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    transaction: Transaction;
  } | null>(null);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  const router = useRouter();

  const { user } = useAuth();

  // --- Navegação ---
  const nextMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  const prevMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  const monthName = currentDate.toLocaleString("pt-BR", { month: "long" });
  const yearName = currentDate.getFullYear();

  // --- API ---
  const fetchTransactions = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return router.push("/auth/login");
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data: GoalResponse = await res.json();

      if (data.items && data.items.length > 0) {
        setGoals(data.items);
      }
    } catch (err) {
      console.error("Erro ao buscar metas:", err);
    }
  }, []);
  useEffect(() => {
    fetchTransactions();
    fetchGoals();
  }, [fetchTransactions, fetchGoals]);

  // --- Memoized Data ---

  const expandFixedTransactions = useCallback(
    (allTransactions: Transaction[], targetDate: Date) => {
      return allTransactions
        .map((t) => {
          if (t.recurrence !== "FIXED") return t;

          const originalDate = new Date(t.date);
          const originalDay = originalDate.getUTCDate();

          // 1. Validação de segurança: Não mostrar no passado
          const firstDayOfOriginal = new Date(
            originalDate.getUTCFullYear(),
            originalDate.getUTCMonth(),
            1,
          );
          const firstDayOfTarget = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            1,
          );

          if (firstDayOfTarget < firstDayOfOriginal) return null;

          // 2. Lógica de Ajuste para meses mais curtos (Dia 31 -> 30 ou 28)
          // Pegamos o último dia do mês que o usuário está vendo
          const lastDayOfTargetMonth = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
            0,
          ).getDate();

          // Se o dia original (ex: 31) for maior que o último dia do mês (ex: 28), usamos o último dia
          const adjustedDay = Math.min(originalDay, lastDayOfTargetMonth);

          const virtualDate = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            adjustedDay,
          );

          // 3. Adicionamos uma flag ou aviso se o dia foi ajustado
          const wasAdjusted = originalDay > lastDayOfTargetMonth;

          return {
            ...t,
            date: virtualDate.toISOString(),
            id: `${t.id}-virtual`,
            // Podemos adicionar um aviso aqui para o componente de lista ler
            title: wasAdjusted
              ? `${t.title} (Ajustado para o fim do mês)`
              : t.title,
          };
        })
        .filter(Boolean) as Transaction[];
    },
    [],
  );
  const transactionsOfMonth = useMemo(() => {
    // 1. Projeta apenas as fixas que já existiam na data selecionada
    const expanded = expandFixedTransactions(transactions, currentDate);

    // 2. Filtra para mostrar apenas o que pertence ao mês atual do dashboard
    return expanded.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getUTCMonth() === currentDate.getMonth() &&
        d.getUTCFullYear() === currentDate.getFullYear()
      );
    });
  }, [transactions, currentDate, expandFixedTransactions]);
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
      goal: monthlyGoal,
      commitment: commitmentValue,
    };
  }, [transactionsOfMonth, monthlyGoal]);

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

    // 1. Filtro de Busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      res = res.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term),
      );
    }

    // 2. Lógica de Ordenação Completa
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

    // 3. Limite de Visualização
    return res.slice(0, displayLimit);
  }, [transactionsOfMonth, searchTerm, sortOrder, displayLimit]);

  const formatCurrency = (v: number) => {
    if (user?.privacyMode) return "*******"; // Se privado, ignora o valor e retorna máscara

    return v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };
  // --- Handlers ---
  const handleOpenEdit = (t: Transaction) => {
    setTransactionToEdit(t);
    setOpenDrawer(true);
  };
  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setTransactionToEdit(null);
  };

  async function handleDeleteTransaction(
    id: number,
    scope: "one" | "all" = "one",
  ) {
    if (scope === "all" && !confirm("Excluir série?")) return;
    const res = await fetch(`${API_URL}/transactions/${id}?scope=${scope}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) {
      toast.success("Excluído!");
      fetchTransactions();
      setMobileMenu(null);
      setContextMenu(null);
    }
  }

  const nextGoal = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir modais acidentalmente
    setCurrentGoalIndex((prev) => (prev + 1 >= goals.length ? 0 : prev + 1));
  };

  const prevGoal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentGoalIndex((prev) => (prev <= 0 ? goals.length - 1 : prev - 1));
  };

  // Meta selecionada no momento
  const activeGoal = goals[currentGoalIndex];

  const goalStatus = useMemo(() => {
    if (!activeGoal) return null;

    const target = Number(activeGoal.amountGoal) / 100;
    const current = Number(activeGoal.amountCurrent) / 100;

    // Porcentagem real: (O que eu tenho agora / O que eu quero) * 100
    const percent = (current / target) * 100;

    // Para o "Foco no Objetivo", ainda usamos a projeção para saber
    // quanto falta economizar *neste mês* para chegar lá
    const remainingToGoal = target - current;

    return {
      title: activeGoal.title,
      total: target,
      current: current,
      percent: percent, // Esta é a porcentagem da barra
      isOver: current >= target,
      remaining: remainingToGoal,
    };
  }, [activeGoal]);

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
                key={`goal-${currentGoalIndex}`} // Ajuda o React a identificar a troca para animações
                title={
                  <div className="flex items-center justify-between w-full group">
                    <div className="flex flex-col">
                      <span className="text-neutral-400 text-[10px] font-black uppercase tracking-widest leading-none">
                        Meta: {goalStatus?.title || "Carregando..."}
                      </span>
                    </div>

                    {/* Controles do Carrossel */}
                    {goals.length > 1 && (
                      <div className="flex items-center gap-1 bg-neutral-50 rounded-lg p-0.5 border border-neutral-100">
                        <button
                          onClick={prevGoal}
                          className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-neutral-400 hover:text-neutral-900 active:scale-90"
                          title="Meta anterior"
                        >
                          <ArrowLeftIcon size={12} weight="bold" />
                        </button>

                        <span className="text-[9px] font-bold text-neutral-400 px-1 select-none">
                          {currentGoalIndex + 1}/{goals.length}
                        </span>

                        <button
                          onClick={nextGoal}
                          className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-neutral-400 hover:text-neutral-900 active:scale-90"
                          title="Próxima meta"
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
                    ? `${goalStatus.percent.toFixed(0)}% poupado (${formatCurrency(goalStatus.current)} de ${formatCurrency(goalStatus.total)})`
                    : "Defina seus objetivos"
                }
                progress={goalStatus?.percent}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Lateral: Comprometimento + Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">
                Comprometimento
              </span>
              {isLoading ? (
                <div className="h-8 w-20 bg-neutral-100 animate-pulse mt-2 rounded" />
              ) : (
                <p className="text-3xl font-black text-neutral-900 mt-1">
                  {user?.privacyMode
                    ? "**%"
                    : summaryValues.expense === 0
                      ? "0%"
                      : `${summaryValues.commitment}%`}
                </p>
              )}
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden mt-4">
                <div
                  className={`h-full transition-all duration-1000 ${
                    summaryValues.commitment > 80
                      ? "bg-red-500"
                      : "bg-neutral-900"
                  } ${user?.privacyMode || summaryValues.expense === 0 ? "opacity-0" : "opacity-100"}`}
                  style={{
                    width: `${isLoading ? 0 : summaryValues.commitment}%`,
                  }}
                />
              </div>
              {/* Texto auxiliar dinâmico */}
              {!isLoading && summaryValues.expense === 0 && (
                <p className="text-[10px] text-neutral-400 mt-2 font-medium">
                  Nenhum gasto este mês. Parabéns! 🥂
                </p>
              )}
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
                    Incrível! Você já atingiu sua meta de economia para este
                    mês. Todo valor extra agora é bônus! 🚀
                  </span>
                ) : summaryValues.projection <= 0 ? (
                  <span className="text-red-400">
                    Seu saldo está negativo ou zerado. Você precisa de{" "}
                    {formatCurrency(goalStatus?.remaining || 0)} para começar a
                    poupar para sua meta.
                  </span>
                ) : (
                  <>
                    Faltam apenas {formatCurrency(goalStatus?.remaining || 0)}{" "}
                    de economia para você atingir seu objetivo mensal. Você
                    consegue!
                  </>
                )}
              </p>
            </div>{" "}
          </div>
          {/* Gráfico de Categoria */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 h-80">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
              Gastos por Categoria
            </h3>
            <CategoryPieChart
              data={chartData}
              formatCurrency={formatCurrency}
            />
          </div>
          {/* Gráfico de Evolução */}
          <div
            className={`bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 h-80 transition-all duration-500 ${user?.privacyMode ? "blur-md select-none pointer-events-none" : ""}`}
          >
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
              Fluxo Diário
            </h3>
            <DailyAreaChart data={dailyData} formatCurrency={formatCurrency} />
          </div>{" "}
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-neutral-100">
          <div className="p-6 border-b border-neutral-100 space-y-4">
            {/* Linha Superior: Busca e Navegação de Mês */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <input
                type="text"
                placeholder="Buscar por título ou categoria..."
                className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-neutral-900 outline-none w-full md:max-w-xs transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                <div className="flex items-center gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-white rounded-lg transition text-neutral-600 shadow-sm sm:shadow-none"
                  >
                    <ArrowLeftIcon size={16} weight="bold" />
                  </button>
                  <span className="text-sm font-bold px-4 capitalize min-w-30 text-center">
                    {monthName} {yearName}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-white rounded-lg transition text-neutral-600 shadow-sm sm:shadow-none"
                  >
                    <ArrowRightIcon size={16} weight="bold" />
                  </button>
                </div>
              </div>
            </div>

            {/* Linha Inferior: Filtros de Ordenação e Limite */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mr-2">
                Refinar:
              </div>

              {/* Seletor de Ordenação */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer hover:bg-neutral-100 transition-colors"
              >
                <option value="recent">Mais Recentes</option>
                <option value="oldest">Mais Antigas</option>
                <option value="highest">Maior Valor</option>
                <option value="lowest">Menor Valor</option>
              </select>

              {/* Seletor de Limite */}
              <select
                value={displayLimit}
                onChange={(e) => setDisplayLimit(Number(e.target.value))}
                className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer hover:bg-neutral-100 transition-colors"
              >
                <option value={3}>Ver 3</option>
                <option value={6}>Ver 6</option>
                <option value={9}>Ver 9</option>
                <option value={20}>Ver 20</option>
              </select>
            </div>
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
            onDelete={handleDeleteTransaction}
            onEdit={handleOpenEdit}
          />
        )}
        {contextMenu && (
          <TransactionContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            transaction={contextMenu.transaction}
            onClose={() => setContextMenu(null)}
            handleDelete={(id, scope) => handleDeleteTransaction(id, scope)}
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

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TargetIcon,
  PlusIcon,
  TrashIcon,
  PencilSimpleIcon,
  CalendarBlankIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { GoalDrawer } from "./_components/goals-drawer";
import { DeleteGoalModal } from "./_components/delete-goal-modal";
import { AdjustBalanceModal } from "./_components/adjust-balance-modal";

interface Goal {
  id: number;
  title: string;
  amountCurrent: number;
  amountGoal: number;
  date: string;
  createdAt: string;
  userId: number;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Modais
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    goalId: number;
    title: string;
  }>({
    open: false,
    goalId: 0,
    title: "",
  });
  const [balanceModal, setBalanceModal] = useState<{
    open: boolean;
    type: "ADD" | "REMOVE";
    goal: Goal | null;
  }>({
    open: false,
    type: "ADD",
    goal: null,
  });

  const router = useRouter();

  const getAuthHeader = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchGoals = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return router.push("/auth/login");

    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:3333/v1/goals", {
        headers: getAuthHeader(),
      });
      const data = await res.json();
      if (data && data.items) setGoals(data.items);
      else setGoals([]);
    } catch {
      toast.error("Erro ao carregar metas");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // --- HANDLERS ---
  const handleOpenDelete = (goal: Goal) => {
    setDeleteModal({ open: true, goalId: goal.id, title: goal.title });
  };

  const handleOpenBalance = (goal: Goal, type: "ADD" | "REMOVE") => {
    setBalanceModal({ open: true, type, goal });
  };

  const handleEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setGoalToEdit(null);
    setIsDrawerOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3333/v1/goals/${deleteModal.goalId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });

      if (res.status === 204) {
        toast.success("Meta excluída!");
        fetchGoals();
      }
    } catch {
      toast.error("Erro ao excluir meta");
    } finally {
      setDeleteModal({ open: false, goalId: 0, title: "" });
    }
  };

  const confirmBalance = async (value: number) => {
    if (!balanceModal.goal) return;

    const amountInCents = Math.round(value * 100);
    const newTotal = balanceModal.type === "ADD"
      ? balanceModal.goal.amountCurrent + amountInCents
      : balanceModal.goal.amountCurrent - amountInCents;

    if (newTotal < 0) {
      toast.warning("O saldo não pode ser negativo");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3333/v1/goals/${balanceModal.goal.id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ amountCurrent: Number(newTotal) }),
      });

      if (res.ok) {
        toast.success("Saldo atualizado!");
        fetchGoals();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Erro ao atualizar saldo");
    } finally {
      setBalanceModal({ ...balanceModal, open: false });
    }
  };

  const formatCurrency = (v: number) =>
    (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const calculateProgress = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    return Math.min(100, Math.round(percentage));
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50/50">
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Metas</h1>
            <p className="text-sm text-neutral-400 font-medium">Transforme seus sonhos em planos reais</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition shadow-xl active:scale-95"
          >
            <PlusIcon size={20} weight="bold" /> Nova Meta
          </button>
        </div>

        {/* CARDS DE SUMÁRIO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <div className="h-32 bg-neutral-200 animate-pulse rounded-4xl" />
              <div className="h-32 bg-neutral-200 animate-pulse rounded-4xl" />
              <div className="h-32 bg-neutral-200 animate-pulse rounded-4xl" />
            </>
          ) : (
            <>
              <div className="bg-white rounded-4xl p-6 shadow-sm border border-neutral-100">
                <span className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Poupado</span>
                <p className="text-2xl font-black text-neutral-900 mt-1">
                  {formatCurrency(goals.reduce((acc, g) => acc + Number(g.amountCurrent), 0))}
                </p>
              </div>
              <div className="bg-white rounded-4xl p-6 shadow-sm border border-neutral-100">
                <span className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">Objetivo Total</span>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {formatCurrency(goals.reduce((acc, g) => acc + Number(g.amountGoal), 0))}
                </p>
              </div>
              <div className="bg-neutral-900 rounded-4xl p-6 shadow-xl text-white">
                <span className="opacity-50 text-[10px] font-black uppercase tracking-[0.2em]">Progresso Geral</span>
                <p className="text-2xl font-black mt-1">
                  {goals.length > 0 
                    ? Math.round((goals.reduce((acc, g) => acc + Number(g.amountCurrent), 0) / goals.reduce((acc, g) => acc + Number(g.amountGoal), 0)) * 100) 
                    : 0}%
                </p>
              </div>
            </>
          )}
        </div>

        {/* GRID DE METAS */}
        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!isLoading && goals.map((goal) => {
              const progress = calculateProgress(goal.amountCurrent, goal.amountGoal);
              const isFinished = progress >= 100;

              return (
                <div key={goal.id} className="bg-white rounded-4xl p-6 shadow-sm border border-neutral-100 flex flex-col justify-between hover:shadow-md transition-all group">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl ${isFinished ? "bg-green-100 text-green-600" : "bg-neutral-100 text-neutral-900"}`}>
                        <TargetIcon size={24} weight="bold" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(goal)} className="p-2 hover:bg-neutral-100 rounded-lg transition text-neutral-400">
                          <PencilSimpleIcon size={18} />
                        </button>
                        <button onClick={() => handleOpenDelete(goal)} className="p-2 hover:bg-red-50 rounded-lg transition text-red-400">
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-neutral-900 leading-tight mb-1">{goal.title}</h3>
                    <div className="flex items-center gap-2 text-neutral-400 mb-6 font-bold text-[10px] uppercase tracking-widest">
                      <CalendarBlankIcon size={14} weight="bold" />
                      Até {new Date(goal.date).toLocaleDateString("pt-BR")}
                    </div>

                    {/* ÁREA DE VALORES CORRIGIDA */}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Poupado</span>
                          <span className="text-sm font-black text-neutral-900">{formatCurrency(goal.amountCurrent)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Objetivo</span>
                          <span className="text-sm font-bold text-neutral-400">{formatCurrency(goal.amountGoal)}</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${isFinished ? "bg-green-500" : "bg-neutral-900"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-right text-[9px] font-black text-neutral-900 uppercase mt-1 tracking-tighter">
                          {progress}% Concluído
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-50">
                    <button
                      onClick={() => handleOpenBalance(goal, "ADD")}
                      className="flex items-center justify-center gap-2 py-3 bg-neutral-50 hover:bg-green-50 hover:text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition text-neutral-600 border border-transparent"
                    >
                      <PlusCircleIcon size={18} weight="bold" /> Depositar
                    </button>
                    <button
                      onClick={() => handleOpenBalance(goal, "REMOVE")}
                      className="flex items-center justify-center gap-2 py-3 bg-neutral-50 hover:bg-red-50 hover:text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition text-neutral-600 border border-transparent"
                    >
                      <MinusCircleIcon size={18} weight="bold" /> Resgatar
                    </button>
                  </div>
                </div>
              );
            })}

            {!isLoading && (
              <button
                className="border-2 border-dashed border-neutral-200 rounded-4xl p-6 flex flex-col items-center justify-center text-neutral-400 hover:border-neutral-900 hover:text-neutral-900 transition-all group gap-3 min-h-[320px]"
                onClick={handleCreate}
              >
                <div className="p-4 bg-neutral-100 rounded-full group-hover:bg-neutral-900 group-hover:text-white transition-all scale-100 group-hover:scale-110">
                  <PlusIcon size={32} weight="bold" />
                </div>
                <span className="font-black text-xs uppercase tracking-[0.2em]">Adicionar Meta</span>
              </button>
            )}
          </div>
        </main>
      </div>

      <GoalDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={fetchGoals}
        goalToEdit={goalToEdit}
      />
      <DeleteGoalModal
        open={deleteModal.open}
        title={deleteModal.title}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={confirmDelete}
      />
      <AdjustBalanceModal
        open={balanceModal.open}
        type={balanceModal.type}
        onClose={() => setBalanceModal({ ...balanceModal, open: false })}
        onConfirm={confirmBalance}
      />
    </div>
  );
}
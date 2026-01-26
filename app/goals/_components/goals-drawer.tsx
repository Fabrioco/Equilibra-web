"use client";

import {  useEffect, useState } from "react";
import {
  XIcon,
  TargetIcon,
  CalendarBlankIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react";
import { toast } from "react-toastify";
import { API_URL } from "@/config/env";

interface Goal {
  id: number;
  title: string;
  amountGoal: number;
  amountCurrent: number;
  date: string;
}

interface GoalDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goalToEdit?: Goal | null;
}

export function GoalDrawer({
  open,
  onClose,
  onSuccess,
  goalToEdit,
}: GoalDrawerProps) {
  const [title, setTitle] = useState("");
  const [amountGoal, setAmountGoal] = useState("");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setAmountGoal((goalToEdit.amountGoal / 100).toString());
      setDate(new Date(goalToEdit.date).toISOString().split("T")[0]);
    } else {
      setTitle("");
      setAmountGoal("");
      setDate("");
    }
  }, [goalToEdit, open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    const url = goalToEdit
      ? `${API_URL}/goals/${goalToEdit.id}`
      : `${API_URL}/goals`;

    const method = goalToEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amountGoal: Math.round(Number(amountGoal) * 100),
          date: new Date(date).toISOString(),
          ...(!goalToEdit && { amountCurrent: 0 }),
        }),
      });

      if (res.ok) {
        toast.success(goalToEdit ? "Meta atualizada!" : "Meta criada!");
        onSuccess();
        onClose();
      } else {
        toast.error("Erro ao salvar meta");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      {/* Container do Drawer com o arredondamento de 40px igual ao Dashboard */}
      <div className="h-full w-full max-w-md bg-white p-8 shadow-2xl animate-in slide-in-from-right duration-300 rounded-l-[40px] flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
              {goalToEdit ? "Editar Meta" : "Nova Meta"}
            </h2>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">
              {goalToEdit ? "Ajuste seus planos" : "Defina um novo objetivo"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
          >
            <XIcon size={24} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 flex-1">
          {/* Input: Título */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] ml-1">
              O que você quer conquistar?
            </label>
            <div className="relative group">
              <TargetIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
                size={20}
              />
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reserva de Emergência"
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-[20px] outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all font-medium text-neutral-900"
              />
            </div>
          </div>

          {/* Input: Valor Objetivo */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] ml-1">
              Quanto precisa poupar?
            </label>
            <div className="relative group">
              <CurrencyDollarIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
                size={20}
              />
              <input
                required
                type="number"
                step="0.01"
                value={amountGoal}
                onChange={(e) => setAmountGoal(e.target.value)}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-[20px] outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all font-medium text-neutral-900"
              />
            </div>
          </div>

          {/* Input: Data */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] ml-1">
              Prazo final
            </label>
            <div className="relative group">
              <CalendarBlankIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
                size={20}
              />
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-[20px] outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all font-medium text-neutral-900"
              />
            </div>
          </div>

          {/* Botão de Ação */}
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-5 bg-neutral-900 text-white rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {isSubmitting
              ? "Processando..."
              : goalToEdit
                ? "Confirmar Alterações"
                : "Criar Nova Meta"}
          </button>
        </form>
      </div>
    </div>
  );
}

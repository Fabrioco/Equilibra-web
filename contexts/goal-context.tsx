"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { API_URL } from "@/config/env";
import { toast } from "react-toastify";

export type Goal = {
  id: number;
  title: string;
  amountGoal: string;
  amountCurrent: string;
  date: string;
  userId: number;
};

interface GoalContextData {
  goals: Goal[];
  isLoadingGoals: boolean;
  currentGoalIndex: number;
  activeGoal: Goal | null;
  goalStatus: {
    title: string;
    total: number;
    current: number;
    percent: number;
    isOver: boolean;
    remaining: number;
  } | null;
  nextGoal: (e?: React.MouseEvent) => void;
  prevGoal: (e?: React.MouseEvent) => void;
  fetchGoals: () => Promise<void>;
  setCurrentGoalIndex: (index: number) => void;
}

const GoalContext = createContext<GoalContextData>({} as GoalContextData);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoadingGoals(true);
      const res = await fetch(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.items) setGoals(data.items);
    } catch (err) {
      console.error("Erro ao buscar metas:", err);
    } finally {
      setIsLoadingGoals(false);
    }
  }, []);

  const nextGoal = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentGoalIndex((prev) => (prev + 1 >= goals.length ? 0 : prev + 1));
  };

  const prevGoal = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentGoalIndex((prev) => (prev <= 0 ? goals.length - 1 : prev - 1));
  };

  const activeGoal = useMemo(() => goals[currentGoalIndex] || null, [goals, currentGoalIndex]);

  const goalStatus = useMemo(() => {
    if (!activeGoal) return null;

    const target = Number(activeGoal.amountGoal) / 100;
    const current = Number(activeGoal.amountCurrent) / 100;
    const percent = target > 0 ? (current / target) * 100 : 0;
    const remainingToGoal = target - current;

    return {
      title: activeGoal.title,
      total: target,
      current: current,
      percent: percent,
      isOver: current >= target,
      remaining: remainingToGoal,
    };
  }, [activeGoal]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return (
    <GoalContext.Provider
      value={{
        goals,
        isLoadingGoals,
        currentGoalIndex,
        activeGoal,
        goalStatus,
        nextGoal,
        prevGoal,
        fetchGoals,
        setCurrentGoalIndex,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export const useGoals = () => useContext(GoalContext);
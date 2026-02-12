"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Transaction } from "@/app/types/transaction.type";
import { API_URL } from "@/app/config/env";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "./auth-context";

interface TransactionContextData {
  transactions: Transaction[];
  transactionsOfMonth: Transaction[];
  isLoading: boolean;
  currentDate: Date;
  searchTerm: string;
  sortOrder: string;
  setSearchTerm: (term: string) => void;
  setSortOrder: (order: string) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  fetchTransactions: () => Promise<void>;
  deleteTransaction: (id: number, scope?: "one" | "all") => Promise<void>;
  displayLimit: number;
  setDisplayLimit: (limit: number) => void;
}

const TransactionContext = createContext<TransactionContextData>(
  {} as TransactionContextData,
);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [displayLimit, setDisplayLimit] = useState(10);

  const router = useRouter();

  const fetchTransactions = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/auth/login");
        return;
      }

      const data = await res.json();
      setTransactions(Array.isArray(data.items) ? data.items : []);
    } catch {
      toast.error("Erro ao carregar transações");
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [router]);

  const expandFixedTransactions = useCallback(
    (all: Transaction[], target: Date) =>
      all.flatMap((t) => {
        if (t.recurrence !== "FIXED") return [t];

        const original = new Date(t.date);
        const virtual = new Date(
          target.getFullYear(),
          target.getMonth(),
          Math.min(
            original.getDate(),
            new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate(),
          ),
        );

        if (virtual < original) return [];

        return [{ ...t, date: virtual.toISOString(), isVirtual: true }];
      }),
    [],
  );

  const transactionsOfMonth = useMemo(() => {
    const expanded = expandFixedTransactions(transactions, currentDate);
    return expanded.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [transactions, currentDate, expandFixedTransactions]);

  const deleteTransaction = async (
    id: number,
    scope: "one" | "all" = "one",
  ) => {
    try {
      const res = await fetch(`${API_URL}/transactions/${id}?scope=${scope}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        toast.success("Excluído!");
        fetchTransactions();
      }
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const nextMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchTransactions();
    }
  }, [fetchTransactions, user, isAuthenticated]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        transactionsOfMonth,
        isLoading,
        currentDate,
        searchTerm,
        sortOrder,
        setSearchTerm,
        setSortOrder,
        nextMonth,
        prevMonth,
        fetchTransactions,
        deleteTransaction,
        displayLimit,
        setDisplayLimit,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);

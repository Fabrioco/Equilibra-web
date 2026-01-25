import { useState, useEffect } from "react";
import { Transaction } from "../../types/transaction.type";
import { toast } from "react-toastify";

export function NewTransactionForm({
  onClose,
  onSuccess,
  initialData, // Adicionado aqui
}: {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Transaction | null; // Adicionado aqui
}) {
  type TransactionType = "INCOME" | "EXPENSE";
  const isEditing = !!initialData; // Helper para saber se é edição

  const labels: Record<TransactionType, string> = {
    INCOME: "Entrada",
    EXPENSE: "Saída",
  };

  const [typeIs, setTypeIs] = useState<TransactionType>(
    initialData?.type as TransactionType,
  );
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [amount, setAmount] = useState<number>(
    initialData ? Number(initialData.amount) : 0,
  );
  const [category, setCategory] = useState<string>(initialData?.category || "");
  const [date, setDate] = useState<string>(
    initialData
      ? new Date(initialData.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [isFixed, setIsFixed] = useState<boolean>(
    initialData?.recurrence === "FIXED",
  );
  const [isInstallments, setIsInstallments] = useState<boolean>(
    initialData?.recurrence === "INSTALLMENT",
  );
  const [installments, setInstallments] = useState<number>(
    initialData?.totalInstallment || 2,
  );
  const [categories, setCategories] = useState<string[]>([]);

  // 1. Efeito para carregar dados de edição ou limpar para novo

  function formattedCurrency(value: string | number | undefined): string {
    if (value === undefined || value === null) return "R$ 0,00";
    const numericValue =
      typeof value === "string" ? value.replace(/\D/g, "") : value.toString();
    const cents = Number(numericValue);
    if (Number.isNaN(cents)) return "R$ 0,00";
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function resetForm() {
    setTypeIs("EXPENSE");
    setTitle("");
    setAmount(0);
    setCategory("");
    setDate(new Date().toISOString().slice(0, 10));
    setIsFixed(false);
    setIsInstallments(false);
    setInstallments(2);
  }

  // 2. Função Unificada (Create ou Update)
  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const recurrence = isFixed
      ? "FIXED"
      : isInstallments
        ? "INSTALLMENT"
        : "ONE_TIME";

    // URL e Método dinâmicos
    const url = isEditing
      ? `http://localhost:3333/v1/transactions/${initialData.id}`
      : "http://localhost:3333/v1/transactions";

    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: typeIs,
          title,
          amount,
          category,
          recurrence,
          date: new Date(date).toISOString(),
          totalInstallment: isInstallments ? installments : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || `Erro ao ${isEditing ? "editar" : "criar"} transação`,
        );
        return;
      }

      toast.success(
        `Transação ${isEditing ? "atualizada" : "criada"} com sucesso!`,
      );
      onSuccess();
      onClose();
    } catch {
      toast.error("Erro na comunicação com o servidor.");
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:3333/v1/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const fetched = Array.isArray(data.items)
          ? Array.from(new Set(data.items.map((t: Transaction) => t.category)))
          : [];
        setCategories(fetched as string[]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const updateState = () => {
      if (initialData) {
        setTypeIs(initialData.type as TransactionType);
        setTitle(initialData.title);
        setAmount(Number(initialData.amount));
        setCategory(initialData.category);
        setDate(new Date(initialData.date).toISOString().slice(0, 10));
        setIsFixed(initialData.recurrence === "FIXED");
        setIsInstallments(initialData.recurrence === "INSTALLMENT");
        setInstallments(initialData.totalInstallment || 2);
      } else {
        resetForm();
      }
    };

    updateState();
  }, [initialData]);
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {!isEditing && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetForm}
            className="text-xs text-neutral-400 hover:text-neutral-700 transition"
          >
            Limpar Tudo
          </button>
        </div>
      )}

      {/* Bloqueamos a troca de Tipo e Recorrência na edição (conforme seu backend exige) */}
      <div
        className={`space-y-5 ${isEditing ? "opacity-60 pointer-events-none" : ""}`}
      >
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(labels) as TransactionType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeIs(type)}
              className={`py-2 rounded-lg border text-sm font-medium transition ${
                typeIs === type
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-500 border-neutral-200"
              }`}
            >
              {labels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Campos editáveis sempre */}
      <div>
        <label className="text-xs font-medium text-neutral-500">Título</label>
        <input
          type="text"
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 outline-none"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          required
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500">Valor</label>
        <input
          type="text"
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 outline-none"
          onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")))}
          value={formattedCurrency(amount)}
          required
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500">
          Categoria
        </label>
        <input
          list="categories-list"
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none bg-white"
          onChange={(e) => setCategory(e.target.value)}
          value={category}
          required
        />
        <datalist id="categories-list">
          {categories.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500">Data</label>
        <input
          type="date"
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none"
          onChange={(e) => setDate(e.target.value)}
          value={date}
          required
        />
      </div>

      {/* Recorrência bloqueada na edição */}
      <div
        className={`space-y-4 ${isEditing ? "opacity-60 pointer-events-none" : ""}`}
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="fixed"
            checked={isFixed}
            onChange={(e) => {
              setIsFixed(e.target.checked);
              if (e.target.checked) setIsInstallments(false);
            }}
          />
          <label htmlFor="fixed" className="text-sm text-neutral-700">
            Fixa
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="installments"
              checked={isInstallments}
              onChange={(e) => {
                setIsInstallments(e.target.checked);
                if (e.target.checked) setIsFixed(false);
              }}
            />
            <label htmlFor="installments" className="text-sm text-neutral-700">
              Parcelar
            </label>
          </div>
          {isInstallments && (
            <input
              type="number"
              min={2}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              onChange={(e) => setInstallments(Number(e.target.value))}
              value={installments}
            />
          )}
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 rounded-lg border border-neutral-200 text-sm font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium"
        >
          {isEditing ? "Salvar Alterações" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

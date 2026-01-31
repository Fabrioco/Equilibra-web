"use client";

import { useEffect, useState, useMemo, JSX } from "react";
import {
  XIcon,
  CheckCircleIcon,
  CrownIcon,
  LightningIcon,
  RocketLaunchIcon,
  CaretLeftIcon,
  WarningIcon,
  UserCircleIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "react-toastify";
import { API_URL } from "@/config/env";

// --- Tipagem ---
interface Plan {
  id: string;
  name: string;
  value: number;
  icon: JSX.Element;
  features: string[];
  color: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Gratuito",
    value: 0,
    icon: <LightningIcon size={24} weight="fill" />,
    features: ["Acesso básico", "Até 10 registros", "Suporte via email"],
    color: "text-neutral-400",
  },
  {
    id: "ESSENCIAL",
    name: "Essencial",
    value: 15,
    icon: <LightningIcon size={24} weight="fill" />,
    features: ["Acesso ilimitado", "Notificações Web", "Suporte 24h"],
    color: "text-blue-500",
  },
  {
    id: "PRO",
    name: "Pro",
    value: 20,
    popular: true,
    icon: <CrownIcon size={24} weight="fill" />,
    features: [
      "Tudo do Essencial",
      "Modo Privacidade Pro",
      "Relatórios Mensais",
    ],
    color: "text-amber-500",
  },
  {
    id: "ULTIMATE",
    name: "Elite",
    value: 25,
    icon: <RocketLaunchIcon size={24} weight="fill" />,
    features: ["Tudo do Pro", "Mentoria Exclusiva", "Acesso Antecipado"],
    color: "text-purple-500",
  },
];

export function PricingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState<"plans" | "checkout" | "confirm-downgrade">(
    "plans",
  );
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [documentValue, setDocumentValue] = useState("");

  const currentPlanData = useMemo(
    () => PLANS.find((p) => p.id === user?.plan) || PLANS[0],
    [user?.plan],
  );

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("plans");
        setSelectedPlan(null);
        setDocumentValue("");
      }, 300);
    }
  }, [open]);

  // --- Funções Reintegradas ---

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === "FREE") setStep("confirm-downgrade");
    else {
      setSelectedPlan(plan);
      setStep("checkout");
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payments/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        toast.success("Cancelado com sucesso.");
        window.location.reload();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Erro ao cancelar assinatura.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return;
    const rawDoc = documentValue.replace(/\D/g, "");
    if (rawDoc.length < 11) return toast.warn("Documento inválido.");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payments/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          cpfCnpj: rawDoc,
          planValue: selectedPlan.value,
          billingType: "CREDIT_CARD", // Mantendo padrão conforme seu código anterior
        }),
      });
      const data = await res.json();
      if (data.invoiceUrl) window.location.href = data.invoiceUrl;
      else throw new Error();
    } catch {
      toast.error("Erro ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[95vh]">
        <header className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {step !== "plans" && (
              <button
                onClick={() => setStep("plans")}
                className="p-2 hover:bg-neutral-100 rounded-full transition-all"
              >
                <CaretLeftIcon size={20} weight="bold" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tighter uppercase italic leading-none">
                Assinatura Premium
              </h2>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1">
                <UserCircleIcon
                  size={14}
                  weight="fill"
                  className="text-emerald-500"
                />
                Plano Atual:{" "}
                <span className="text-neutral-900">{currentPlanData.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-neutral-400"
          >
            <XIcon size={24} weight="bold" />
          </button>
        </header>

        <main className="p-8 md:p-12 overflow-y-auto grow custom-scrollbar bg-neutral-50/50">
          {step === "plans" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {PLANS.map((plan, i) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  delay={i * 100}
                  isCurrent={user?.plan === plan.id}
                  onSelect={() => handleSelectPlan(plan)}
                  onCancel={() => setStep("confirm-downgrade")}
                  loading={loading}
                />
              ))}
            </div>
          ) : step === "checkout" ? (
            <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
              <div className="text-center space-y-2">
                <div
                  className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center bg-white shadow-xl ${selectedPlan?.color}`}
                >
                  {selectedPlan?.icon}
                </div>
                <h3 className="text-2xl font-black text-neutral-900 uppercase italic">
                  Plano {selectedPlan?.name}
                </h3>
                <p className="text-neutral-500 font-bold tracking-tight text-lg">
                  R$ {selectedPlan?.value},00 / mês
                </p>
              </div>

              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 mb-1 block tracking-widest">
                    Documento (CPF/CNPJ)
                  </label>
                  <input
                    type="text"
                    value={documentValue.replace(
                      /(\d{3})(\d{3})(\d{3})(\d{2})/g,
                      "$1.$2.$3-$4",
                    )}
                    onChange={(e) => setDocumentValue(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full p-5 bg-white border-2 border-neutral-100 rounded-2xl font-bold text-lg focus:border-neutral-900 outline-none transition-all shadow-sm group-hover:border-neutral-200"
                  />
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full p-5 bg-neutral-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-neutral-800 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? "Processando..." : "Finalizar com Cartão"}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto py-12 text-center space-y-8 animate-in zoom-in-95">
              <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[32px] flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <WarningIcon size={48} weight="fill" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-neutral-900 tracking-tighter italic uppercase">
                  Tem certeza?
                </h3>
                <p className="text-neutral-500 font-bold leading-relaxed">
                  Você perderá acesso imediato aos recursos exclusivos do seu
                  plano atual.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="w-full p-5 bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
                >
                  {loading ? "Cancelando..." : "Confirmar Cancelamento"}
                </button>
                <button
                  onClick={() => setStep("plans")}
                  className="w-full p-5 bg-neutral-100 text-neutral-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-all"
                >
                  Manter meu Plano
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  delay,
  onSelect,
  onCancel,
  loading,
}: {
  plan: Plan;
  isCurrent: boolean;
  delay: number;
  onSelect: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isPro = plan.id === "PRO";
  const isFree = plan.id === "FREE";

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative p-8 rounded-[36px] border-2 transition-all duration-500 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-8 fill-mode-both hover:scale-[1.03]
      ${isPro ? "border-amber-400 bg-white shadow-[0_20px_40px_-15px_rgba(251,191,36,0.2)]" : "border-neutral-100 bg-white hover:border-neutral-300"}
      ${isCurrent ? "border-emerald-500 scale-[1.03]! shadow-xl ring-4 ring-emerald-50" : ""}`}
    >
      {isPro && !isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5 z-10">
          <StarIcon weight="fill" size={12} /> Mais Vendido
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-10">
          Seu Plano Atual
        </div>
      )}

      <div className="space-y-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 ${isPro ? "bg-amber-50" : "bg-neutral-50"} ${plan.color}`}
        >
          {plan.icon}
        </div>

        <div>
          <h3 className="text-xl font-black text-neutral-900 italic uppercase tracking-tighter">
            {plan.name}
          </h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-neutral-900 italic">
              R$ {plan.value}
            </span>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              /mês
            </span>
          </div>
        </div>

        <ul className="space-y-4 pt-2">
          {plan.features.map((feature: string, i: number) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[11px] font-bold text-neutral-500 leading-tight"
            >
              <CheckCircleIcon
                size={18}
                weight="fill"
                className={
                  isPro
                    ? "text-amber-500"
                    : isCurrent
                      ? "text-emerald-500"
                      : "text-neutral-300"
                }
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        {isCurrent ? (
          !isFree ? (
            <button
              onClick={onCancel}
              className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2 group/btn"
            >
              <TrashIcon
                size={14}
                weight="bold"
                className="group-hover/btn:shake"
              />{" "}
              Cancelar Assinatura
            </button>
          ) : (
            <div className="w-full py-4 text-center text-[10px] font-black uppercase text-neutral-400 tracking-widest border-2 border-dashed border-neutral-100 rounded-2xl">
              Você já está aqui
            </div>
          )
        ) : (
          <button
            onClick={onSelect}
            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95
            ${isPro ? "bg-amber-400 text-amber-950 hover:bg-amber-500" : "bg-neutral-900 text-white hover:bg-black"}`}
          >
            {plan.value > 0 ? "Assinar Agora" : "Mudar para este"}
          </button>
        )}
      </div>
    </div>
  );
}

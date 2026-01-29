"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  EnvelopeSimpleIcon,
  PaperPlaneTiltIcon,
  KeyIcon,
  LockLaminatedIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { toast } from "react-toastify";
import { API_URL } from "@/config/env";
import { useRouter } from "next/navigation";

type Step = "REQUEST" | "VERIFY" | "RESET";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("REQUEST");
  const [isLoading, setIsLoading] = useState(false);

  // Dados do formulário
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 1. Enviar Código
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/no-auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep("VERIFY");
        toast.success("Código enviado ao seu e-mail!");
      } else {
        console.log(await res.json());
        toast.error("Usuário não encontrado.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Verificar Código
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    sessionStorage.setItem("token", code);

    try {
      const res = await fetch(`${API_URL}/no-auth/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: code }),
      });
      if (res.ok) {
        toast.success("Código validado!");
        setStep("RESET");
      } else {
        toast.error("Código inválido ou expirado.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // 3. Resetar Senha
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword)
      return toast.error("As senhas não coincidem.");

    const token = sessionStorage.getItem("token");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/no-auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
          confirmNewPassword: confirmPassword,
        }),
      });
      if (res.ok) {
        toast.success("Senha alterada com sucesso!");
        router.push("/auth/login");
      } else {
        console.log(await res.json());
        toast.error("Erro ao redefinir senha.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-neutral-100">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors text-[10px] font-black uppercase tracking-widest mb-8"
          >
            <ArrowLeftIcon size={14} weight="bold" /> Voltar ao login
          </Link>

          {/* PASSO 1: SOLICITAÇÃO */}
          {step === "REQUEST" && (
            <form
              onSubmit={handleSendCode}
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">
                  Recuperar <span className="text-blue-600">acesso.</span>
                </h1>
                <p className="text-neutral-400 text-sm font-medium">
                  Digite seu e-mail para receber o código de verificação.
                </p>
              </div>
              <div className="space-y-4">
                <Input
                  label="E-mail"
                  icon={<EnvelopeSimpleIcon size={20} />}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="seu@email.com"
                />
                <Button
                  isLoading={isLoading}
                  label="Enviar código"
                  icon={<PaperPlaneTiltIcon size={20} weight="bold" />}
                />
                Icon
              </div>
            </form>
          )}

          {/* PASSO 2: VERIFICAÇÃO */}
          {step === "VERIFY" && (
            <form
              onSubmit={handleVerifyCode}
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">
                  Verifique seu <span className="text-blue-600">e-mail.</span>
                </h1>
                <p className="text-neutral-400 text-sm font-medium">
                  Inserimos um código de 6 dígitos em sua caixa de entrada.
                </p>
              </div>
              <div className="space-y-4">
                <Input
                  label="Código de Segurança"
                  icon={<ShieldCheckIcon size={20} />}
                  type="text"
                  value={code}
                  onChange={setCode}
                  placeholder="000000"
                />
                <Button
                  isLoading={isLoading}
                  label="Validar código"
                  icon={<KeyIcon size={20} weight="bold" />}
                />
                <button
                  type="button"
                  onClick={() => setStep("REQUEST")}
                  className="w-full text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  Reenviar e-mail
                </button>
              </div>
            </form>
          )}

          {/* PASSO 3: NOVA SENHA */}
          {step === "RESET" && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">
                  Nova <span className="text-blue-600">senha.</span>
                </h1>
                <p className="text-neutral-400 text-sm font-medium">
                  Crie uma senha forte para proteger sua conta.
                </p>
              </div>
              <div className="space-y-4">
                <Input
                  label="Nova Senha"
                  icon={<LockLaminatedIcon size={20} />}
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                />
                <Input
                  label="Confirmar Senha"
                  icon={<CheckCircleIcon size={20} />}
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="••••••••"
                />
                <Button
                  isLoading={isLoading}
                  label="Redefinir senha"
                  icon={<LockLaminatedIcon size={20} weight="bold" />}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Subcomponentes para manter o código limpo
function Input({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          required
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-medium"
        />
      </div>
    </div>
  );
}

function Button({
  isLoading,
  label,
  icon,
}: {
  isLoading: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      disabled={isLoading}
      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-neutral-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {label} {icon}
        </>
      )}
    </button>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LockIcon,
  KeyIcon,
  CheckCircleIcon,
  XIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react";
import { toast } from "react-toastify";
import { API_URL } from "@/config/env";

export function ChangePasswordDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showStatus, setShowStatus] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const toggleVisibility = (field: keyof typeof showStatus) => {
    setShowStatus((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // --- Lógica de Força da Senha ---
  const passwordStrength = useMemo(() => {
    const pwd = formData.newPassword;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length > 6) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  }, [formData.newPassword]);

  const strengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("As novas senhas não coincidem.");
    }

    if (passwordStrength < 50) {
      return toast.error(
        "Sua senha é muito fraca. Tente misturar letras e números.",
      );
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        // Enviamos o objeto completo. Se o backend evoluir, ele já recebe o necessário.
        body: JSON.stringify({
          currentPassword: formData.currentPassword, // Para segurança futura
          password: formData.newPassword,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar senha.");

      toast.success("Senha alterada com sucesso! ✨");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative h-full w-full max-w-md bg-white shadow-2xl flex flex-col z-110 animate-in slide-in-from-right duration-500 ease-out">
        <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-900 rounded-xl text-white">
              <ShieldCheckIcon size={24} weight="bold" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">
                Segurança
              </h2>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                Alterar Senha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-50 rounded-xl text-neutral-400 active:scale-90 transition-all"
          >
            <XIcon size={24} weight="bold" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 p-8 space-y-6 overflow-y-auto"
        >
          <div className="space-y-4">
            <PasswordField
              label="Senha Atual"
              icon={<KeyIcon size={20} weight="bold" />}
              value={formData.currentPassword}
              show={showStatus.current}
              toggleShow={() => toggleVisibility("current")}
              onChange={(val) =>
                setFormData({ ...formData, currentPassword: val })
              }
              activeColor="group-focus-within:text-neutral-900"
            />

            <hr className="border-neutral-50 my-2" />

            <div className="space-y-1">
              <PasswordField
                label="Nova Senha"
                icon={<LockIcon size={20} weight="bold" />}
                value={formData.newPassword}
                show={showStatus.new}
                toggleShow={() => toggleVisibility("new")}
                onChange={(val) =>
                  setFormData({ ...formData, newPassword: val })
                }
                activeColor="group-focus-within:text-blue-600"
              />
              {/* Barra de Força */}
              <div className="px-1 pt-1">
                <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${strengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">
                  Força da senha
                </p>
              </div>
            </div>

            <PasswordField
              label="Confirmar Senha"
              icon={<CheckCircleIcon size={20} weight="bold" />}
              value={formData.confirmPassword}
              show={showStatus.confirm}
              toggleShow={() => toggleVisibility("confirm")}
              onChange={(val) =>
                setFormData({ ...formData, confirmPassword: val })
              }
              activeColor="group-focus-within:text-blue-600"
            />
          </div>
        </form>

        <div className="p-8 border-t border-neutral-50 bg-white">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              (formData.newPassword.length > 0 && passwordStrength < 50)
            }
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-neutral-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Atualizar Senha"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  icon,
  value,
  onChange,
  show,
  toggleShow,
  activeColor,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  toggleShow: () => void;
  activeColor: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 ${activeColor} transition-colors`}
        >
          {icon}
        </div>
        <input
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-4 pl-12 pr-12 outline-none focus:ring-4 focus:ring-neutral-50 focus:border-neutral-200 transition-all font-medium placeholder:text-neutral-300"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-1"
        >
          {show ? (
            <EyeSlashIcon size={20} weight="bold" />
          ) : (
            <EyeIcon size={20} weight="bold" />
          )}
        </button>
      </div>
    </div>
  );
}

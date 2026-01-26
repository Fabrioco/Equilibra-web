"use client";

import { API_URL } from "@/config/env";
import { useAuth } from "@/contexts/auth-context";
import {
  XIcon,
  UserIcon,
  EnvelopeIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export function UserSettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout, initializeAuth } = useAuth();

  // Estados locais para edição
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Sincroniza os campos quando o drawer abre ou o user muda
  useEffect(() => {
    if (open && user) {
      queueMicrotask(() => {
        setName(user.name || "");
        setEmail(user.email || "");
      });
    }
  }, [open, user]);

  // Atalho ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock Scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Verifica se houve alteração para habilitar o botão
  const hasChanges = name !== user?.name || email !== user?.email;

  const handleSaveChanges = async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.message === "Email already in use") {
        toast.error("E-mail já está em uso por outra conta.");
        return;
      }
      toast.error("Erro ao atualizar perfil.");
      console.log(await res.json());
      return;
    }

    if (res.ok) {
      toast.success("Perfil atualizado com sucesso!");
      onClose();
      initializeAuth();
    } else {
      // Tratar erro
      console.error("Erro ao atualizar perfil");
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm min-h-screen transition-opacity z-100 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full sm:w-105 bg-white z-101 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Meu Perfil</h2>
            <p className="text-xs text-neutral-400 font-medium">
              Gerencie suas informações
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-xl transition text-neutral-400 hover:text-neutral-900"
          >
            <XIcon size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-100px)]">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-neutral-900 flex items-center justify-center text-white text-3xl font-bold shadow-xl transition-transform group-hover:scale-105">
                {user?.name
                  ? [
                      user.name.charAt(0).toUpperCase(),
                      user.name.split(" ").at(-1)?.charAt(0).toUpperCase(),
                    ].join("")
                  : "?"}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-0.1em">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  size={20}
                />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-neutral-900 outline-none transition focus:bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-0.1em">
                E-mail institucional
              </label>
              <div className="relative">
                <EnvelopeIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  size={20}
                />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-neutral-900 outline-none transition focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 space-y-3">
            <button
              disabled={!hasChanges}
              className={`w-full py-4 rounded-2xl font-bold transition all shadow-lg active:scale-[0.98] ${
                hasChanges
                  ? "bg-neutral-900 text-white shadow-neutral-200 hover:bg-neutral-800"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none"
              }`}
              onClick={handleSaveChanges}
            >
              Salvar alterações
            </button>

            <button
              onClick={logout}
              className="w-full py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition flex items-center justify-center gap-2 group"
            >
              <SignOutIcon
                size={18}
                weight="bold"
                className="group-hover:translate-x-1 transition-transform"
              />
              Sair da conta
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

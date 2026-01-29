"use client";

import { useState, useEffect } from "react";
import {
  UserCircleIcon,
  CameraIcon,
  LockIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeSlashIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "react-toastify";
import { API_URL } from "@/config/env";
import { ChangePasswordDrawer } from "../_components/ui/change-password-drawer";

export default function ProfilePage() {
  const { user, logout, updateUserData } = useAuth();

  // Estados Locais para os Switches
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState<boolean>(false);

  // Sincroniza estados locais com os dados do Contexto/Banco
  useEffect(() => {
    if (user) {
      setIsPrivacyMode(user.privacyMode);
      setEnableNotifications(user.enableNotifications);
    }
  }, [user?.privacyMode, user?.enableNotifications]);

  // 1. Função Genérica para os Switches (Auto-save)
  const updatePreference = async (
    field: "privacyMode" | "enableNotifications",
    value: boolean,
  ) => {
    console.log("Updating", field, "to", value);
    try {
      // Feedback visual imediato
      if (field === "privacyMode") setIsPrivacyMode(value);
      if (field === "enableNotifications") setEnableNotifications(value);

      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [field]: value }), // Envia apenas o campo alterado (Zod partial)
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      // Atualiza contexto global
      if (updateUserData) await updateUserData(data);
      toast.success("Preferência salva! ✨");
    } catch (error) {
      // Reverte o estado local em caso de falha
      if (field === "privacyMode") setIsPrivacyMode(!value);
      if (field === "enableNotifications") setEnableNotifications(!value);
      toast.error("Erro ao salvar preferência.");
    }
  };

  // 2. Salvar Dados do Formulário de Texto (Nome)
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);
    const updatedName = formData.get("fullName") as string;

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: updatedName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao atualizar");

      if (updateUserData) await updateUserData(data);
      toast.success("Perfil atualizado! ✨");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const userInitial = user?.name
    ? `${user.name.split(" ")[0]?.charAt(0)}${user.name.split(" ").length > 1 ? user.name.split(" ").at(-1)?.charAt(0) : ""}`.toUpperCase()
    : "U";

  return (
    <div className="min-h-screen w-full bg-neutral-50/50 pb-20">
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
            Meu Perfil
          </h1>
          <p className="text-sm text-neutral-400 font-medium">
            Gerencie suas informações e preferências
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA ESQUERDA */}
          <div className="space-y-6">
            <div className="bg-white rounded-4xl p-8 shadow-sm border border-neutral-100 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 bg-neutral-900 rounded-[40px] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-transform group-hover:scale-105">
                  {userInitial}
                </div>
                <button className="absolute bottom-0 right-0 p-3 bg-white border border-neutral-100 rounded-2xl shadow-lg text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all">
                  <CameraIcon size={20} weight="bold" />
                </button>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-black text-neutral-900">
                  {user?.name || "Usuário"}
                </h2>
                <p className="text-sm text-neutral-400 font-bold">
                  {user?.email || "email@exemplo.com"}
                </p>
              </div>

              <div className="w-full pt-8 mt-8 border-t border-neutral-50 space-y-3">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95"
                >
                  <SignOutIcon size={18} weight="bold" /> Sair da Conta
                </button>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-4xl p-6 shadow-xl text-white relative overflow-hidden group">
              <span className="opacity-50 text-[10px] font-black uppercase tracking-[0.2em]">
                Plano Atual
              </span>
              <div className="flex justify-between items-center mt-2">
                <p className="text-2xl font-black tracking-tight">
                  {user?.plan || "FREE"}
                </p>
                <button className="text-[10px] font-black uppercase bg-white/10 px-4 py-2 rounded-xl border border-white/20 hover:bg-white text-neutral-900 transition-all">
                  Upgrade
                </button>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="bg-white rounded-4xl p-8 shadow-sm border border-neutral-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-neutral-100 rounded-xl text-neutral-900">
                    <UserCircleIcon size={24} weight="bold" />
                  </div>
                  <h3 className="text-lg font-black text-neutral-900">
                    Dados Pessoais
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">
                      Nome Completo
                    </label>
                    <input
                      name="fullName"
                      defaultValue={user?.name}
                      placeholder="Seu nome"
                      className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">
                      E-mail
                    </label>
                    <input
                      disabled
                      defaultValue={user?.email}
                      className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none font-medium opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-10 py-4 bg-neutral-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition shadow-xl shadow-neutral-200 disabled:opacity-50 active:scale-95"
                >
                  {isUpdating ? "Salvando..." : "Salvar Dados"}
                </button>
              </div>
            </form>
            <div className="bg-white rounded-4xl p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-neutral-100 rounded-xl text-neutral-900">
                  <ShieldCheckIcon size={24} weight="bold" />
                </div>
                <h3 className="text-lg font-black text-neutral-900">
                  Preferências
                </h3>
              </div>

              <div className="space-y-4">
                {/* Switch Modo Privacidade */}
                <div className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-100 group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <EyeSlashIcon
                        size={20}
                        weight="bold"
                        className="text-neutral-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-black text-neutral-900 uppercase tracking-tight">
                        Modo Privacidade
                      </p>
                      <p className="text-xs text-neutral-400 font-medium">
                        Ocultar saldos na tela inicial
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updatePreference("privacyMode", !isPrivacyMode)
                    }
                    className={`w-12 h-6 rounded-full relative p-1 transition-all duration-300 ${isPrivacyMode ? "bg-green-500" : "bg-neutral-300"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isPrivacyMode ? "translate-x-6" : "translate-x-0"}`}
                    />
                  </button>
                </div>

                {/* Switch Notificações */}
                <div className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-100 group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <BellIcon
                        size={20}
                        weight="bold"
                        className="text-neutral-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-black text-neutral-900 uppercase tracking-tight">
                        Notificações
                      </p>
                      <p className="text-xs text-neutral-400 font-medium">
                        Alertas de gastos e metas
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updatePreference(
                        "enableNotifications",
                        !enableNotifications,
                      )
                    }
                    className={`w-12 h-6 rounded-full relative p-1 transition-all duration-300 ${enableNotifications ? "bg-green-500" : "bg-neutral-300"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${enableNotifications ? "translate-x-6" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
            {/* SEGURANÇA */}
            <div className="bg-white rounded-4xl p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-neutral-100 rounded-xl text-neutral-900">
                  <LockIcon size={24} weight="bold" />
                </div>
                <h3 className="text-lg font-black text-neutral-900">
                  Segurança
                </h3>
              </div>

              {/* Ao clicar, abre o modal/drawer */}
              <button
                onClick={() => setOpenChangePassword(true)} // Crie esse estado
                className="flex items-center justify-between w-full p-6 bg-neutral-50 border border-neutral-100 rounded-2xl hover:border-neutral-900 transition-all group active:scale-[0.99]"
              >
                <div className="text-left">
                  <span className="text-sm font-black text-neutral-900 uppercase tracking-widest block">
                    Alterar Senha de Acesso
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">
                    Recomendamos trocar a cada 3 meses
                  </span>
                </div>
                <LockIcon
                  size={20}
                  className="text-neutral-400 group-hover:text-neutral-900 transition-colors"
                />
              </button>
            </div>{" "}
          </div>
        </div>
      </div>
      <ChangePasswordDrawer
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
      />
    </div>
  );
}

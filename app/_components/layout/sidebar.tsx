"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPieSliceIcon,
  TargetIcon,
  ArrowsLeftRightIcon,
  UserCircleIcon,
  HouseIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/auth-context";

const menuItems = [
  { label: "Início", icon: HouseIcon, href: "/" },
  { label: "Transações", icon: ArrowsLeftRightIcon, href: "/transactions" }, // Ajuste o link conforme seu app
  { label: "Metas", icon: TargetIcon, href: "/goals" },
  { label: "Perfil", icon: UserCircleIcon, href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  const { user } = useAuth();

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  const isAuthPage =
    pathname === "/auth/login" || pathname === "/auth/register";

  if (isAuthPage) return null;

  return (
    <>
      {/* SIDEBAR DESKTOP - Agora como uma coluna fixa que ocupa espaço */}
      <aside className="hidden md:flex flex-col w-28 h-screen sticky top-0 bg-neutral-50/50 border-r border-neutral-100 py-8 items-center justify-between z-50">
        {/* Logo Superior */}
        <div className="p-3 bg-neutral-900 rounded-2xl shadow-lg shadow-neutral-200">
          <ChartPieSliceIcon size={28} weight="fill" className="text-white" />
        </div>

        {/* Menu Central - Com visual de cápsula */}
        <nav className="flex flex-col gap-4 bg-white p-3 rounded-4xl border border-neutral-100 shadow-sm">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`p-4 rounded-[20px] transition-all duration-300 group relative ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-md"
                    : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                <item.icon size={24} weight={isActive ? "bold" : "regular"} />

                {/* Tooltip Lateral Refinado */}
                <span className="absolute left-full ml-4 px-3 py-2 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all -translate-x-2.5 group-hover:translate-x-0 z-60 whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-4">
          <button
            title="Configurações do Perfil"
            className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 font-black text-sm hover:border-neutral-900 transition-all shadow-sm active:scale-95"
          >
            {/* Mostra a inicial do usuário ou um ícone se não houver nome */}
            {user?.name ? userInitial : <UserCircleIcon size={24} />}
          </button>
        </div>
      </aside>
      {/* MOBILE BOTTOM NAV - Versão Corrigida */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-neutral-100 z-50 px-4 pt-3 flex justify-around items-center  shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${
                isActive ? "text-neutral-900 scale-105" : "text-neutral-400"
              }`}
            >
              <item.icon size={22} weight={isActive ? "bold" : "regular"} />
              <span className="text-[9px] font-black uppercase tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

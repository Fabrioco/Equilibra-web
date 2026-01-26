"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoginResponse } from "@/app/auth/types/auth.types";
import { ERROR_TRANSLATIONS } from "@/app/auth/constants/error-messages";
import { API_URL } from "@/config/env";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // Útil para evitar flash de tela de login
  login: (email: string, password: string) => Promise<void>;
  register: (formData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  initializeAuth: () => Promise<void>;
}

type User = {
  id: number;
  name: string;
  email: string;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  const initializeAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          // Token inválido ou expirado
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        // Erro de rede ou outro erro
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 1. Tenta pegar a primeira mensagem de erro do Zod (ex: password ou email)
        const errors = data.errors as Record<string, string[]> | undefined;
        const firstZodError =
          errors && typeof errors === "object"
            ? Object.values(errors)[0]?.[0]
            : null;

        // 2. Usa a tradução para o erro do Zod ou para a mensagem geral
        const rawError =
          firstZodError || data.message || "Falha ao realizar login";
        const translated = ERROR_TRANSLATIONS[rawError] || rawError;

        toast.error(translated);
        setIsLoading(false);
        return;
      }

      const loginData = data as LoginResponse;
      toast.success(`Bem-vindo de volta, ${loginData.user.name}!`);
      localStorage.setItem("token", loginData.token);
      setIsAuthenticated(true);
      setUser(loginData.user);
      router.push("/");
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Lógica de tradução que você já fez (mantida)
        const errors = data.errors as Record<string, string[]> | undefined;
        const rawError =
          (errors ? Object.values(errors)[0]?.[0] : null) ||
          data.message ||
          "Erro";
        const translated = ERROR_TRANSLATIONS[rawError] || rawError;
        toast.error(translated);
        return;
      }

      toast.success("Conta criada! Redirecionando...");
    } catch {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        user,
        initializeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

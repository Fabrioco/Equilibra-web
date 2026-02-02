"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoginResponse } from "@/app/auth/types/auth.types";
import { ERROR_TRANSLATIONS } from "@/app/auth/constants/error-messages";
import { fetchApi } from "@/lib/api";

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
  updateUserData: (data: Partial<User>) => Promise<void>;
}

type User = {
  id: number;
  name: string;
  email: string;
  plan: string;
  privacyMode: boolean;
  enableNotifications: boolean;
  createdAt: string;
  updatedAt: string;
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
        const { data: userData, ok } = await fetchApi<User>("/auth/me", {
          method: "GET",
        });

        if (ok) {
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
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
      const { data, ok } = await fetchApi<LoginResponse>("/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });

      if (!ok) {
        const errors = data.errors as Record<string, string[]> | undefined;
        const firstZodError =
          errors && typeof errors === "object"
            ? Object.values(errors)[0]?.[0]
            : null;
        const rawError =
          firstZodError || (data as { message?: string }).message || "Falha ao realizar login";
        toast.error(ERROR_TRANSLATIONS[rawError] || rawError);
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
      const { data, ok } = await fetchApi<LoginResponse>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify(formData),
      });

      if (!ok) {
        const errors = (data as { errors?: Record<string, string[]> }).errors;
        const rawError =
          (errors ? Object.values(errors)[0]?.[0] : null) ||
          (data as { message?: string }).message ||
          "Erro";
        toast.error(ERROR_TRANSLATIONS[rawError] || rawError);
        return;
      }

      const registerData = data as LoginResponse;
      localStorage.setItem("token", registerData.token);
      setIsAuthenticated(true);
      setUser(registerData.user);
      toast.success("Conta criada! Redirecionando...");
      router.push("/");
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

  const updateUserData = async (data: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      // Faz o merge dos dados antigos com os novos campos
      return { ...prevUser, ...data };
    });
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
        updateUserData,
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

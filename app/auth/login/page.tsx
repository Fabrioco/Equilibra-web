"use client";

import Link from "next/link";
import React from "react";
import { toast } from "react-toastify";
import { LoginForm } from "../components/login-form";
import { LoginResponse } from "../types/auth.types";
import { ERROR_TRANSLATIONS } from "../constants/error-messages";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) return;

    setErrorMessage(null); // Reseta erro ao tentar novamente
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3333/v1/auth/login", {
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
        return;
      }

      const loginData = data as LoginResponse;
      toast.success(`Bem-vindo de volta, ${loginData.user.name}!`);
      localStorage.setItem("token", loginData.token);
      router.push("/");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro interno do servidor, fique à vontade para tentar novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Seja Bem-vindo</h1>
          <p className="text-gray-500 text-sm mt-1">
            Entre com suas credenciais para acessar
          </p>
        </div>

        {/* Alerta de Erro */}
        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
            {errorMessage}
          </div>
        )}

        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          handleLogin={handleLogin}
        />

        <p className="text-sm text-center text-gray-600">
          Não possui uma conta?{" "}
          <Link
            href="/auth/register"
            className="text-black font-bold hover:underline underline-offset-4"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

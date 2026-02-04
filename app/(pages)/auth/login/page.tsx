"use client";

import Link from "next/link";
import React from "react";
import { LoginForm } from "../components/login-form";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { login } = useAuth();

  async function handleLogin() {
    if (!email || !password) return;

    setErrorMessage(null); // Reseta erro ao tentar novamente
    setIsLoading(true);

    try {
      await login(email, password);
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

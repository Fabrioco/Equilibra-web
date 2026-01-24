"use client";

import Link from "next/link";
import React from "react";
import { EyeClosedIcon, EyeIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { toast } from "react-toastify";

// Tipagem para a resposta do seu backend NestJS
export type LoginResponse = {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

const errorTranslations: Record<string, string> = {
  "Invalid credentials": "Credenciais inválidas. Verifique seu e-mail e senha.",
  "User not found": "Usuário não encontrado. Verifique seu e-mail.",
  "Password must be at least 8 characters":
    "A senha deve ter pelo menos 8 caracteres.",
  "Invalid password": "Senha inválida.",
  "Invalid email": "E-mail inválido.",
  // Adicione mais traduções conforme necessário
};

export default function LoginPage() {
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
        const translated = errorTranslations[rawError] || rawError;

        toast.error(translated);
        return;
      }

      const loginData = data as LoginResponse;
      toast.success(`Bem-vindo de volta, ${loginData.user.name}!`);
      console.log("Login realizado com sucesso:", loginData);
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

        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="flex flex-col gap-5">
            {/* Input de Email */}
            <div className="relative group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full bg-white border border-gray-300 px-4 py-3 rounded-lg outline-none transition-all focus:border-black focus:ring-1 focus:ring-black text-gray-700 placeholder-transparent"
              />
              <label
                htmlFor="email"
                className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4
                peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-black font-medium pointer-events-none"
              >
                E-mail
              </label>
            </div>

            {/* Input de Senha */}
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full bg-white border border-gray-300 px-4 py-3 rounded-lg outline-none transition-all focus:border-black focus:ring-1 focus:ring-black text-gray-700 placeholder-transparent pr-12"
              />
              <label
                htmlFor="password"
                className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4
                peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-black font-medium pointer-events-none"
              >
                Senha
              </label>

              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors p-1"
              >
                {showPassword ? (
                  <EyeIcon size={20} weight="bold" />
                ) : (
                  <EyeClosedIcon size={20} weight="bold" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/no-auth/forgot-password"
              className="text-xs text-gray-500 hover:text-black transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-black text-white py-3 rounded-lg w-full font-bold uppercase tracking-wide hover:bg-gray-800 active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-h-13"
          >
            {isLoading ? (
              <CircleNotchIcon className="w-6 h-6 animate-spin text-white" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>

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

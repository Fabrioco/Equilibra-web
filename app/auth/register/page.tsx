"use client";
import React from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { RegisterForm } from "../components/register-form";
import { ERROR_TRANSLATIONS } from "../constants/error-messages";

// --- Página Principal ---
export default function RegisterPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Foco automático no nome ao abrir a página
  const nameRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => nameRef.current?.focus(), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const isFormValid =
    formData.name && formData.email && formData.password && isChecked;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3333/v1/auth/register", {
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
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Crie sua conta
          </h1>
          <p className="text-gray-500">
            Comece sua jornada conosco hoje mesmo.
          </p>
        </header>

        <RegisterForm
          nameRef={nameRef}
          formData={formData}
          handleChange={handleChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isChecked={isChecked}
          setIsChecked={setIsChecked}
          isLoading={isLoading}
          handleRegister={handleRegister}
          isFormValid={isFormValid}
        />

        <footer className="text-center text-sm text-gray-500">
          Já tem uma conta?{" "}
          <Link
            href="/auth/login"
            className="text-black font-bold hover:underline"
          >
            Entrar
          </Link>
        </footer>
      </div>
    </div>
  );
}

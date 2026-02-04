"use client";
import React from "react";
import Link from "next/link";
import { RegisterForm } from "../components/register-form";
import { useAuth } from "@/contexts/auth-context";

// --- Página Principal ---
export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);

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
    await register(formData);
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

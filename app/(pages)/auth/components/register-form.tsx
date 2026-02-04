import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Input } from "./input";
import { Button } from "./button";

type RegisterFormProps = Readonly<{
  nameRef: React.RefObject<HTMLInputElement | null>;
  formData: {
    name: string;
    email: string;
    password: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isChecked: boolean;
  setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  handleRegister: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isFormValid: boolean | string;
}>;

export function RegisterForm({
  nameRef,
  formData,
  handleChange,
  showPassword,
  setShowPassword,
  isChecked,
  setIsChecked,
  isLoading,
  handleRegister,
}: RegisterFormProps) {
  return (
    <form onSubmit={handleRegister} className="space-y-5">
      <Input
        ref={nameRef}
        label="Nome Completo"
        id="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <Input
        label="E-mail"
        id="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <Input
        label="Senha"
        id="password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
        autoComplete="new-password"
        required
        icon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-black transition-colors"
          >
            {showPassword ? (
              <EyeIcon size={20} weight="bold" />
            ) : (
              <EyeClosedIcon size={20} weight="bold" />
            )}
          </button>
        }
      />

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
        />
        <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
          Eu aceito os{" "}
          <Link href="#" className="text-black font-semibold hover:underline">
            Termos
          </Link>{" "}
          e a{" "}
          <Link href="#" className="text-black font-semibold hover:underline">
            Privacidade
          </Link>
          .
        </label>
      </div>

      <Button isLoading={isLoading}>Registrar</Button>
    </form>
  );
}

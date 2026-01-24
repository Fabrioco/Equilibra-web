import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Input } from "./input";
import { Button } from "./button";

type LoginFormProps = Readonly<{
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  handleLogin: () => Promise<void>;
}>;

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  handleLogin,
}: LoginFormProps) {
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <div className="flex flex-col gap-5">
        {/* Input de Email */}
        <Input
          label="E-mail"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Input de Senha */}
        <Input
          label="Senha"
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          icon={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-black transition-colors p-1"
            >
              {showPassword ? (
                <EyeIcon size={20} weight="bold" />
              ) : (
                <EyeClosedIcon size={20} weight="bold" />
              )}
            </button>
          }
        />
      </div>

      <div className="flex justify-end">
        <Link
          href="/no-auth/forgot-password"
          className="text-xs text-gray-500 hover:text-black transition-colors"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <Button isLoading={isLoading}>Entrar</Button>
    </form>
  );
}

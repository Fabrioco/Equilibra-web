import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/contexts/auth-context";
import { Sidebar } from "./_components/layout/sidebar";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance App",
  description: "Aplicativo de gestão financeira",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.className} bg-neutral-50 antialiased`}>
        <AuthProvider>
          {/* Wrapper Principal: 
            flex-row no desktop para Sidebar + Conteúdo 
            flex-col no mobile para Conteúdo + Bottom Nav
          */}
          <div className="flex flex-col md:flex-row min-h-screen">
            {/* Sidebar fixa ou barra inferior no mobile */}
            <Sidebar />

            {/* Área do Conteúdo:
              flex-1 faz ele ocupar todo o espaço restante.
              A largura máxima e o margin auto mantêm o Dashboard elegante.
            */}
            <main className="flex-1 w-full relative">{children}</main>
          </div>

          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </body>
    </html>
  );
}

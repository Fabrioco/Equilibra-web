import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/contexts/auth-context";

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
      <body
        className={`${montserrat.className} bg-gray-100 px-4 mx-auto flex min-h-screen flex-col items-center justify-center antialiased`}
      >
        <AuthProvider>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </body>
    </html>
  );
}

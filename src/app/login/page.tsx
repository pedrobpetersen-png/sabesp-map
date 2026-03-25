"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage =
    error === "domain"
      ? "Acesso restrito a e-mails @sabesp.com.br e @emae.com.br"
      : error
        ? "Erro ao fazer login. Tente novamente."
        : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#005BAA]/10 via-white to-[#00A651]/10">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-xl bg-[#005BAA] flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#005BAA] mb-1">
          SABESP
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Mapa do Saneamento | Estado de São Paulo
        </p>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {errorMessage}
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Entrar com Google
        </button>

        <p className="mt-6 text-xs text-gray-400">
          Acesso restrito a colaboradores SABESP e EMAE
        </p>
        <p className="mt-1 text-xs text-gray-300">
          Domínios permitidos: @sabesp.com.br e @emae.com.br
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#005BAA] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

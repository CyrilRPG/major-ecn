'use client';

import { useState, type FormEvent } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const CODE = 'rattrapagesrelou';
const STORAGE_KEY = 'prive-auth';

export function usePriveAuth() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === CODE;
}

export function CodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.trim().toLowerCase() === CODE) {
      localStorage.setItem(STORAGE_KEY, CODE);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFE] px-4">
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg ${shake ? 'animate-shake' : ''}`}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <Lock className="h-7 w-7 text-[#C0112E]" />
        </div>

        <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[#C0112E]">
          Major ECN
        </p>

        <h1 className="mt-2 text-center text-xl font-extrabold tracking-tight text-[#0F1F4D]">
          Espace Nephrologie
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Veuillez entrer le code d&apos;acces
        </p>

        <div className="mt-6">
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            placeholder="Code d'acces"
            autoFocus
            className="w-full rounded-xl border border-gray-200 bg-[#FAFBFE] px-4 py-3 text-center text-sm text-[#0F1F4D] placeholder:text-gray-400 outline-none transition-colors focus:border-[#C0112E] focus:ring-2 focus:ring-[#C0112E]/20"
          />
          {error && (
            <p className="mt-2 text-center text-xs font-medium text-[#C0112E]">
              Code incorrect
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C0112E] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#a00f27] hover:shadow-md"
        >
          Acceder
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="h-3 w-3" />
          Espace confidentiel
        </div>
      </form>
    </div>
  );
}
